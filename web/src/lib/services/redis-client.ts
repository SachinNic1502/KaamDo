import { createHmac } from "node:crypto";
import { ApiError } from "../api-error";
import { createClient, RedisClientType } from "redis";

// Redis client for OTP storage and caching
let redisClient: RedisClientType | null = null;
let connecting: Promise<void> | null = null;
let lastFailureTime = 0;
const FAILURE_COOLDOWN_MS = 15000; // 15s cooldown before re-attempting connection if offline

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export async function getRedisClient(): Promise<RedisClientType> {
  // If recently failed to connect, fail fast to allow graceful memory fallback without hanging
  if (Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
    throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE");
  }

  if (!redisClient) {
    const client = createClient({
      url: REDIS_URL,
      disableOfflineQueue: true,
      socket: { connectTimeout: 1000, reconnectStrategy: false },
    });

    client.on("error", () => {
      // Offline notice - fallback handles operation
    });

    connecting = client
      .connect()
      .then(() => {
        redisClient = client as RedisClientType;
      })
      .catch((err) => {
        lastFailureTime = Date.now();
        redisClient = null;
        throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE");
      });
  }

  if (connecting) {
    try {
      await connecting;
    } catch {
      throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE");
    }
  }

  if (!redisClient?.isReady) {
    redisClient = null;
    throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE");
  }

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // ignore
    }
    redisClient = null;
  }
}

// In-Memory Fallback Stores (persisted on globalThis to survive Next.js HMR & module reloads)
interface GlobalMemoryStores {
  __memoryOtpStore?: Map<string, OtpData>;
  __memoryVerifiedCache?: Map<string, { hash: string; expiresAt: number }>;
  __memoryPasswordAttempts?: Map<string, { count: number; resetAt: number }>;
  __memoryCooldown?: Map<string, { lastSent: number; hourlyCount: number; hourResetAt: number }>;
  __memoryCacheStore?: Map<string, { value: any; expiresAt: number }>;
  __memorySessionStore?: Map<string, { data: any; expiresAt: number }>;
}

const gMem = globalThis as unknown as GlobalMemoryStores;
const memoryOtpStore = gMem.__memoryOtpStore || (gMem.__memoryOtpStore = new Map<string, OtpData>());
const memoryVerifiedCache = gMem.__memoryVerifiedCache || (gMem.__memoryVerifiedCache = new Map());
const memoryPasswordAttempts = gMem.__memoryPasswordAttempts || (gMem.__memoryPasswordAttempts = new Map());
const memoryCooldown = gMem.__memoryCooldown || (gMem.__memoryCooldown = new Map());
const memoryCacheStore = gMem.__memoryCacheStore || (gMem.__memoryCacheStore = new Map());
const memorySessionStore = gMem.__memorySessionStore || (gMem.__memorySessionStore = new Map());

// OTP storage operations using Redis with automatic in-memory fallback
export interface OtpData {
  otp: string;
  expiresAt: number;
  attempts: number;
  phone: string;
}

export class OtpStorage {
  private static readonly OTP_PREFIX = "otp:";
  private static readonly OTP_TTL = 300; // 5 minutes in seconds
  private static readonly MAX_ATTEMPTS = 3;

  private static digest(phone: string, otp: string): string {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET required");
    return createHmac("sha256", process.env.JWT_SECRET).update(phone + ":" + otp).digest("hex");
  }

  static async reservePasswordAttempt(phone: string): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      const client = await getRedisClient();
      const count = await client.eval(
        `local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end
return n`,
        { keys: ["login:attempts:" + phone], arguments: [] }
      );
      if (Number(count) > 10) throw new ApiError(429, "Please try again later", "LOGIN_RATE_LIMITED");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) throw err;

      // In-memory fallback
      const now = Date.now();
      const record = memoryPasswordAttempts.get(phone);
      if (!record || now > record.resetAt) {
        memoryPasswordAttempts.set(phone, { count: 1, resetAt: now + 900 * 1000 });
      } else {
        record.count++;
        if (record.count > 10) {
          throw new ApiError(429, "Please try again later", "LOGIN_RATE_LIMITED");
        }
      }
    }
  }

  static async reserveSend(phone: string): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    try {
      const client = await getRedisClient();
      const result = await client.eval(
        `local count = tonumber(redis.call('GET', KEYS[2]) or '0')
if count >= 5 or redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('SET', KEYS[1], '1', 'EX', 60)
local n = redis.call('INCR', KEYS[2])
if n == 1 then redis.call('EXPIRE', KEYS[2], 3600) end
return 1`,
        { keys: ["otp:cooldown:" + phone, "otp:hour:" + phone], arguments: [] }
      );
      if (result !== 1) throw new ApiError(429, "Please wait before requesting another OTP", "OTP_RATE_LIMITED");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) throw err;

      // In-memory fallback
      const now = Date.now();
      let record = memoryCooldown.get(phone);
      if (!record || now > record.hourResetAt) {
        record = { lastSent: 0, hourlyCount: 0, hourResetAt: now + 3600 * 1000 };
        memoryCooldown.set(phone, record);
      }

      if (now - record.lastSent < 60 * 1000 || record.hourlyCount >= 5) {
        throw new ApiError(429, "Please wait before requesting another OTP", "OTP_RATE_LIMITED");
      }

      record.lastSent = now;
      record.hourlyCount++;
    }
  }

  static async storeOtp(phone: string, otp: string): Promise<void> {
    const data: OtpData = {
      otp: this.digest(phone, otp),
      expiresAt: Date.now() + this.OTP_TTL * 1000,
      attempts: 0,
      phone,
    };

    try {
      const client = await getRedisClient();
      const key = `${this.OTP_PREFIX}${phone}`;
      await client.setEx(key, this.OTP_TTL, JSON.stringify(data));
    } catch {
      // In-memory fallback
      memoryOtpStore.set(phone, data);
    }
  }

  static async getOtp(phone: string): Promise<OtpData | null> {
    try {
      const client = await getRedisClient();
      const key = `${this.OTP_PREFIX}${phone}`;
      const data = await client.get(key);
      if (!data) return null;

      const otpData: OtpData = JSON.parse(data);
      if (Date.now() > otpData.expiresAt) {
        await this.deleteOtp(phone);
        return null;
      }
      return otpData;
    } catch {
      // In-memory fallback
      const data = memoryOtpStore.get(phone);
      if (!data) return null;
      if (Date.now() > data.expiresAt) {
        memoryOtpStore.delete(phone);
        return null;
      }
      return data;
    }
  }

  static async verifyOtp(phone: string, providedOtp: string): Promise<boolean> {
    const hashedProvided = this.digest(phone, providedOtp);

    try {
      const client = await getRedisClient();
      const key = `${this.OTP_PREFIX}${phone}`;
      const result = await client.eval(
        `local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local data = cjson.decode(raw)
if data.attempts >= 3 then redis.call('DEL', KEYS[1]); return 0 end
if data.otp == ARGV[1] then redis.call('DEL', KEYS[1]); return 1 end
data.attempts = data.attempts + 1
if data.attempts >= 3 then redis.call('DEL', KEYS[1]) else redis.call('SET', KEYS[1], cjson.encode(data), 'KEEPTTL') end
return 0`,
        { keys: [key], arguments: [hashedProvided] }
      );
      if (result === 1) {
        memoryVerifiedCache.set(phone, { hash: hashedProvided, expiresAt: Date.now() + 15000 });
        return true;
      }
      // Check recent verification cache on Redis fallback as well
      const recent = memoryVerifiedCache.get(phone);
      if (recent && recent.hash === hashedProvided && Date.now() < recent.expiresAt) {
        return true;
      }
      return false;
    } catch {
      // In-memory fallback
      const data = memoryOtpStore.get(phone);
      if (!data) {
        // Check recent verification cache to absorb duplicate network requests
        const recent = memoryVerifiedCache.get(phone);
        if (recent && recent.hash === hashedProvided && Date.now() < recent.expiresAt) {
          return true;
        }
        return false;
      }

      if (Date.now() > data.expiresAt || data.attempts >= this.MAX_ATTEMPTS) {
        memoryOtpStore.delete(phone);
        return false;
      }

      if (data.otp === hashedProvided) {
        memoryOtpStore.delete(phone);
        memoryVerifiedCache.set(phone, { hash: hashedProvided, expiresAt: Date.now() + 15000 });
        return true;
      }

      data.attempts++;
      if (data.attempts >= this.MAX_ATTEMPTS) {
        memoryOtpStore.delete(phone);
      }
      return false;
    }
  }

  static async deleteOtp(phone: string): Promise<void> {
    try {
      const client = await getRedisClient();
      const key = `${this.OTP_PREFIX}${phone}`;
      await client.del(key);
    } catch {
      memoryOtpStore.delete(phone);
    }
  }

  static async cleanupExpiredOtps(): Promise<number> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(`${this.OTP_PREFIX}*`);
      let cleaned = 0;
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          const otpData: OtpData = JSON.parse(data);
          if (Date.now() > otpData.expiresAt) {
            await client.del(key);
            cleaned++;
          }
        }
      }
      return cleaned;
    } catch {
      let cleaned = 0;
      const now = Date.now();
      for (const [phone, data] of memoryOtpStore.entries()) {
        if (now > data.expiresAt) {
          memoryOtpStore.delete(phone);
          cleaned++;
        }
      }
      return cleaned;
    }
  }
}

// Generic cache operations with memory fallback
export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch {
      memoryCacheStore.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      const record = memoryCacheStore.get(key);
      if (!record) return null;
      if (Date.now() > record.expiresAt) {
        memoryCacheStore.delete(key);
        return null;
      }
      return record.value as T;
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      const client = await getRedisClient();
      await client.del(key);
    } catch {
      memoryCacheStore.delete(key);
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const client = await getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch {
      const record = memoryCacheStore.get(key);
      if (!record) return false;
      if (Date.now() > record.expiresAt) {
        memoryCacheStore.delete(key);
        return false;
      }
      return true;
    }
  }

  static async setWithPattern(pattern: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      for (const key of keys) {
        await client.setEx(key, ttl, JSON.stringify(value));
      }
    } catch {
      this.set(pattern, value, ttl);
    }
  }

  static async deletePattern(pattern: string): Promise<number> {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;
      return await client.del(keys);
    } catch {
      let count = 0;
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      for (const k of memoryCacheStore.keys()) {
        if (regex.test(k)) {
          memoryCacheStore.delete(k);
          count++;
        }
      }
      return count;
    }
  }
}

// Session storage with memory fallback
export class SessionStorage {
  private static readonly SESSION_PREFIX = "session:";
  private static readonly SESSION_TTL = 86400; // 24 hours in seconds

  static async setSession(sessionId: string, data: any): Promise<void> {
    try {
      const client = await getRedisClient();
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      await client.setEx(key, this.SESSION_TTL, JSON.stringify(data));
    } catch {
      memorySessionStore.set(sessionId, { data, expiresAt: Date.now() + this.SESSION_TTL * 1000 });
    }
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      const record = memorySessionStore.get(sessionId);
      if (!record) return null;
      if (Date.now() > record.expiresAt) {
        memorySessionStore.delete(sessionId);
        return null;
      }
      return record.data as T;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const client = await getRedisClient();
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      await client.del(key);
    } catch {
      memorySessionStore.delete(sessionId);
    }
  }

  static async refreshSession(sessionId: string): Promise<void> {
    try {
      const client = await getRedisClient();
      const key = `${this.SESSION_PREFIX}${sessionId}`;
      await client.expire(key, this.SESSION_TTL);
    } catch {
      const record = memorySessionStore.get(sessionId);
      if (record) {
        record.expiresAt = Date.now() + this.SESSION_TTL * 1000;
      }
    }
  }
}
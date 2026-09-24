import { createHmac } from "node:crypto";
import { ApiError } from "../api-error";
import { createClient, RedisClientType } from "redis";

// Redis client for OTP storage and caching
let redisClient: RedisClientType | null = null;
let connecting: Promise<void> | null = null;

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      url: REDIS_URL,
      disableOfflineQueue: true,
      socket: { connectTimeout: 5000, reconnectStrategy: false },
    });

    redisClient.on("error", (error) => {
      console.error("Redis connection unavailable");
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
    });

    const client = redisClient;
    connecting = client.connect().then(() => {}).catch(() => { redisClient = null; throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE"); });
  }

  if (connecting) await connecting;
  if (!redisClient?.isReady) { redisClient = null; throw new ApiError(503, "Authentication storage unavailable", "AUTH_UNAVAILABLE"); }
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// OTP storage operations using Redis
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
    const client = await getRedisClient();
    const count = await client.eval(`local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end
return n`, { keys: ["login:attempts:" + phone], arguments: [] });
    if (Number(count) > 10) throw new ApiError(429, "Please try again later", "LOGIN_RATE_LIMITED");
  }
  static async reserveSend(phone: string): Promise<void> {
    const client = await getRedisClient();
    const result = await client.eval(`local count = tonumber(redis.call('GET', KEYS[2]) or '0')
if count >= 5 or redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('SET', KEYS[1], '1', 'EX', 60)
local n = redis.call('INCR', KEYS[2])
if n == 1 then redis.call('EXPIRE', KEYS[2], 3600) end
return 1`, { keys: ["otp:cooldown:" + phone, "otp:hour:" + phone], arguments: [] });
    if (result !== 1) throw new ApiError(429, "Please wait before requesting another OTP", "OTP_RATE_LIMITED");
  }
  static async storeOtp(phone: string, otp: string): Promise<void> {
    const client = await getRedisClient();
    const key = `${this.OTP_PREFIX}${phone}`;
    
    const data: OtpData = {
      otp: this.digest(phone, otp),
      expiresAt: Date.now() + this.OTP_TTL * 1000,
      attempts: 0,
      phone,
    };

    await client.setEx(key, this.OTP_TTL, JSON.stringify(data));
  }

  static async getOtp(phone: string): Promise<OtpData | null> {
    const client = await getRedisClient();
    const key = `${this.OTP_PREFIX}${phone}`;
    
    const data = await client.get(key);
    if (!data) return null;

    const otpData: OtpData = JSON.parse(data);
    
    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      await this.deleteOtp(phone);
      return null;
    }

    return otpData;
  }

  static async verifyOtp(phone: string, providedOtp: string): Promise<boolean> {
    const client = await getRedisClient();
    const key = `${this.OTP_PREFIX}${phone}`;
    
    const result = await client.eval(`local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local data = cjson.decode(raw)
if data.attempts >= 3 then redis.call('DEL', KEYS[1]); return 0 end
if data.otp == ARGV[1] then redis.call('DEL', KEYS[1]); return 1 end
data.attempts = data.attempts + 1
if data.attempts >= 3 then redis.call('DEL', KEYS[1]) else redis.call('SET', KEYS[1], cjson.encode(data), 'KEEPTTL') end
return 0`, { keys: [key], arguments: [this.digest(phone, providedOtp)] });
    return result === 1;
  }

  static async deleteOtp(phone: string): Promise<void> {
    const client = await getRedisClient();
    const key = `${this.OTP_PREFIX}${phone}`;
    await client.del(key);
  }

  static async cleanupExpiredOtps(): Promise<number> {
    // Redis automatically handles TTL, but we can implement additional cleanup if needed
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
  }
}

// Generic cache operations
export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const client = await getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
  }

  static async get<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  static async delete(key: string): Promise<void> {
    const client = await getRedisClient();
    await client.del(key);
  }

  static async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  }

  static async setWithPattern(pattern: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    for (const key of keys) {
      await client.setEx(key, ttl, JSON.stringify(value));
    }
  }

  static async deletePattern(pattern: string): Promise<number> {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(keys);
  }
}

// Session storage for rate limiting and user sessions
export class SessionStorage {
  private static readonly SESSION_PREFIX = "session:";
  private static readonly SESSION_TTL = 86400; // 24 hours in seconds

  static async setSession(sessionId: string, data: any): Promise<void> {
    const client = await getRedisClient();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await client.setEx(key, this.SESSION_TTL, JSON.stringify(data));
  }

  static async getSession<T>(sessionId: string): Promise<T | null> {
    const client = await getRedisClient();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const client = await getRedisClient();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await client.del(key);
  }

  static async refreshSession(sessionId: string): Promise<void> {
    const client = await getRedisClient();
    const key = `${this.SESSION_PREFIX}${sessionId}`;
    await client.expire(key, this.SESSION_TTL);
  }
}
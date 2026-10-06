import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/services/redis-client";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  skipSuccessfulRequests: false,
};

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = forwarded?.split(",")[0].trim() || 
             realIp || 
             cfConnectingIp || 
             "unknown";
  
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `${ip}-${userAgent}`;
}

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (request: NextRequest): Promise<NextResponse | null> => {
    // In development mode or local development environment, bypass rate limiting
    const host = request.headers.get("host") || "";
    const origin = request.headers.get("origin") || "";
    const isLocalOrDev =
      process.env.NODE_ENV !== "production" ||
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      origin.includes("localhost") ||
      request.headers.get("x-environment") === "development";

    if (isLocalOrDev && process.env.ENABLE_DEV_RATE_LIMIT !== "true") {
      return null;
    }

    const key = opts.keyGenerator 
      ? opts.keyGenerator(request) 
      : getClientIdentifier(request);

    const now = Date.now();
    let currentCount = 0;
    let resetTimeMs = now + opts.windowMs;

    try {
      const redis = await getRedisClient();
      const redisKey = `ratelimit:${key}`;
      const windowSec = Math.ceil(opts.windowMs / 1000);

      const count = await redis.eval(
        `local n = redis.call('INCR', KEYS[1])
         if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
         return n`,
        { keys: [redisKey], arguments: [windowSec.toString()] }
      );

      currentCount = Number(count);
      const ttl = await redis.ttl(redisKey);
      if (ttl > 0) resetTimeMs = now + (ttl * 1000);
    } catch {
      // Fallback to in-memory store if Redis is unavailable or unconfigured
      const record = rateLimitStore.get(key);
      if (record && now > record.resetTime) {
        rateLimitStore.delete(key);
      }

      let currentRecord = rateLimitStore.get(key);
      if (!currentRecord || now > currentRecord.resetTime) {
        currentRecord = {
          count: 0,
          resetTime: now + opts.windowMs,
        };
        rateLimitStore.set(key, currentRecord);
      }
      currentRecord.count++;
      currentCount = currentRecord.count;
      resetTimeMs = currentRecord.resetTime;
    }

    if (currentCount > opts.maxRequests) {
      const resetTime = new Date(resetTimeMs).toISOString();
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          retryAfter: Math.ceil((resetTimeMs - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": opts.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil((resetTimeMs - now) / 1000).toString(),
          },
        }
      );
    }

    return null;
  };
}

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes for auth
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

// Clean up old records periodically (run this in a cron job or similar)
export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
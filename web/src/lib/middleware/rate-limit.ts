import { NextRequest, NextResponse } from "next/server";

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
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = forwarded?.split(",")[0].trim() || 
             realIp || 
             cfConnectingIp || 
             "unknown";
  
  // Combine IP with user agent for better uniqueness
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  return `${ip}-${userAgent}`;
}

export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultOptions, ...options };

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = opts.keyGenerator 
      ? opts.keyGenerator(request) 
      : getClientIdentifier(request);

    const now = Date.now();
    const record = rateLimitStore.get(key);

    // Clean up expired records
    if (record && now > record.resetTime) {
      rateLimitStore.delete(key);
    }

    // Get or create record
    let currentRecord = rateLimitStore.get(key);
    if (!currentRecord || now > currentRecord.resetTime) {
      currentRecord = {
        count: 0,
        resetTime: now + opts.windowMs,
      };
      rateLimitStore.set(key, currentRecord);
    }

    // Increment counter
    currentRecord.count++;

    // Check if limit exceeded
    if (currentRecord.count > opts.maxRequests) {
      const resetTime = new Date(currentRecord.resetTime).toISOString();
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests",
          retryAfter: Math.ceil((currentRecord.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": opts.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil((currentRecord.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.json(
      { success: false, error: "Rate limit check passed" },
      { status: 200 }
    );
    
    response.headers.set("X-RateLimit-Limit", opts.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", (opts.maxRequests - currentRecord.count).toString());
    response.headers.set("X-RateLimit-Reset", new Date(currentRecord.resetTime).toISOString());

    return null; // Continue to next middleware/handler
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
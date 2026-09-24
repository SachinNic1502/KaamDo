import { NextResponse } from "next/server";

// CORS configuration
const CORS_CONFIG = {
  // Allowed origins (add your frontend URLs here)
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:19006", // Expo web
    "http://localhost:8081", // Android emulator
    "http://localhost:3001", // Additional dev port
    // Add production domains when deployed
    // "https://yourdomain.com",
    // "https://www.yourdomain.com",
  ],
  
  // Allowed methods
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  
  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  
  // Exposed headers
  exposedHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  
  // Credentials
  credentials: true,
  
  // Max age for preflight requests
  maxAge: 86400, // 24 hours
};

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests with no origin (like mobile apps or curl requests)
  
  return CORS_CONFIG.allowedOrigins.includes(origin);
}

export function corsMiddleware(request: Request, response?: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  
  // Create response if not provided
  const corsResponse = response || new NextResponse();
  
  // Set CORS headers
  if (isOriginAllowed(origin)) {
    corsResponse.headers.set("Access-Control-Allow-Origin", origin || "*");
  }
  
  corsResponse.headers.set("Access-Control-Allow-Methods", CORS_CONFIG.allowedMethods.join(", "));
  corsResponse.headers.set("Access-Control-Allow-Headers", CORS_CONFIG.allowedHeaders.join(", "));
  corsResponse.headers.set("Access-Control-Expose-Headers", CORS_CONFIG.exposedHeaders.join(", "));
  corsResponse.headers.set("Access-Control-Allow-Credentials", CORS_CONFIG.credentials.toString());
  corsResponse.headers.set("Access-Control-Max-Age", CORS_CONFIG.maxAge.toString());
  
  return corsResponse;
}

// Handle preflight requests
export function handlePreflight(request: Request): NextResponse | null {
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    return corsMiddleware(request, response);
  }
  return null;
}

// Wrapper for API routes to handle CORS
export function withCors(handler: (request: Request) => Promise<NextResponse>) {
  return async (request: Request): Promise<NextResponse> => {
    // Handle preflight
    const preflightResponse = handlePreflight(request);
    if (preflightResponse) return preflightResponse;
    
    // Execute the handler
    const response = await handler(request);
    
    // Add CORS headers to response
    return corsMiddleware(request, response);
  };
}
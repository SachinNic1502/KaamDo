import { NextRequest, NextResponse } from "next/server";

// API key validation for external services
interface ApiKeyConfig {
  name: string;
  key: string | undefined;
  required: boolean;
}

const API_KEYS: ApiKeyConfig[] = [
  { name: "Razorpay", key: process.env.PAYMENT_PROVIDER_KEY, required: true },
  { name: "Cloudinary", key: process.env.CLOUDINARY_API_KEY, required: true },
  { name: "Firebase", key: process.env.FIREBASE_PROJECT_ID, required: true },
  { name: "Google Maps", key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, required: true },
];

export function validateApiKeys(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const config of API_KEYS) {
    if (config.required && !config.key) {
      missing.push(config.name);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

// Validate specific API key before using external service
export function validateServiceApiKey(serviceName: string): boolean {
  const config = API_KEYS.find(k => k.name.toLowerCase() === serviceName.toLowerCase());
  if (!config) return false;
  
  if (config.required && !config.key) {
    console.error(`Missing required API key for ${serviceName}`);
    return false;
  }
  
  return true;
}

// Middleware to check API keys before processing payment requests
export function validatePaymentApiKey(request: NextRequest): NextResponse | null {
  if (!validateServiceApiKey("Razorpay")) {
    return NextResponse.json(
      {
        success: false,
        error: "Payment service is not configured. Please contact support.",
      },
      { status: 503 }
    );
  }
  return null;
}

// Middleware to check file upload service
export function validateUploadApiKey(request: NextRequest): NextResponse | null {
  if (!validateServiceApiKey("Cloudinary")) {
    return NextResponse.json(
      {
        success: false,
        error: "File upload service is not configured. Please contact support.",
      },
      { status: 503 }
    );
  }
  return null;
}

// Middleware to check notification service
export function validateNotificationApiKey(request: NextRequest): NextResponse | null {
  if (!validateServiceApiKey("Firebase")) {
    return NextResponse.json(
      {
        success: false,
        error: "Notification service is not configured. Please contact support.",
      },
      { status: 503 }
    );
  }
  return null;
}

// Middleware to check location service
export function validateLocationApiKey(request: NextRequest): NextResponse | null {
  if (!validateServiceApiKey("Google Maps")) {
    return NextResponse.json(
      {
        success: false,
        error: "Location service is not configured. Please contact support.",
      },
      { status: 503 }
    );
  }
  return null;
}

// Health check endpoint to validate all API keys
export async function checkApiKeysHealth(): Promise<{
  status: string;
  services: Record<string, { configured: boolean; key?: string }>;
}> {
  const services: Record<string, { configured: boolean; key?: string }> = {};
  
  for (const config of API_KEYS) {
    services[config.name] = {
      configured: !!config.key,
      key: config.key ? `${config.key.substring(0, 4)}...${config.key.substring(config.key.length - 4)}` : undefined,
    };
  }
  
  const validation = validateApiKeys();
  
  return {
    status: validation.valid ? "healthy" : "degraded",
    services,
  };
}
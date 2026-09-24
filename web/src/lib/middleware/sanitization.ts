import { NextRequest } from "next/server";

// Basic input sanitization to prevent injection attacks
export function sanitizeInput(input: any): any {
  if (typeof input === "string") {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, "") // Remove < and >
      .trim()
      .substring(0, 1000); // Limit string length
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize keys as well
      const sanitizedKey = key.replace(/[<>]/g, "").trim();
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// Middleware to sanitize request body
export function sanitizeRequestBody(request: NextRequest): any {
  try {
    const body = request.clone();
    return body.json().then((data) => sanitizeInput(data));
  } catch {
    return {};
  }
}

// Sanitize specific fields that commonly contain user input
export function sanitizeUserInput(fields: string[], data: any): any {
  const sanitized = { ...data };
  
  for (const field of fields) {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  }
  
  return sanitized;
}

// Common fields that need sanitization
export const SANITIZABLE_FIELDS = [
  "name",
  "description",
  "address",
  "city",
  "state",
  "reason",
  "review",
  "message",
  "title",
  "notes",
  "resolution",
];

// Regex patterns for validation
export const SANITIZATION_PATTERNS = {
  // Remove script tags and event handlers
  script: /<script\b[^>]*>([\s\S]*?)<\/script>/gim,
  eventHandler: /on\w+="[^"]*"/gim,
  // Remove SQL injection patterns
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE)\b)/gim,
  // Remove shell command patterns
  shellInjection: /[;&|`$()]/g,
};

export function deepSanitize(input: string): string {
  let sanitized = input;
  
  // Apply all sanitization patterns
  for (const pattern of Object.values(SANITIZATION_PATTERNS)) {
    sanitized = sanitized.replace(pattern, "");
  }
  
  return sanitized.trim();
}
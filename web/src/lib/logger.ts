type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "secret",
  "jwt_secret",
  "otp",
  "startotp",
  "completionotp",
  "aadhaar",
  "aadhaarnumber",
  "pan",
  "pannumber",
  "cvv",
  "creditcard",
  "accountnumber",
]);

function redactSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else if (lowerKey === "phone" && typeof val === "string" && val.length >= 8) {
        sanitized[key] = `${val.slice(0, 2)}****${val.slice(-2)}`;
      } else {
        sanitized[key] = redactSensitiveData(val, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

class StructuredLogger {
  private formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>
  ): string {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      environment: process.env.NODE_ENV || "development",
      ...(meta ? { context: redactSensitiveData(meta) } : {}),
    };

    return JSON.stringify(entry);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, meta ? redactSensitiveData(meta) : "");
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    console.info(this.formatMessage("info", message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(this.formatMessage("warn", message, meta));
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errObj =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };

    console.error(
      this.formatMessage("error", message, {
        ...errObj,
        ...(meta || {}),
      })
    );
  }
}

export const logger = new StructuredLogger();
export default logger;

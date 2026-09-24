import mongoose, { Schema, Document } from "mongoose";

/**
 * Audit Log Service
 * Provides comprehensive logging of API calls, user actions, and system events
 */

export interface IAuditLogDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  ipAddress?: string;
  userAgent?: string;
  requestData?: Record<string, unknown>;
  responseData?: Record<string, unknown>;
  statusCode: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userRole: String,
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    method: { type: String, required: true },
    endpoint: { type: String, required: true },
    ipAddress: String,
    userAgent: String,
    requestData: { type: Schema.Types.Mixed },
    responseData: { type: Schema.Types.Mixed },
    statusCode: { type: Number, required: true },
    success: { type: Boolean, required: true },
    errorMessage: String,
    timestamp: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Indexes for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ success: 1, timestamp: -1 });
AuditLogSchema.index({ userRole: 1, timestamp: -1 });

export const AuditLog = mongoose.models.AuditLog || 
  mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export class AuditLogger {
  /**
   * Log an API request/response
   */
  static async logApiCall(params: {
    userId?: string;
    userRole?: string;
    action: string;
    resource: string;
    resourceId?: string;
    method: string;
    endpoint: string;
    ipAddress?: string;
    userAgent?: string;
    requestData?: Record<string, unknown>;
    responseData?: Record<string, unknown>;
    statusCode: number;
    success: boolean;
    errorMessage?: string;
  }) {
    try {
      await AuditLog.create({
        ...params,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log audit entry:", error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  /**
   * Log a user action
   */
  static async logUserAction(params: {
    userId: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    success: boolean;
    errorMessage?: string;
  }) {
    return this.logApiCall({
      userId: params.userId,
      userRole: params.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      method: "USER_ACTION",
      endpoint: `/internal/${params.resource}/${params.action}`,
      requestData: params.details,
      statusCode: params.success ? 200 : 400,
      success: params.success,
      errorMessage: params.errorMessage,
    });
  }

  /**
   * Log a security event
   */
  static async logSecurityEvent(params: {
    event: string;
    userId?: string;
    ipAddress?: string;
    details?: Record<string, unknown>;
    severity: "low" | "medium" | "high" | "critical";
  }) {
    return this.logApiCall({
      action: `SECURITY_${params.event.toUpperCase()}`,
      resource: "security",
      method: "SECURITY_EVENT",
      endpoint: `/security/${params.event}`,
      ipAddress: params.ipAddress,
      requestData: {
        ...params.details,
        severity: params.severity,
      },
      statusCode: 200,
      success: true,
    });
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(params: {
    event: "login" | "logout" | "login_failed" | "otp_sent" | "otp_verified" | "password_changed";
    userId?: string;
    ipAddress?: string;
    success: boolean;
    errorMessage?: string;
  }) {
    return this.logApiCall({
      userId: params.userId,
      action: `AUTH_${params.event.toUpperCase()}`,
      resource: "auth",
      method: "AUTH_EVENT",
      endpoint: `/auth/${params.event}`,
      ipAddress: params.ipAddress,
      statusCode: params.success ? 200 : 401,
      success: params.success,
      errorMessage: params.errorMessage,
    });
  }

  /**
   * Get audit logs for a user
   */
  static async getUserLogs(
    userId: string,
    limit: number = 100,
    skip: number = 0
  ) {
    return AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Get audit logs for a resource
   */
  static async getResourceLogs(
    resource: string,
    resourceId?: string,
    limit: number = 100,
    skip: number = 0
  ) {
    const filter: Record<string, unknown> = { resource };
    if (resourceId) filter.resourceId = resourceId;

    return AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Get failed login attempts
   */
  static async getFailedLoginAttempts(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return AuditLog.find({
      action: "AUTH_LOGIN_FAILED",
      timestamp: { $gte: since },
    })
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(
    severity?: "low" | "medium" | "high" | "critical",
    hours: number = 24
  ) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const filter: Record<string, unknown> = {
      action: { $regex: "^SECURITY_" },
      timestamp: { $gte: since },
    };

    if (severity) {
      filter["requestData.severity"] = severity;
    }

    return AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Get audit statistics
   */
  static async getAuditStats(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [
      totalLogs,
      failedRequests,
      authEvents,
      securityEvents,
      userActions,
    ] = await Promise.all([
      AuditLog.countDocuments({ timestamp: { $gte: since } }),
      AuditLog.countDocuments({ 
        timestamp: { $gte: since },
        success: false,
      }),
      AuditLog.countDocuments({ 
        timestamp: { $gte: since },
        action: { $regex: "^AUTH_" },
      }),
      AuditLog.countDocuments({ 
        timestamp: { $gte: since },
        action: { $regex: "^SECURITY_" },
      }),
      AuditLog.countDocuments({ 
        timestamp: { $gte: since },
        method: "USER_ACTION",
      }),
    ]);

    return {
      totalLogs,
      failedRequests,
      successRate: totalLogs > 0 ? ((totalLogs - failedRequests) / totalLogs) * 100 : 0,
      authEvents,
      securityEvents,
      userActions,
    };
  }

  /**
   * Clean up old audit logs (keep last 90 days)
   */
  static async cleanupOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

/**
 * Middleware to automatically log API calls
 */
export function auditMiddleware() {
  return async (
    request: Request,
    response: Response,
    next: () => void
  ) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    
    // Get client info
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Continue with the request
    next();

    // Log after response
    const duration = Date.now() - startTime;
    const success = response.status < 400;

    await AuditLogger.logApiCall({
      action: `${request.method}_${url.pathname}`,
      resource: url.pathname.split("/")[1] || "unknown",
      method: request.method,
      endpoint: url.pathname,
      ipAddress,
      userAgent,
      statusCode: response.status,
      success,
      errorMessage: !success ? `HTTP ${response.status}` : undefined,
    });
  };
}
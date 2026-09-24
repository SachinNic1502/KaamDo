import { getSocketServer } from "../socket/server";
import { AuditLogger } from "./audit-logger";

/**
 * Real-time Service
 * Handles real-time updates for jobs, notifications, and presence
 */
export class RealtimeService {
  /**
   * Broadcast job status update to all relevant users
   */
  static async broadcastJobUpdate(params: {
    jobId: string;
    status: string;
    customerId: string;
    workerId?: string;
    updateData?: Record<string, unknown>;
  }) {
    const socketServer = getSocketServer();
    if (!socketServer) {
      console.warn("Socket server not available for job update");
      return;
    }

    const update = {
      jobId: params.jobId,
      status: params.status,
      ...params.updateData,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to job room
    socketServer.broadcastJobUpdate(params.jobId, update);

    // Send individual notifications
    socketServer.sendNotificationToUser(params.customerId, {
      type: "job_update",
      ...update,
    });

    if (params.workerId) {
      socketServer.sendNotificationToUser(params.workerId, {
        type: "job_update",
        ...update,
      });
    }

    // Log the update
    await AuditLogger.logUserAction({
      userId: params.workerId || params.customerId,
      userRole: "system",
      action: "job_status_update",
      resource: "job",
      resourceId: params.jobId,
      details: { status: params.status },
      success: true,
    });
  }

  /**
   * Send notification to specific user
   */
  static async sendUserNotification(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const socketServer = getSocketServer();
    if (!socketServer) {
      console.warn("Socket server not available for notification");
      return;
    }

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...params,
      timestamp: new Date().toISOString(),
      read: false,
    };

    socketServer.sendNotificationToUser(params.userId, notification);

    // Log notification
    await AuditLogger.logUserAction({
      userId: params.userId,
      userRole: "system",
      action: "send_notification",
      resource: "notification",
      details: { type: params.type },
      success: true,
    });
  }

  /**
   * Broadcast notification to all users with specific role
   */
  static async sendRoleNotification(params: {
    role: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const socketServer = getSocketServer();
    if (!socketServer) {
      console.warn("Socket server not available for role notification");
      return;
    }

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...params,
      timestamp: new Date().toISOString(),
      read: false,
    };

    socketServer.sendNotificationToRole(params.role, notification);
  }

  /**
   * Notify when a worker is assigned to a job
   */
  static async notifyWorkerAssigned(params: {
    jobId: string;
    workerId: string;
    customerId: string;
    jobDetails: Record<string, unknown>;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "worker_assigned",
      customerId: params.customerId,
      workerId: params.workerId,
      updateData: params.jobDetails,
    });

    await this.sendUserNotification({
      userId: params.workerId,
      type: "job_assigned",
      title: "New Job Assigned",
      message: "You have been assigned to a new job",
      data: {
        jobId: params.jobId,
        ...params.jobDetails,
      },
    });
  }

  /**
   * Notify when worker accepts a job
   */
  static async notifyWorkerAccepted(params: {
    jobId: string;
    workerId: string;
    customerId: string;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "worker_accepted",
      customerId: params.customerId,
      workerId: params.workerId,
    });

    await this.sendUserNotification({
      userId: params.customerId,
      type: "worker_accepted",
      title: "Worker Accepted Job",
      message: "A worker has accepted your job request",
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
      },
    });
  }

  /**
   * Notify when worker is on the way
   */
  static async notifyWorkerOnTheWay(params: {
    jobId: string;
    workerId: string;
    customerId: string;
    eta?: number;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "on_the_way",
      customerId: params.customerId,
      workerId: params.workerId,
      updateData: { eta: params.eta },
    });

    await this.sendUserNotification({
      userId: params.customerId,
      type: "worker_on_the_way",
      title: "Worker On The Way",
      message: params.eta 
        ? `Worker is on the way, ETA: ${params.eta} minutes`
        : "Worker is on the way to your location",
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
        eta: params.eta,
      },
    });
  }

  /**
   * Notify when worker arrives
   */
  static async notifyWorkerArrived(params: {
    jobId: string;
    workerId: string;
    customerId: string;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "arrived",
      customerId: params.customerId,
      workerId: params.workerId,
    });

    await this.sendUserNotification({
      userId: params.customerId,
      type: "worker_arrived",
      title: "Worker Arrived",
      message: "Your worker has arrived at the location",
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
      },
    });
  }

  /**
   * Notify when work starts
   */
  static async notifyWorkStarted(params: {
    jobId: string;
    workerId: string;
    customerId: string;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "work_started",
      customerId: params.customerId,
      workerId: params.workerId,
    });

    await this.sendUserNotification({
      userId: params.customerId,
      type: "work_started",
      title: "Work Started",
      message: "Worker has started working on your job",
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
      },
    });
  }

  /**
   * Notify when additional work is requested
   */
  static async notifyAdditionalWorkRequest(params: {
    jobId: string;
    workerId: string;
    customerId: string;
    description: string;
    amount: number;
  }) {
    await this.sendUserNotification({
      userId: params.customerId,
      type: "additional_work_request",
      title: "Additional Work Request",
      message: `Worker requested additional work: ${params.description}`,
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
        description: params.description,
        amount: params.amount,
      },
    });
  }

  /**
   * Notify when work is completed
   */
  static async notifyWorkCompleted(params: {
    jobId: string;
    workerId: string;
    customerId: string;
  }) {
    await this.broadcastJobUpdate({
      jobId: params.jobId,
      status: "completion_requested",
      customerId: params.customerId,
      workerId: params.workerId,
    });

    await this.sendUserNotification({
      userId: params.customerId,
      type: "work_completed",
      title: "Work Completed",
      message: "Worker has completed the work. Please verify and approve.",
      data: {
        jobId: params.jobId,
        workerId: params.workerId,
      },
    });
  }

  /**
   * Notify when payment is processed
   */
  static async notifyPaymentProcessed(params: {
    jobId: string;
    customerId: string;
    workerId: string;
    amount: number;
  }) {
    await this.sendUserNotification({
      userId: params.customerId,
      type: "payment_processed",
      title: "Payment Processed",
      message: `Payment of ₹${params.amount} has been processed successfully`,
      data: {
        jobId: params.jobId,
        amount: params.amount,
      },
    });

    await this.sendUserNotification({
      userId: params.workerId,
      type: "payment_received",
      title: "Payment Received",
      message: `Payment of ₹${params.amount} has been received. Payout will be processed soon.`,
      data: {
        jobId: params.jobId,
        amount: params.amount,
      },
    });
  }

  /**
   * Notify when dispute is raised
   */
  static async notifyDisputeRaised(params: {
    disputeId: string;
    jobId: string;
    raisedBy: string;
    otherParty: string;
    reason: string;
  }) {
    await this.sendUserNotification({
      userId: params.otherParty,
      type: "dispute_raised",
      title: "Dispute Raised",
      message: `A dispute has been raised for your job: ${params.reason}`,
      data: {
        disputeId: params.disputeId,
        jobId: params.jobId,
        reason: params.reason,
      },
    });

    // Notify admins
    await this.sendRoleNotification({
      role: "admin",
      type: "new_dispute",
      title: "New Dispute Raised",
      message: `A new dispute has been raised: ${params.reason}`,
      data: {
        disputeId: params.disputeId,
        jobId: params.jobId,
        raisedBy: params.raisedBy,
      },
    });
  }

  /**
   * Check if user is online
   */
  static isUserOnline(userId: string): boolean {
    const socketServer = getSocketServer();
    if (!socketServer) return false;
    return socketServer.isUserOnline(userId);
  }

  /**
   * Get connected users count
   */
  static getConnectedUsersCount(): number {
    const socketServer = getSocketServer();
    if (!socketServer) return 0;
    return socketServer.getConnectedUsersCount();
  }
}
import { User } from "@/lib/models";

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
}

export function isExpoPushToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  return (
    token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[") ||
    /^[a-zA-Z0-9_-]{16,}$/.test(token)
  );
}

/**
 * Sends a push notification to a specific Expo Push Token.
 */
export async function sendExpoPushNotification(payload: PushNotificationPayload): Promise<boolean> {
  if (!payload.to) return false;

  // Sandbox / Test Token Simulation
  if (
    process.env.NODE_ENV !== "production" &&
    (payload.to.includes("mock") || payload.to.includes("test") || payload.to.includes("demo"))
  ) {
    console.log(`[PUSH SIMULATOR] Dispatched push to ${payload.to}: "${payload.title}" - ${payload.body}`);
    return true;
  }

  if (!isExpoPushToken(payload.to)) {
    console.warn(`[PUSH NOTIFICATIONS] Invalid Expo push token: ${payload.to}`);
    return false;
  }

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: payload.to,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || "default",
        badge: payload.badge,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("Expo Push API returned non-OK:", res.status, errText);
    }

    return res.ok;
  } catch (error) {
    console.error("Failed to send Expo push notification:", error);
    return false;
  }
}

/**
 * Sends a push notification to a target user by userId if they have registered a push token.
 */
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const user = await User.findById(userId).select("pushToken notificationSettings").lean();
    if (!user || !user.pushToken) return false;

    return await sendExpoPushNotification({
      to: user.pushToken,
      title,
      body,
      data,
    });
  } catch (error) {
    console.error("Error dispatching push notification to user:", error);
    return false;
  }
}

export type JobPushEvent =
  | "job_assigned"
  | "worker_on_the_way"
  | "worker_arrived"
  | "work_started"
  | "work_completed"
  | "payment_received";

export interface JobPushParams {
  event: JobPushEvent;
  userId: string;
  jobId: string;
  jobNumber?: string;
  serviceName?: string;
  workerName?: string;
  startOtp?: string;
  amount?: number;
}

/**
 * High-impact template dispatcher for Job Lifecycle events with direct deep-links.
 */
export async function sendJobPushNotification(params: JobPushParams): Promise<boolean> {
  const { event, userId, jobId, jobNumber, serviceName, workerName, startOtp, amount } = params;

  let title = "KaamDo Booking Update";
  let body = "There is an update on your service request.";

  switch (event) {
    case "job_assigned":
      title = "Technician Assigned! 🛠️";
      body = `${workerName || "A verified technician"} has been assigned to your ${serviceName || "service"} booking.`;
      break;
    case "worker_on_the_way":
      title = "Technician On The Way! 🛵";
      body = `${workerName || "Your technician"} is heading to your service location now.`;
      break;
    case "worker_arrived":
      title = "Technician Arrived! 🚪";
      body = `${workerName || "Your technician"} has arrived. Share Start OTP ${startOtp || ""} to begin work.`;
      break;
    case "work_started":
      title = "Service In Progress ⚡";
      body = `Work has begun on your ${serviceName || "service"}. Live execution active.`;
      break;
    case "work_completed":
      title = "Job Completed! 🎉";
      body = `Your ${serviceName || "service"} has been completed. Please inspect and settle payment.`;
      break;
    case "payment_received":
      title = "Payment Received! 💳";
      body = `Payment of ₹${amount || 0} for booking #${jobNumber || jobId.slice(-6)} has been recorded.`;
      break;
  }

  const deepLinkData: Record<string, unknown> = {
    screen: "JobDetail",
    jobId,
    event,
    url: `kaamdo://job/${jobId}`,
  };

  return sendPushNotificationToUser(userId, title, body, deepLinkData);
}

export interface MessagePushParams {
  recipientId: string;
  senderName: string;
  messageText: string;
  jobId: string;
  senderUserId: string;
}

/**
 * Dispatcher for Instant Chat Messages with 1-tap direct thread deep-linking.
 */
export async function sendMessagePushNotification(params: MessagePushParams): Promise<boolean> {
  const { recipientId, senderName, messageText, jobId, senderUserId } = params;

  const title = `Message from ${senderName}`;
  const body = messageText.length > 80 ? `${messageText.slice(0, 77)}...` : messageText;

  const deepLinkData: Record<string, unknown> = {
    screen: "Chat",
    jobId,
    otherUserId: senderUserId,
    senderName,
    url: `kaamdo://chat/${jobId}`,
  };

  return sendPushNotificationToUser(recipientId, title, body, deepLinkData);
}

export interface PayoutPushParams {
  workerUserId: string;
  amountMinor: number;
  status: "approved" | "processed" | "rejected";
  payoutId: string;
  reason?: string;
}

/**
 * Dispatcher for Worker Earnings & Payout Notifications.
 */
export async function sendPayoutPushNotification(params: PayoutPushParams): Promise<boolean> {
  const { workerUserId, amountMinor, status, payoutId, reason } = params;
  const amountRs = (amountMinor / 100).toFixed(0);

  let title = "Payout Update";
  let body = `Your payout request of ₹${amountRs} has been updated.`;

  if (status === "approved" || status === "processed") {
    title = "Payout Processed! 💰";
    body = `₹${amountRs} has been successfully settled to your registered bank account.`;
  } else if (status === "rejected") {
    title = "Payout Status Notice";
    body = `Your payout request of ₹${amountRs} was declined${reason ? `: ${reason}` : "."}`;
  }

  const deepLinkData: Record<string, unknown> = {
    screen: "PayoutHistory",
    payoutId,
    url: `kaamdo://payouts`,
  };

  return sendPushNotificationToUser(workerUserId, title, body, deepLinkData);
}

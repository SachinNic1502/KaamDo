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

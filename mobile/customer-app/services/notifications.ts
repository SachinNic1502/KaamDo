import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";
import * as SecureStore from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: "booking" | "payment" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const IN_APP_STORAGE_KEY = "kaamdo_inapp_notifications_v1";

const DEFAULT_NOTIFICATIONS: InAppNotification[] = [];

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    const authToken = await SecureStore.getItemAsync("token");
    if (authToken && pushToken) {
      await api.post("/api/users/push-token", { pushToken }, authToken);
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0456D3",
      });
    }

    return pushToken;
  } catch {
    return null;
  }
}

export function addNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (
    response: Notifications.NotificationResponse
  ) => void
) {
  if (Platform.OS === "web") return () => {};

  const receivedSub =
    Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseSub =
    Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

export const notificationService = {
  /**
   * Get in-app notification list
   */
  async getNotifications(): Promise<InAppNotification[]> {
    try {
      const data = await SecureStore.getItemAsync(IN_APP_STORAGE_KEY);
      if (!data) {
        await SecureStore.setItemAsync(
          IN_APP_STORAGE_KEY,
          JSON.stringify(DEFAULT_NOTIFICATIONS)
        );
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<InAppNotification[]> {
    const list = await this.getNotifications();
    const updated = list.map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    await SecureStore.setItemAsync(IN_APP_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<InAppNotification[]> {
    const list = await this.getNotifications();
    const updated = list.map((item) => ({ ...item, isRead: true }));
    await SecureStore.setItemAsync(IN_APP_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get count of unread notifications for badge display
   */
  async getUnreadCount(): Promise<number> {
    const list = await this.getNotifications();
    return list.filter((n) => !n.isRead).length;
  },
};

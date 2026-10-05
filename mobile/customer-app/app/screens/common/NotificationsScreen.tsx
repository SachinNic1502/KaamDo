import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { AppHeader, EmptyState } from "../../../components/ui";

import { notificationService } from "../../../services/notifications";

interface NotificationItem {
  id: string;
  type: "job" | "payment" | "chat" | "promo";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function CustomerNotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationService.getNotifications().then((list) => {
      if (list && list.length > 0) {
        setNotifications(
          list.map((n) => ({
            id: n.id,
            type: (n.type === "booking" ? "job" : n.type === "payment" ? "payment" : n.type === "promo" ? "promo" : "job") as any,
            title: n.title,
            message: n.body,
            time: new Date(n.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: n.isRead,
          }))
        );
      }
    });
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAllAsRead();
  };

  const handlePressItem = async (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    await notificationService.markAsRead(item.id);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "job":
        return { name: "briefcase" as const, color: Colors.primary };
      case "payment":
        return { name: "card" as const, color: Colors.success };
      case "chat":
        return { name: "chatbubble" as const, color: Colors.accent };
      case "promo":
        return { name: "pricetag" as const, color: "#8B5CF6" };
      default:
        return { name: "notifications" as const, color: Colors.primary };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Notifications"
        subtitle="Job updates & security receipts"
        rightAction={
          <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="No Notifications"
              description="You're all caught up! Booking updates and chat notifications will appear here."
            />
          }
          renderItem={({ item }) => {
            const icon = getIcon(item.type);
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                activeOpacity={0.7}
                onPress={() => handlePressItem(item)}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.read ? Colors.surfaceSubtle : Colors.primaryLight },
                  ]}
                >
                  <Ionicons name={icon.name} size={20} color={icon.color} />
                </View>
                <View style={styles.metaBox}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  markReadBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 105,
    gap: Spacing.sm,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: "relative",
  },
  notifCardUnread: {
    borderColor: Colors.primaryMuted,
    backgroundColor: "#F8FAFF",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  metaBox: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notifTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  notifTime: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },
  notifMessage: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: "absolute",
    top: 14,
    right: 14,
  },
});

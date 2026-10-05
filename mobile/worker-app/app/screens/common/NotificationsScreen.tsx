import React, { useState } from "react";
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

interface NotificationItem {
  id: string;
  type: "job" | "payment" | "chat" | "security" | "rating";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function WorkerNotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "job":
        return { name: "briefcase" as const, color: Colors.primary };
      case "payment":
        return { name: "wallet" as const, color: Colors.accent };
      case "rating":
        return { name: "star" as const, color: Colors.secondary };
      case "security":
        return { name: "shield-checkmark" as const, color: Colors.primary };
      case "chat":
        return { name: "chatbubble-ellipses" as const, color: Colors.accent };
      default:
        return { name: "notifications" as const, color: Colors.primary };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Partner Notifications"
        subtitle="Job alerts, payouts & customer ratings"
        showBack
        onBack={() => navigation.goBack()}
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
              description="You're all caught up! New job broadcasts, customer messages, and payout alerts will appear here."
            />
          }
          renderItem={({ item }) => {
            const icon = getIcon(item.type);
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                activeOpacity={0.7}
                onPress={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                  );
                }}
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
    paddingBottom: 115,
    gap: Spacing.sm,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    position: "relative",
    ...Shadows.sm,
  },
  notifCardUnread: {
    borderColor: Colors.primaryLight2,
    backgroundColor: "#FFFDFC",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    marginTop: 4,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    position: "absolute",
    top: 14,
    right: 14,
  },
});

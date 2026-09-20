import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants";

interface Notification {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    icon: "checkmark-circle",
    title: "Job Completed",
    description: "Plumbing repair at 123 Main St has been marked as completed.",
    time: "2m ago",
    read: false,
  },
  {
    id: "2",
    icon: "person-add",
    title: "New Application",
    description: "Sarah M. applied for your cleaning job posting.",
    time: "15m ago",
    read: false,
  },
  {
    id: "3",
    icon: "card",
    title: "Payment Received",
    description: "You received $120 for the electrical work completed yesterday.",
    time: "1h ago",
    read: true,
  },
  {
    id: "4",
    icon: "chatbubble",
    title: "New Message",
    description: "You have a new message from Mike regarding the painting job.",
    time: "2h ago",
    read: true,
  },
  {
    id: "5",
    icon: "time",
    title: "Job Reminder",
    description: "Your landscaping job starts in 30 minutes.",
    time: "3h ago",
    read: true,
  },
  {
    id: "6",
    icon: "star",
    title: "New Review",
    description: "A customer left you a 5-star review. Tap to view.",
    time: "5h ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
        <Ionicons name={item.icon} size={22} color={Colors.surface} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  list: {
    paddingVertical: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  unreadItem: {
    backgroundColor: Colors.primary + "08",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  unreadIcon: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: "700",
    color: Colors.text,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

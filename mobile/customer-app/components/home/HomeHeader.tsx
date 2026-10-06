import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";
import { Avatar, LogoWordmark } from "../ui";

interface HomeHeaderProps {
  user: any;
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  onLocationPress: () => void;
  hasUnreadNotifications?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  user,
  onNotificationsPress,
  onProfilePress,
  onLocationPress,
  hasUnreadNotifications = true,
}) => {
  const firstName = user?.name ? user.name.trim().split(" ")[0] : "Customer";
  const displayLocation =
    user?.city ||
    user?.address?.city ||
    user?.address?.address ||
    "Select Delivery Address";

  return (
    <View style={styles.container}>
      {/* Brand & Notification Actions Row */}
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <LogoWordmark width={132} />
        </View>

        <View style={styles.actionsWrap}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onNotificationsPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
            {hasUnreadNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* User Identity & Service Location Row */}
      <View style={styles.profileRow}>
        <TouchableOpacity
          style={styles.profileSnippet}
          onPress={onProfilePress}
          activeOpacity={0.8}
        >
          <Avatar
            uri={user?.avatar}
            name={user?.name || "Customer"}
            size={42}
            isVerified={Boolean(user?.isPhoneVerified)}
          />
          <View style={styles.userTextMeta}>
            <Text style={styles.greeting} numberOfLines={1}>
              Hello, {firstName} 👋
            </Text>
            <TouchableOpacity
              style={styles.locationPill}
              onPress={onLocationPress}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={13} color={Colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {displayLocation}
              </Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm + 2,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileSnippet: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userTextMeta: {
    marginLeft: Spacing.sm + 2,
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.sm + 1,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    maxWidth: 240,
  },
});

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { JobStatus, Colors, FontSize, Spacing, BorderRadius } from "../../constants";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showDot?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showDot = true,
  style,
}) => {
  const meta = JobStatus[status] || {
    label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    color: Colors.textSecondary,
    bg: Colors.surfaceSubtle,
    dot: Colors.textMuted,
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.bg },
        size === "sm" && styles.badgeSm,
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: meta.dot },
            size === "sm" && styles.dotSm,
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          { color: meta.color },
          size === "sm" && styles.textSm,
        ]}
        numberOfLines={1}
      >
        {meta.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs + 1,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  textSm: {
    fontSize: FontSize.xxs + 1,
  },
});

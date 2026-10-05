import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Colors, FontSize, Spacing } from "../../constants";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionTitle?: string;
  actionText?: string;
  onAction?: () => void;
  onActionPress?: () => void;
  count?: number;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionTitle,
  actionText,
  onAction,
  onActionPress,
  count,
  style,
}) => {
  const label = actionTitle || actionText;
  const handleAction = onAction || onActionPress;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {count !== undefined && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
          )}
        </View>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {label && handleAction && (
        <TouchableOpacity
          onPress={handleAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  titleWrapper: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Spacing.xs + 2,
  },
  badgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
  },
});

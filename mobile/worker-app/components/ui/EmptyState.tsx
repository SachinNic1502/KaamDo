import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";
import { PrimaryButton } from "./Button";

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "file-tray-outline",
  title,
  description,
  actionTitle,
  actionLabel,
  onAction,
  onActionPress,
  style,
}) => {
  const label = actionTitle || actionLabel;
  const handleAction = onAction || onActionPress;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {label && handleAction && (
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={label}
            onPress={handleAction}
            size="md"
            fullWidth={false}
            style={{ paddingHorizontal: Spacing.xl }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: Spacing.lg,
  },
});

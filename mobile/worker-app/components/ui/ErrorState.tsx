import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";
import { OutlineButton } from "./Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong loading this data. Please check your internet connection and try again.",
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={32} color={Colors.error} />
      </View>
      <Text style={styles.title}>Unable to load content</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <View style={styles.actionContainer}>
          <OutlineButton
            title="Try Again"
            onPress={onRetry}
            size="sm"
            icon="reload-outline"
            fullWidth={false}
            style={{ paddingHorizontal: Spacing.lg }}
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
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
  },
  actionContainer: {
    marginTop: Spacing.base,
  },
});

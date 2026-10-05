import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Colors, Spacing, BorderRadius, Shadows } from "../../constants";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "flat" | "accent";
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = "default",
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return styles.elevated;
      case "flat":
        return styles.flat;
      case "accent":
        return styles.accent;
      case "default":
      default:
        return styles.default;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.82}
        style={[styles.base, getVariantStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  default: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  flat: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  accent: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
  },
});

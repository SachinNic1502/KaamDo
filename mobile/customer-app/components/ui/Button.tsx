import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, FontSize, Shadows } from "../../constants";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return styles.secondaryBtn;
      case "outline":
        return styles.outlineBtn;
      case "ghost":
        return styles.ghostBtn;
      case "danger":
        return styles.dangerBtn;
      case "success":
        return styles.successBtn;
      case "primary":
      default:
        return styles.primaryBtn;
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "ghost":
        return styles.ghostText;
      case "danger":
        return styles.dangerText;
      case "success":
        return styles.successText;
      case "primary":
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return styles.smBtn;
      case "lg":
        return styles.lgBtn;
      case "md":
      default:
        return styles.mdBtn;
    }
  };

  const getSizeTextStyle = (): TextStyle => {
    switch (size) {
      case "sm":
        return styles.smText;
      case "lg":
        return styles.lgText;
      case "md":
      default:
        return styles.mdText;
    }
  };

  const getSpinnerColor = (): string => {
    if (variant === "outline" || variant === "ghost") return Colors.primary;
    if (variant === "secondary") return Colors.textPrimary;
    return Colors.white;
  };

  const getIconColor = (): string => {
    if (variant === "outline" || variant === "ghost") return Colors.primary;
    if (variant === "secondary") return Colors.textPrimary;
    if (variant === "danger") return Colors.white;
    if (variant === "success") return Colors.white;
    return Colors.white;
  };

  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabledBtn,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={getIconColor()}
              style={{ marginRight: Spacing.xs + 2 }}
            />
          )}
          <Text
            style={[
              styles.baseText,
              getVariantTextStyle(),
              getSizeTextStyle(),
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={getIconColor()}
              style={{ marginLeft: Spacing.xs + 2 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button {...props} variant="secondary" />
);

export const OutlineButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button {...props} variant="outline" />
);

export const IconButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}> = ({
  icon,
  onPress,
  size = 20,
  color = Colors.textPrimary,
  backgroundColor = Colors.surfaceSubtle,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.iconBtnBase,
      { backgroundColor, width: size * 2, height: size * 2, borderRadius: size },
      style,
    ]}
  >
    <Ionicons name={icon} size={size} color={color} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  baseText: {
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  // Variant styles
  primaryBtn: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryBtn: {
    backgroundColor: Colors.surfaceSubtle,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  outlineBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  outlineText: {
    color: Colors.textPrimary,
  },
  ghostBtn: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: Colors.primary,
  },
  dangerBtn: {
    backgroundColor: Colors.error,
    ...Shadows.sm,
  },
  dangerText: {
    color: Colors.white,
  },
  successBtn: {
    backgroundColor: Colors.success,
    ...Shadows.sm,
  },
  successText: {
    color: Colors.white,
  },
  // Sizes
  smBtn: {
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm + 2,
  },
  smText: {
    fontSize: FontSize.xs,
  },
  mdBtn: {
    height: 48,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  mdText: {
    fontSize: FontSize.md,
  },
  lgBtn: {
    height: 54,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  lgText: {
    fontSize: FontSize.base,
  },
  // Disabled
  disabledBtn: {
    backgroundColor: Colors.disabled,
    borderColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    color: Colors.disabledText,
  },
  iconBtnBase: {
    alignItems: "center",
    justifyContent: "center",
  },
});

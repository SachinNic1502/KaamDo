import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  variant?: "primary" | "gold";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  variant = "primary",
  size = "md",
  style,
  labelStyle,
}) => {
  const activeColor = variant === "gold" ? Colors.checkbox.activeGold : Colors.checkbox.active;
  const boxDim = size === "sm" ? 18 : size === "lg" ? 24 : 20;
  const iconSize = size === "sm" ? 12 : size === "lg" ? 17 : 14;

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.container, disabled && styles.containerDisabled, style]}
    >
      <View
        style={[
          styles.boxBase,
          {
            width: boxDim,
            height: boxDim,
            borderRadius: size === "sm" ? 4 : 6,
          },
          checked
            ? {
                backgroundColor: activeColor,
                borderColor: activeColor,
              }
            : {
                backgroundColor: Colors.checkbox.deactive,
                borderColor: Colors.checkbox.deactiveBorder,
              },
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={iconSize}
            color={Colors.checkbox.activeCheckmark}
          />
        )}
      </View>

      {(!!label || !!description) && (
        <View style={styles.textContainer}>
          {!!label && (
            <Text
              style={[
                styles.label,
                size === "sm" && styles.labelSm,
                size === "lg" && styles.labelLg,
                checked && styles.labelChecked,
                disabled && styles.labelDisabled,
                labelStyle,
              ]}
            >
              {label}
            </Text>
          )}
          {!!description && (
            <Text style={[styles.description, disabled && styles.labelDisabled]}>
              {description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  containerDisabled: {
    opacity: 0.55,
  },
  boxBase: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  boxDisabled: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
  },
  textContainer: {
    flex: 1,
    paddingTop: 1,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  labelSm: {
    fontSize: FontSize.xs,
  },
  labelLg: {
    fontSize: FontSize.base,
  },
  labelChecked: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  labelDisabled: {
    color: Colors.textMuted,
  },
  description: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default Checkbox;

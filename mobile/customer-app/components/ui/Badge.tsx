import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";

export interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "md",
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: Colors.successLight, text: Colors.successDark };
      case "warning":
        return { bg: Colors.warningLight, text: Colors.warningDark };
      case "error":
        return { bg: Colors.errorLight, text: Colors.errorDark };
      case "info":
        return { bg: Colors.infoLight, text: Colors.infoDark };
      case "primary":
      default:
        return { bg: Colors.primaryLight, text: Colors.primaryDark };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        size === "sm" && styles.badgeSm,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: text },
          size === "sm" && styles.labelSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  labelSm: {
    fontSize: FontSize.xxs,
  },
});

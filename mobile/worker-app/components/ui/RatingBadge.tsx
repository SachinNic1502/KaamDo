import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../../constants";

export interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  totalRatings?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  totalRatings,
  size = "md",
  showCount = true,
  style,
}) => {
  const count = reviewCount !== undefined ? reviewCount : totalRatings;
  const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  const ratingText = rating > 0 ? rating.toFixed(1) : "New";

  return (
    <View
      style={[
        styles.container,
        size === "sm" && styles.containerSm,
        size === "lg" && styles.containerLg,
        style,
      ]}
    >
      <Ionicons name="star" size={iconSize} color={Colors.warning} />
      <Text
        style={[
          styles.ratingText,
          size === "sm" && styles.ratingTextSm,
          size === "lg" && styles.ratingTextLg,
        ]}
      >
        {ratingText}
      </Text>
      {showCount && count !== undefined && count > 0 && (
        <Text
          style={[
            styles.countText,
            size === "sm" && styles.countTextSm,
            size === "lg" && styles.countTextLg,
          ]}
        >
          ({count})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  containerLg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.warningDark,
    marginLeft: 3,
  },
  ratingTextSm: {
    fontSize: FontSize.xxs + 1,
  },
  ratingTextLg: {
    fontSize: FontSize.sm,
  },
  countText: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  countTextSm: {
    fontSize: FontSize.xxs,
  },
  countTextLg: {
    fontSize: FontSize.xs,
  },
});

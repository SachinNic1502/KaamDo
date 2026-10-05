import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing, BorderRadius } from "../../constants";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  count,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.unselectedChip,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? Colors.white : Colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          selected ? styles.selectedLabel : styles.unselectedLabel,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.count,
            selected ? styles.selectedCount : styles.unselectedCount,
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  unselectedChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  unselectedLabel: {
    color: Colors.textSecondary,
  },
  selectedLabel: {
    color: Colors.white,
  },
  count: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    marginLeft: Spacing.xs,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  unselectedCount: {
    backgroundColor: Colors.surfaceSubtle,
    color: Colors.textSecondary,
  },
  selectedCount: {
    backgroundColor: "rgba(255,255,255,0.25)",
    color: Colors.white,
  },
});

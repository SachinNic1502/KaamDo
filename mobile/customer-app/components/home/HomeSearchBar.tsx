import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";

interface HomeSearchBarProps {
  onPress: () => void;
  placeholder?: string;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  onPress,
  placeholder = "Search electricians, plumbers, AC repair...",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.container}
    >
      <View style={styles.searchIconBox}>
        <Ionicons name="search" size={17} color={Colors.textSecondary} />
      </View>

      <Text style={styles.placeholderText} numberOfLines={1}>
        {placeholder}
      </Text>

      <View style={styles.filterShortcut}>
        <Ionicons name="options-outline" size={15} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 2,
    height: 48,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  searchIconBox: {
    marginRight: Spacing.xs + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: FontSize.xs + 1,
    color: Colors.textMuted,
    flex: 1,
    fontWeight: "500",
  },
  filterShortcut: {
    backgroundColor: Colors.primaryLight,
    padding: 6,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});

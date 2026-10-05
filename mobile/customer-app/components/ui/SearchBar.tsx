import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, FontSize, Shadows } from "../../constants";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  isTouchable?: boolean;
  onFilterPress?: () => void;
  showFilter?: boolean;
  filterActive?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = "",
  onChangeText,
  placeholder = "Search services, trades, professionals...",
  onPress,
  isTouchable = false,
  onFilterPress,
  showFilter = false,
  filterActive = false,
  autoFocus = false,
  style,
}) => {
  if (isTouchable) {
    return (
      <View style={[styles.wrapper, style]}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={styles.container}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <Text style={styles.placeholderText} numberOfLines={1}>
            {placeholder}
          </Text>
          {showFilter && onFilterPress && (
            <TouchableOpacity
              onPress={onFilterPress}
              style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={filterActive ? Colors.white : Colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.container}>
        <Ionicons
          name="search-outline"
          size={19}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          autoFocus={autoFocus}
          style={styles.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {value.length > 0 && onChangeText && (
          <TouchableOpacity
            onPress={() => onChangeText("")}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        {showFilter && onFilterPress && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={filterActive ? Colors.white : Colors.textPrimary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
    height: "100%",
  },
  placeholderText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
});

import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  maxLength,
  secureTextEntry = false,
  autoCapitalize = "none",
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          multiline && { height: 90, alignItems: "flex-start", paddingVertical: 8 },
          error && styles.errorBorder,
          !editable && styles.disabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.input, multiline && { textAlignVertical: "top" }]}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={18}
              color={Colors.textSecondary}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderLight,
  },
  errorText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.error,
    marginTop: 4,
    fontWeight: "500",
  },
});

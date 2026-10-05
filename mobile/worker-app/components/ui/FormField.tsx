import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  KeyboardTypeOptions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  prefix?: string;
  helperText?: string;
  required?: boolean;
  editable?: boolean;
  style?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  maxLength,
  multiline = false,
  numberOfLines = 1,
  prefix,
  helperText,
  required = false,
  editable = true,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
        {maxLength && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          isFocused && styles.focusedInput,
          !!error && styles.errorInput,
          !editable && styles.disabledInput,
        ]}
      >
        {prefix && <Text style={styles.prefixText}>{prefix}</Text>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            !editable && styles.disabledText,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs + 2,
  },
  label: {
    fontSize: FontSize.xs + 1,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  requiredStar: {
    color: Colors.error,
  },
  charCount: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1.2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  multilineContainer: {
    height: 100,
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
  },
  focusedInput: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  errorInput: {
    borderColor: Colors.error,
  },
  disabledInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderLight,
  },
  prefixText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    height: "100%",
    paddingVertical: 0,
  },
  multilineInput: {
    textAlignVertical: "top",
    height: "100%",
  },
  disabledText: {
    color: Colors.textMuted,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.error,
    marginLeft: 4,
    fontWeight: "500",
  },
  helperText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});

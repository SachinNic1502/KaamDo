import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { Colors, BorderRadius, Shadows } from "../../constants";

export interface OtpBoxInputProps {
  value: string;
  onChange: (val: string) => void;
  accentColor?: string;
  accentBg?: string;
  autoFocus?: boolean;
}

export const OtpBoxInput: React.FC<OtpBoxInputProps> = ({
  value,
  onChange,
  accentColor = Colors.primary,
  accentBg = Colors.primaryLight,
  autoFocus = Platform.OS !== "web",
}) => {
  const digits = value.slice(0, 4).split("");

  return (
    <View style={styles.otpInputContainer}>
      <TextInput
        style={styles.otpInputHidden}
        value={value}
        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, "").slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        autoFocus={autoFocus}
        accessibilityLabel="4-digit OTP code"
      />
      <View style={styles.otpBoxesRow} pointerEvents="none">
        {[0, 1, 2, 3].map((idx) => {
          const char = digits[idx];
          const isCurrent = value.length === idx;
          const isFilled = Boolean(char);

          return (
            <View
              key={idx}
              style={[
                styles.otpCell,
                isFilled && [styles.otpCellFilled, { borderColor: accentColor }],
                isCurrent && [
                  styles.otpCellCurrent,
                  { borderColor: accentColor, backgroundColor: accentBg },
                ],
              ]}
            >
              {isFilled ? (
                <Text style={[styles.otpDigit, { color: accentColor }]}>{char}</Text>
              ) : (
                <View
                  style={[
                    styles.otpDot,
                    isCurrent && [styles.otpDotCurrent, { backgroundColor: accentColor }],
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  otpInputContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    marginVertical: 8,
  },
  otpInputHidden: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    zIndex: 10,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  otpCell: {
    width: 54,
    height: 58,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.sm,
  },
  otpCellFilled: {
    backgroundColor: Colors.surface,
  },
  otpCellCurrent: {
    ...Shadows.md,
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: "800",
  },
  otpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  otpDotCurrent: {
    transform: [{ scale: 1.25 }],
  },
});

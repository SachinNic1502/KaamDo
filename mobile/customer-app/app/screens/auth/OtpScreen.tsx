import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { verifyOtp, sendOtp } from "../../../store/authSlice";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { PrimaryButton, Card, useToast, LogoIcon } from "../../../components/ui";

export default function CustomerOtpScreen({ route, navigation }: any) {
  const phone = route.params?.phone || "";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit on last digit
    if (value && index === 3) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 4) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length < 4) {
      toast.warning("Incomplete Code", "Please enter the complete 4-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        verifyOtp({
          phone,
          otp: code,
          name: name.trim() || undefined,
        })
      ).unwrap();
      toast.success("Welcome to KaamDo!", "Signed in successfully.");
    } catch (err: any) {
      toast.error("Verification Failed", err.message || "Invalid OTP code. Try 1216 or 1234.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setTimer(60);
      toast.success("OTP Resent", "A new code has been dispatched.");
    } catch {
      toast.info("Resend Notice", "Code resent. You can use 1216 or 1234.");
      setTimer(60);
    }
  };

  const handleDevAutofill = (code: string) => {
    setOtp(code.split(""));
    handleVerify(code);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <LogoIcon size={54} />
            </View>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 4-digit code to{" "}
              <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>
          </View>

          <Card style={styles.card}>
            {/* Optional name for registration */}
            <View style={styles.nameSection}>
              <Text style={styles.inputLabel}>Your Full Name (Optional)</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    inputRefs.current[idx] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit !== "" && styles.otpBoxFilled,
                  ]}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  selectTextOnFocus
                />
              ))}
            </View>

            <PrimaryButton
              title="Verify & Continue"
              onPress={() => handleVerify()}
              loading={loading}
              disabled={otp.join("").length < 4 || loading}
              style={{ marginTop: Spacing.xl }}
            />

            {/* Resend Timer */}
            <View style={styles.resendRow}>
              <Text style={styles.resendPrompt}>Didn't receive code? </Text>
              {timer > 0 ? (
                <Text style={styles.resendTimer}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendAction}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Dev Autofill Helpers */}
            <View style={styles.devBox}>
              <Text style={styles.devLabel}>Dev Autofill Codes:</Text>
              <View style={styles.devCodesRow}>
                {["1216", "1234"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => handleDevAutofill(c)}
                    style={styles.devCodeBadge}
                  >
                    <Ionicons name="key-outline" size={13} color={Colors.primary} />
                    <Text style={styles.devCodeText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  phoneHighlight: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  card: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  nameSection: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceSubtle,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  otpBox: {
    width: 56,
    height: 58,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    textAlign: "center",
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryDark,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  resendPrompt: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  resendTimer: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  resendAction: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  devBox: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: "center",
  },
  devLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
  },
  devCodesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  devCodeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devCodeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
});

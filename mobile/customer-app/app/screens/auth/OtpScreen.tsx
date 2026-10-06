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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { verifyOtp, sendOtp } from "../../../store/authSlice";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { PrimaryButton, Card, useToast, LogoIcon } from "../../../components/ui";

export default function CustomerOtpScreen({ route, navigation }: any) {
  const phone = route.params?.phone || "";
  const initialServerOtp =
    route.params?.serverOtp ||
    route.params?.otp ||
    route.params?.debugOtp ||
    route.params?.demoOtp ||
    "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [dispatchedOtp, setDispatchedOtp] = useState<string>(initialServerOtp ? String(initialServerOtp) : "");

  const otpDemo = dispatchedOtp || initialServerOtp;

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  // Resend countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch / retrieve production OTP if not already in route params
  useEffect(() => {
    if (!dispatchedOtp && phone) {
      dispatch(sendOtp(phone))
        .unwrap()
        .then((res: any) => {
          const code =
            res?.data?.otp ||
            res?.data?.debugOtp ||
            res?.data?.demoOtp ||
            res?.otp ||
            res?.debugOtp;
          if (code) {
            setDispatchedOtp(String(code));
          }
        })
        .catch(() => {
          // Non-blocking fallback
        });
    }
  }, [phone]);

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
        })
      ).unwrap();
      toast.success("Welcome to KaamDo!", "Signed in successfully.");
    } catch (err: any) {
      toast.error(
        "Verification Failed",
        err.message || "Invalid OTP code. Please enter the correct code sent to your phone."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const res: any = await dispatch(sendOtp(phone)).unwrap();
      const newOtp =
        res?.data?.otp ||
        res?.data?.debugOtp ||
        res?.data?.demoOtp ||
        res?.otp ||
        res?.debugOtp;
      if (newOtp) {
        setDispatchedOtp(String(newOtp));
      }
      setTimer(60);
      toast.success("OTP Resent", "A new verification code has been dispatched.");
    } catch (err: any) {
      toast.error("Resend Failed", err.message || "Failed to resend code. Please try again.");
    }
  };

  const handleQuickFill = () => {
    if (!otpDemo) return;
    const digits = otpDemo.slice(0, 4).split("");
    setOtp(digits);
    handleVerify(otpDemo.slice(0, 4));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              We sent a 4-digit verification code to{"\n"}
              <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>

            {Boolean(otpDemo) ? (
              <TouchableOpacity onPress={handleQuickFill} style={styles.demoBadge} activeOpacity={0.7}>
                <Ionicons name="flash" size={12} color={Colors.warningDark} />
                <Text style={styles.demoText}>Auto-fill Code: {otpDemo}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Card style={styles.card}>
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

            {/* Security Guarantee Note */}
            <View style={styles.securityFooter}>
              <Ionicons name="lock-closed-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.securityFooterText}>
                End-to-end encrypted session • KaamDo Security
              </Text>
            </View>
          </Card>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: Spacing.md,
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
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
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
    lineHeight: 18,
  },
  phoneHighlight: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  demoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  demoText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.warningDark,
  },
  card: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
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
  securityFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  securityFooterText: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },
});

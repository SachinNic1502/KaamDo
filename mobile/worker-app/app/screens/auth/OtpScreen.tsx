import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { PrimaryButton } from "../../../components/ui";
import { Logo } from "../../../components/Logo";
import { api } from "../../../services/api";
import { saveAuthToken, saveUserData, saveWorkerProfile } from "../../../services/storage";
import { useAppDispatch } from "../../../store";
import { setCredentials } from "../../../store/authSlice";

export const OtpScreen = ({ route, navigation }: any) => {
  const { phone, fullName, role = "worker", trade, isRegister, otpDemo } = route.params || {};
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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
    const otpCode = codeToVerify || otp.join("");
    if (otpCode.length < 4) {
      Alert.alert("Incomplete Code", "Please enter the complete 4-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<any>("/api/auth/verify-otp", {
        phone,
        otp: otpCode,
        role: "worker",
        name: fullName,
        trade,
        isRegister,
      });

      const token = res.token || res.data?.token;
      const user = res.user || res.data?.user;
      const workerProfile = res.workerProfile || res.data?.workerProfile;

      if (!token || !user) {
        throw new Error(res.message || "Invalid response from authentication server");
      }

      await saveAuthToken(token);
      await saveUserData(user);
      if (workerProfile) {
        await saveWorkerProfile(workerProfile);
      }

      dispatch(
        setCredentials({
          token,
          user,
          workerProfile,
        })
      );
    } catch (err: any) {
      Alert.alert("Verification Failed", err.message || "Invalid OTP entered. Please enter the correct code sent to your mobile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await api.post("/api/auth/send-otp", { phone, role: "worker" });
      setCountdown(45);
      setCanResend(false);
      Alert.alert("Code Sent", "A fresh verification code has been dispatched to your mobile.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to resend verification code.");
    }
  };

  const handleQuickFill = () => {
    const demo = otpDemo || "1234";
    const digits = demo.slice(0, 4).split("");
    setOtp(digits);
    handleVerify(demo.slice(0, 4));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Logo size={42} />
            <Text style={styles.title}>Partner Verification</Text>
            <Text style={styles.subtitle}>
              We sent a 4-digit verification code to{"\n"}
              <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>
            {otpDemo && (
              <TouchableOpacity onPress={handleQuickFill} style={styles.demoBadge} activeOpacity={0.7}>
                <Ionicons name="flash" size={12} color={Colors.warningDark} />
                <Text style={styles.demoText}>Auto-fill Code: {otpDemo}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* OTP inputs */}
          <View style={styles.card}>
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
              title={isLoading ? "Verifying..." : "Verify & Open Dashboard"}
              onPress={() => handleVerify()}
              loading={isLoading}
              style={styles.verifyBtn}
            />

            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend code in <Text style={styles.timerBold}>{countdown}s</Text>
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    gap: 12,
  },
  otpBox: {
    width: 58,
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSubtle,
    textAlign: "center",
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verifyBtn: {
    marginBottom: Spacing.base,
  },
  resendContainer: {
    alignItems: "center",
  },
  timerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timerBold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  resendLink: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
});

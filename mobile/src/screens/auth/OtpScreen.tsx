import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { verifyOtp, sendOtp } from "../../store/authSlice";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";

export default function OtpScreen({ route, navigation }: any) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { otpExpiresAt } = useSelector((state: RootState) => state.auth);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = Math.max(0, Math.ceil(((otpExpiresAt ?? 0) - now) / 1000));
  const resendRemaining = Math.max(0, Math.ceil(((otpExpiresAt ?? 0) - 240000 - now) / 1000));
  const handleResendOtp = async () => {
    if (loading || resendRemaining > 0) return;
    setLoading(true);
    try {
      await dispatch(sendOtp(phone)).unwrap();
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      Alert.alert("Error", "Unable to send OTP. Please try again.");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await dispatch(verifyOtp({ phone, otp: otpString })).unwrap();
    } catch (error) {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit code sent on WhatsApp to +91 {phone}
        </Text>

        {/* OTP Expiry Timer */}
        {otpExpiresAt && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {remaining > 0
                ? `Expires in ${remaining}s`
                : "Expired"}
            </Text>
          </View>
        )}

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp} disabled={loading || resendRemaining > 0}>
          <Text style={styles.resendText}>
            {resendRemaining > 0
              ? `Resend in ${resendRemaining}s`
              : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  backButton: {
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    textAlign: "center",
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
  },
  resendText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: "500",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  timerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});

import React, { useState } from "react";
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
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { sendOtp } from "../../../store/authSlice";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { LogoIcon } from "../../../components/Logo";
import { PrimaryButton, Card, useToast } from "../../../components/ui";

export default function CustomerLoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const handleSendOtp = async (inputPhone?: string) => {
    const targetPhone = inputPhone || phone;
    const cleanPhone = targetPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.warning("Invalid Mobile", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      await dispatch(sendOtp(cleanPhone)).unwrap();
      toast.success("Code Sent", `Verification OTP sent to +91 ${cleanPhone}`);
      navigation.navigate("Otp", { phone: cleanPhone });
    } catch {
      toast.info(
        "Development Notice",
        "Could not dispatch OTP via SMS. You can proceed with demo code 1234."
      );
      navigation.navigate("Otp", { phone: cleanPhone });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillCustomer = () => {
    const devCustomerPhone = "9876543211";
    setPhone(devCustomerPhone);
    handleSendOtp(devCustomerPhone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {/* Logo & Header */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrap}>
              <LogoIcon size={80} />
            </View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandKaam}>Kaam</Text>
              <Text style={styles.brandDo}>Do</Text>
            </View>
            <Text style={styles.brandTagline}>Har Kaam, Sahi Insaan</Text>
            <Text style={styles.brandSub}>
              Book trusted plumbers, electricians, carpenters & technicians in minutes.
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Text style={styles.formTitle}>Customer Sign In / Register</Text>
            <Text style={styles.formSubtitle}>
              Enter your mobile number to get an instant verification code.
            </Text>

            <View style={styles.phoneInputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.codeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit mobile"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                onSubmitEditing={() => handleSendOtp()}
                autoFocus={false}
              />
              {phone.length === 10 && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.success}
                  style={styles.validIcon}
                />
              )}
            </View>

            <PrimaryButton
              title="Get OTP Verification Code"
              onPress={() => handleSendOtp()}
              loading={loading}
              disabled={phone.length < 10 || loading}
              style={{ marginTop: Spacing.base }}
            />

            {/* Quick Demo Fill */}
            <TouchableOpacity
              onPress={handleQuickFillCustomer}
              style={styles.quickFillBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={15} color={Colors.primary} />
              <Text style={styles.quickFillText}>Quick Demo Customer (+91 98765 43211)</Text>
            </TouchableOpacity>

            <View style={styles.helpLinksRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword", { phone })}
                style={styles.helpLink}
              >
                <Text style={styles.helpLinkText}>Forgot Password / Account Recovery</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Security & Guarantees */}
          <View style={styles.securityRow}>
            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
              <Text style={styles.securityText}>100% Verified Trades</Text>
            </View>
            <View style={styles.securityDot} />
            <View style={styles.securityItem}>
              <Ionicons name="cash-outline" size={16} color={Colors.success} />
              <Text style={styles.securityText}>Post-Job Payment</Text>
            </View>
            <View style={styles.securityDot} />
            <View style={styles.securityItem}>
              <Ionicons name="lock-closed" size={16} color={Colors.primary} />
              <Text style={styles.securityText}>Encrypted & Safe</Text>
            </View>
          </View>
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
  logoSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoWrap: {
    marginBottom: Spacing.xs,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  brandKaam: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandDo: {
    fontSize: FontSize.xxxl,
    fontWeight: "900",
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: "uppercase",
  },
  brandSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    lineHeight: 18,
    maxWidth: 290,
  },
  card: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  formTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    overflow: "hidden",
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  codeText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  validIcon: {
    marginRight: Spacing.md,
  },
  quickFillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  quickFillText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  helpLinksRow: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 4,
  },
  helpLinkText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  securityText: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  securityDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
  },
});

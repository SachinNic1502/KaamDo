import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { PrimaryButton, Card, useToast } from "../../../components/ui";

export default function CustomerForgotPasswordScreen({ route, navigation }: any) {
  const initialPhone = route.params?.phone || "";
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSendResetCode = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.warning("Invalid Mobile", "Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Recovery Code Sent", `SMS sent to +91 ${cleanPhone}`);
      navigation.navigate("Otp", { phone: cleanPhone });
    }, 600);
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
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Account Recovery</Text>
            <Text style={styles.subtitle}>
              Enter your registered mobile number. We'll send you an instant login OTP.
            </Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <View style={styles.inputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.codeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <PrimaryButton
              title="Send Recovery OTP"
              onPress={handleSendResetCode}
              loading={loading}
              disabled={phone.length < 10 || loading}
              style={{ marginTop: Spacing.xl }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.backToLogin}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    maxWidth: 280,
  },
  card: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  codeText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  backToLogin: {
    marginTop: Spacing.lg,
    alignItems: "center",
    paddingVertical: 6,
  },
  backToLoginText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
});

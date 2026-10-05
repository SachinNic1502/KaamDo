import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Input, PrimaryButton } from "../../../components/ui";
import { api } from "../../../services/api";

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async () => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter your 10-digit registered mobile number");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { phone: cleanPhone, role: "worker" });
      Alert.alert(
        "Verification Code Sent",
        "We sent a password recovery code to your registered mobile number.",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate("Otp", {
                phone: cleanPhone,
                role: "worker",
                isPasswordReset: true,
              }),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to initiate recovery. Please contact partner support.");
    } finally {
      setIsLoading(false);
    }
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Account Recovery</Text>
          <Text style={styles.subtitle}>
            Enter your registered partner mobile number to reset your login credentials.
          </Text>

          <View style={styles.card}>
            <Input
              label="Registered Mobile Number"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              leftIcon="call-outline"
            />

            <PrimaryButton
              title={isLoading ? "Sending Code..." : "Send Recovery Code"}
              onPress={handleResetRequest}
              loading={isLoading}
              style={{ marginTop: Spacing.sm }}
            />
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
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
});

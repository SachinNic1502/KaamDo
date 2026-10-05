import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Input, PrimaryButton, Badge } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store";
import { updateProfile } from "../../../store/authSlice";
import { pickImage, uploadImage } from "../../../services/upload";
import { api } from "../../../services/api";

export const KYCOnboardingScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { workerProfile } = useAppSelector((s) => s.auth);

  const kyc = workerProfile?.kyc;
  const [aadhaar, setAadhaar] = useState(kyc?.aadhaarNumber || "");
  const [pan, setPan] = useState(kyc?.panNumber || "");
  const [aadhaarDoc, setAadhaarDoc] = useState<string | null>(kyc?.aadhaarFrontUrl || null);
  const [panDoc, setPanDoc] = useState<string | null>(kyc?.panCardUrl || null);

  const [accountNumber, setAccountNumber] = useState(workerProfile?.bankDetails?.accountNumber || "");
  const [ifsc, setIfsc] = useState(workerProfile?.bankDetails?.ifscCode || "");
  const [holderName, setHolderName] = useState(workerProfile?.bankDetails?.accountHolderName || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickDoc = async (type: "aadhaar" | "pan") => {
    try {
      const uri = await pickImage();
      if (!uri) return;
      if (type === "aadhaar") setAadhaarDoc(uri);
      if (type === "pan") setPanDoc(uri);
    } catch {
      Alert.alert("Error", "Could not pick image");
    }
  };

  const handleSubmit = async () => {
    if (aadhaar.replace(/\s/g, "").length !== 12) {
      Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number");
      return;
    }
    if (pan.length !== 10) {
      Alert.alert("Invalid PAN", "Please enter a valid 10-character PAN number");
      return;
    }
    if (!accountNumber || !ifsc || !holderName) {
      Alert.alert("Bank Details Required", "Please fill in your complete bank settlement information");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedAadhaar = aadhaarDoc;
      let uploadedPan = panDoc;

      if (aadhaarDoc && !aadhaarDoc.startsWith("http")) {
        uploadedAadhaar = await uploadImage(aadhaarDoc, "kyc");
      }
      if (panDoc && !panDoc.startsWith("http")) {
        uploadedPan = await uploadImage(panDoc, "kyc");
      }

      const payload = {
        kyc: {
          aadhaarNumber: aadhaar,
          panNumber: pan.toUpperCase(),
          aadhaarFrontUrl: uploadedAadhaar,
          panCardUrl: uploadedPan,
          status: "pending",
          submittedAt: new Date().toISOString(),
        },
        bankDetails: {
          accountNumber,
          ifscCode: ifsc.toUpperCase(),
          accountHolderName: holderName,
        },
      };

      await api.patch("/api/workers/me/kyc", payload);
      dispatch(updateProfile(payload as any));

      Alert.alert(
        "Documents Submitted!",
        "Your verification documents have been received. Our compliance team verifies details within 12 hours.",
        [{ text: "Done", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert("Submission Error", err.message || "Could not submit KYC documents.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = kyc?.status || "not_submitted";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC & Identity Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIconWrap}>
              <Ionicons
                name={status === "approved" ? "shield-checkmark" : "time-outline"}
                size={24}
                color={status === "approved" ? Colors.success : Colors.accent}
              />
            </View>
            <View>
              <Text style={styles.statusTitle}>
                {status === "approved"
                  ? "Identity Verified"
                  : status === "pending"
                  ? "Verification In Progress"
                  : "Verification Required"}
              </Text>
              <Text style={styles.statusSub}>
                {status === "approved"
                  ? "Full payout & instant dispatch active"
                  : "Required to receive weekly payouts"}
              </Text>
            </View>
          </View>
          <Badge
            label={status.toUpperCase()}
            variant={status === "approved" ? "success" : "warning"}
          />
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>1. Government Identification</Text>

          <Input
            label="Aadhaar Card Number (12 Digits)"
            placeholder="XXXX XXXX XXXX"
            value={aadhaar}
            onChangeText={setAadhaar}
            keyboardType="numeric"
            maxLength={14}
            leftIcon="card-outline"
          />

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => handlePickDoc("aadhaar")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={aadhaarDoc ? "checkmark-circle" : "cloud-upload-outline"}
              size={24}
              color={aadhaarDoc ? Colors.success : Colors.primary}
            />
            <Text style={styles.uploadText}>
              {aadhaarDoc ? "Aadhaar Card Photo Attached" : "Upload Aadhaar Front Photo"}
            </Text>
          </TouchableOpacity>

          <Input
            label="Permanent Account Number (PAN)"
            placeholder="ABCDE1234F"
            value={pan}
            onChangeText={setPan}
            autoCapitalize="characters"
            maxLength={10}
            leftIcon="document-text-outline"
          />

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => handlePickDoc("pan")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={panDoc ? "checkmark-circle" : "cloud-upload-outline"}
              size={24}
              color={panDoc ? Colors.success : Colors.primary}
            />
            <Text style={styles.uploadText}>
              {panDoc ? "PAN Card Photo Attached" : "Upload PAN Card Photo"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>2. Bank Settlement Account</Text>

          <Input
            label="Account Holder Name"
            placeholder="Name as printed in passbook"
            value={holderName}
            onChangeText={setHolderName}
            leftIcon="person-outline"
          />

          <Input
            label="Bank Account Number"
            placeholder="e.g. 50100456789123"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
            leftIcon="business-outline"
          />

          <Input
            label="Bank IFSC Code"
            placeholder="e.g. HDFC0001234"
            value={ifsc}
            onChangeText={setIfsc}
            autoCapitalize="characters"
            maxLength={11}
            leftIcon="barcode-outline"
          />

          <PrimaryButton
            title={isSubmitting ? "Submitting..." : "Submit Documents for Verification"}
            onPress={handleSubmit}
            loading={isSubmitting}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 115,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusIconWrap: {
    marginRight: Spacing.sm,
  },
  statusTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  sectionHeading: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
});

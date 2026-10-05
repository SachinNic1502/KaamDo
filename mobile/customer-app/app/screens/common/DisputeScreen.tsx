import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { createDispute } from "../../../services/dispute";
import { AppHeader, PrimaryButton, Card, useToast } from "../../../components/ui";

const DISPUTE_REASONS = [
  "Technician did not arrive",
  "Poor quality workmanship",
  "Incorrect charges demanded",
  "Damaged property or fixtures",
  "Rude or unprofessional behavior",
  "Other issue",
];

export default function CustomerDisputeScreen({ route, navigation }: any) {
  const { jobId } = route.params || {};
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (description.trim().length < 15) {
      toast.warning("More Details Required", "Please provide at least 15 characters describing the issue.");
      return;
    }
    setLoading(true);
    try {
      await createDispute({
        jobId,
        reason: selectedReason,
        description: description.trim(),
      });
      toast.success("Dispute Raised", "Our safety resolution team will contact you within 2 business hours.");
      setTimeout(() => navigation.goBack(), 600);
    } catch (err: any) {
      toast.error("Failed to Raise Dispute", err.message || "Please contact customer support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Report an Issue" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={24} color={Colors.error} />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <Text style={styles.alertTitle}>Dispute & Resolution Desk</Text>
              <Text style={styles.alertSub}>
                All payments for this job are held until our team reviews your complaint.
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Select Reason</Text>
          <View style={styles.reasonsList}>
            {DISPUTE_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, isSelected && styles.reasonItemActive]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                  <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>
            Detailed Description
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Explain what went wrong in detail..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <PrimaryButton
            title="Submit Dispute Ticket"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    padding: Spacing.xl,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  alertTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.error,
  },
  alertSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  reasonsList: {
    gap: Spacing.xs,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  reasonItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  reasonText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
  },
  reasonTextActive: {
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 90,
    textAlignVertical: "top",
  },
});

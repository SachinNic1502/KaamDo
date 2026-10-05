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

const WORKER_DISPUTE_REASONS = [
  "Customer absent / Location locked upon arrival",
  "Job scope drastically exceeds original booking",
  "Unsafe, hazardous, or high-risk workspace conditions",
  "Customer refused agreed labor or material charges",
  "Abusive, disrespectful, or threatening behavior",
  "Client unreachable / Invalid contact details",
  "Other partner grievance",
];

export default function WorkerDisputeScreen({ route, navigation }: any) {
  const { jobId, jobNumber } = route.params || {};
  const [selectedReason, setSelectedReason] = useState(WORKER_DISPUTE_REASONS[0]);
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
      toast.success(
        "Grievance Lodged",
        "Our Partner Safety & Arbitration desk will review your report within 2 hours."
      );
      setTimeout(() => navigation.goBack(), 600);
    } catch (err: any) {
      toast.error("Failed to Lodge Grievance", err.message || "Please contact the partner helpline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Partner Grievance & Safety"
        subtitle={jobNumber ? `Job #${jobNumber}` : "Report on-site issues"}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconCircle}>
              <Ionicons name="shield-half" size={22} color={Colors.primary} />
            </View>
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <Text style={styles.alertTitle}>Partner Protection Protocol</Text>
              <Text style={styles.alertSub}>
                Your earnings and rating are protected while our safety and resolution team evaluates this incident.
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Select Primary Reason</Text>
          <View style={styles.reasonsList}>
            {WORKER_DISPUTE_REASONS.map((reason) => {
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

          <Text style={styles.fieldLabel}>Incident Description</Text>
          <Text style={styles.fieldSub}>
            Please describe what happened in detail (timings, photos taken, client statements):
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Provide clear facts regarding work conditions, scope mismatch, or delays..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <PrimaryButton
            title="Submit Report to Partner Desk"
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
    paddingBottom: 115,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.primarySubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    marginBottom: Spacing.lg,
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  alertSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  fieldSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  reasonsList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  reasonItemActive: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  reasonText: {
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    flex: 1,
  },
  reasonTextActive: {
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  textArea: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 110,
  },
});

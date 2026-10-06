import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius } from "../../constants";
import { Job } from "../../types";

export interface JobScopeCardProps {
  job: Job;
}

export const JobScopeCard: React.FC<JobScopeCardProps> = ({ job }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Task Scope & Requirements</Text>
      <View style={styles.scopeRow}>
        <Text style={styles.scopeCategory}>
          {job.categoryId?.name || "Service"}
        </Text>
        <Text style={styles.scopePrice}>
          ₹{(job.finalPrice || job.estimatedPrice || 0).toLocaleString("en-IN")}
        </Text>
      </View>
      <Text style={styles.scopeDesc}>{job.description}</Text>

      {/* Additional Charges if any */}
      {job.additionalCharges && job.additionalCharges.length > 0 && (
        <View style={styles.extraChargesList}>
          <Text style={styles.extraChargesTitle}>Extra Charges (Customer Approval):</Text>
          {job.additionalCharges.map((c: any, idx: number) => (
            <View key={idx} style={styles.extraChargeItem}>
              <Text style={styles.extraChargeReason}>
                {c.reason} ({c.status})
              </Text>
              <Text style={styles.extraChargeAmt}>+₹{c.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Installed Parts & Materials if any */}
      {job.materials && job.materials.length > 0 && (
        <View style={styles.extraChargesList}>
          <Text style={styles.extraChargesTitle}>Installed Parts & Materials:</Text>
          {job.materials.map((m: any, idx: number) => (
            <View key={idx} style={styles.extraChargeItem}>
              <Text style={styles.extraChargeReason}>
                {m.name} (x{m.quantity})
              </Text>
              <Text style={styles.extraChargeAmt}>
                +₹{m.totalPrice || (m.quantity * m.unitPrice)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  scopeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scopeCategory: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  scopePrice: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  scopeDesc: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  extraChargesList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  extraChargesTitle: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  extraChargeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  extraChargeReason: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  extraChargeAmt: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});

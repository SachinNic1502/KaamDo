import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { PrimaryButton, SecondaryButton } from "../ui";

export interface JobActionCardProps {
  status: string;
  isPending: boolean;
  onStartJourney: () => void;
  onArrived: () => void;
  onOpenStartOtp: () => void;
  onOpenCompleteOtp: () => void;
  onOpenChargeModal: () => void;
  onOpenMaterialModal: () => void;
}

export const JobActionCard: React.FC<JobActionCardProps> = ({
  status,
  isPending,
  onStartJourney,
  onArrived,
  onOpenStartOtp,
  onOpenCompleteOtp,
  onOpenChargeModal,
  onOpenMaterialModal,
}) => {
  return (
    <View style={styles.actionCard}>
      <Text style={styles.actionCardLabel}>Current Step</Text>
      {status === "worker_assigned" || status === "worker_accepted" ? (
        <>
          <Text style={styles.actionCardTitle}>Ready to depart?</Text>
          <Text style={styles.actionCardSub}>
            Tap below when you start your journey to notify the customer.
          </Text>
          <PrimaryButton
            title="Start Journey to Location"
            onPress={onStartJourney}
            loading={isPending}
            style={{ marginTop: Spacing.sm }}
          />
        </>
      ) : status === "on_the_way" ? (
        <>
          <Text style={styles.actionCardTitle}>On The Way</Text>
          <Text style={styles.actionCardSub}>
            Navigate to customer location and tap Arrived once at the door.
          </Text>
          <PrimaryButton
            title="I Have Arrived at Location"
            onPress={onArrived}
            loading={isPending}
            style={{ marginTop: Spacing.sm }}
          />
        </>
      ) : status === "arrived" ? (
        <>
          <Text style={styles.actionCardTitle}>Arrived at Destination</Text>
          <Text style={styles.actionCardSub}>
            Ask the customer for their 4-digit Start OTP before beginning tools setup.
          </Text>
          <PrimaryButton
            title="Verify Start OTP & Begin"
            onPress={onOpenStartOtp}
            style={{ marginTop: Spacing.sm }}
          />
        </>
      ) : status === "work_started" || status === "in_progress" ? (
        <>
          <Text style={styles.actionCardTitle}>Service Work in Progress</Text>
          <Text style={styles.actionCardSub}>
            Perform service as agreed. When finished, request customer's Completion OTP.
          </Text>
          <View style={styles.subActionsRow}>
            <SecondaryButton
              title="+ Extra Labor"
              onPress={onOpenChargeModal}
              style={{ flex: 1 }}
            />
            <SecondaryButton
              title="+ Add Part"
              onPress={onOpenMaterialModal}
              style={{ flex: 1 }}
            />
          </View>
          <PrimaryButton
            title="Finish & Verify OTP"
            onPress={onOpenCompleteOtp}
            style={{ marginTop: Spacing.sm }}
          />
        </>
      ) : (
        <>
          <Text style={styles.actionCardTitle}>Job {status.toUpperCase()}</Text>
          <Text style={styles.actionCardSub}>
            Settlement has been recorded in your earnings ledger.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  actionCardLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionCardTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  subActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});

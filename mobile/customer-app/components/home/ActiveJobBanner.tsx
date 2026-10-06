import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";
import { SectionHeader } from "../ui";

interface ActiveJobBannerProps {
  jobs: any[];
  onManageAll: () => void;
  onTrackJob: (jobId: string) => void;
}

export const ActiveJobBanner: React.FC<ActiveJobBannerProps> = ({
  jobs,
  onManageAll,
  onTrackJob,
}) => {
  if (!jobs || jobs.length === 0) return null;

  const currentJob = jobs[0];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "worker_assigned":
        return "Worker Assigned";
      case "worker_accepted":
        return "Specialist Confirmed";
      case "on_the_way":
        return "Specialist En Route";
      case "arrived":
        return "Specialist Arrived";
      case "work_started":
      case "in_progress":
        return "Work In Progress";
      case "searching":
      default:
        return "Dispatching Nearby Specialist";
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Live Ongoing Service"
        count={jobs.length}
        actionText="Manage All"
        onAction={onManageAll}
      />

      <View style={styles.trackingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>{getStatusLabel(currentJob.status)}</Text>
          </View>
          <Text style={styles.jobNumber}>
            #{currentJob.jobNumber || currentJob._id?.slice(-6)?.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {currentJob.description || "Active Home Service Work"}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.workerMeta}>
            <Text style={styles.workerLabel}>Assigned Specialist</Text>
            <Text style={styles.workerName} numberOfLines={1}>
              {currentJob.workerId?.name || "Assigning top verified pro..."}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => onTrackJob(currentJob._id)}
            activeOpacity={0.8}
          >
            <Text style={styles.trackButtonText}>Track</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  trackingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  jobNumber: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  jobDescription: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  workerMeta: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  workerLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  workerName: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 1,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  trackButtonText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 2,
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize, BorderRadius } from "../../utils/constants";
import { SectionHeader, WorkerCard, SkeletonCard } from "../ui";

interface FeaturedWorkersSectionProps {
  workers: any[];
  isLoading: boolean;
  onBrowseAll: () => void;
  onSelectWorker: (workerId: string) => void;
  onHireWorker: (workerId: string) => void;
}

export const FeaturedWorkersSection: React.FC<FeaturedWorkersSectionProps> = ({
  workers,
  isLoading,
  onBrowseAll,
  onSelectWorker,
  onHireWorker,
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title="Featured Verified Specialists"
        actionText="Browse All"
        onAction={onBrowseAll}
      />

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard height={96} borderRadius={16} />
          <SkeletonCard height={96} borderRadius={16} />
        </View>
      ) : workers.length > 0 ? (
        workers.map((worker) => (
          <WorkerCard
            key={worker._id}
            worker={worker}
            onPress={() => onSelectWorker(worker._id)}
            onHirePress={() => onHireWorker(worker._id)}
          />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Specialists Listed Nearby</Text>
          <Text style={styles.emptySub}>
            Post a service request and our dispatcher will match top verified pros to your job.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  skeletonWrap: {
    gap: Spacing.sm,
  },
  emptyBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});

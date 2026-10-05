import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { EmptyState, SkeletonCard } from "../../../components/ui";
import { useIncomingRequests, useAcceptJob, useRejectJob } from "../../../hooks/use-api";
import { Job } from "../../../types";

export const RequestsScreen = ({ navigation }: any) => {
  const [filter, setFilter] = useState<"all" | "today" | "high_value">("all");
  const { data: requests = [], isLoading, refetch } = useIncomingRequests();
  const acceptMutation = useAcceptJob();
  const rejectMutation = useRejectJob();

  const filteredRequests = requests.filter((job) => {
    if (filter === "high_value") {
      return (job.estimatedPrice || 0) >= 1000;
    }
    if (filter === "today") {
      if (!job.scheduledDate) return true;
      const todayStr = new Date().toISOString().split("T")[0];
      return job.scheduledDate.startsWith(todayStr);
    }
    return true;
  });

  const handleAccept = (job: Job) => {
    Alert.alert(
      "Confirm Job Acceptance",
      `Accept service request for "${job.description.slice(0, 50)}..."? The customer will be informed immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept & Lock Job",
          onPress: async () => {
            try {
              await acceptMutation.mutateAsync(job._id);
              Alert.alert("Success", "Job assigned to your active queue!", [
                {
                  text: "View Job",
                  onPress: () => navigation.navigate("JobDetail", { jobId: job._id }),
                },
              ]);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to accept job");
            }
          },
        },
      ]
    );
  };

  const handleReject = (job: Job) => {
    Alert.alert("Pass on Request?", "This job will be reassigned to other nearby partners.", [
      { text: "Keep", style: "cancel" },
      {
        text: "Pass",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectMutation.mutateAsync({ jobId: job._id });
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to decline job");
          }
        },
      },
    ]);
  };

  const renderRequestItem = ({ item }: { item: Job }) => {
    const formattedDate = item.scheduledDate
      ? new Date(item.scheduledDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Immediate / Today";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>
              {item.categoryId?.name || "Service Request"}
            </Text>
          </View>
          <Text style={styles.price}>
            ₹{(item.estimatedPrice || 499).toLocaleString("en-IN")}
          </Text>
        </View>

        <Text style={styles.jobTitle} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{item.scheduledTime || "Flexible hours"}</Text>
            </View>
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.address?.city || "Local area"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.customerId?.name || "Customer"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={Colors.error} />
            <Text style={styles.rejectBtnText}>Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.inspectBtn}
            onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}
            activeOpacity={0.7}
          >
            <Text style={styles.inspectBtnText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark" size={16} color={Colors.white} />
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Requests</Text>
        <Text style={styles.headerSubtitle}>
          Real-time service orders broadcasted to your trade
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[styles.filterChipText, filter === "all" && styles.filterChipTextActive]}
          >
            All ({requests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === "today" && styles.filterChipActive]}
          onPress={() => setFilter("today")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "today" && styles.filterChipTextActive,
            ]}
          >
            For Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === "high_value" && styles.filterChipActive]}
          onPress={() => setFilter("high_value")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "high_value" && styles.filterChipTextActive,
            ]}
          >
            High Value (₹1k+)
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} height={160} style={{ marginBottom: Spacing.md }} />
          ))}
        </View>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon="radio-outline"
          title="No Requests in this Filter"
          description="We are scanning for new customer bookings. Check back in a moment or switch filters."
          actionTitle="Refresh Live Feed"
          onActionPress={refetch}
        />
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: "700",
  },
  loadingContainer: {
    padding: Spacing.base,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 115,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  categoryPillText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  jobTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  metaCol: {
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
    maxWidth: 140,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  rejectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.error,
    marginLeft: 3,
  },
  inspectBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  inspectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  acceptBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  acceptBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginLeft: 4,
  },
});

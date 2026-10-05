import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { StatusBadge, EmptyState, SkeletonCard } from "../../../components/ui";
import { useWorkerJobs } from "../../../hooks/use-api";
import { Job } from "../../../types";

export const JobsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const {
    data: allJobs = [],
    isLoading,
    refetch,
  } = useWorkerJobs();

  const activeJobs = allJobs.filter((j) =>
    ["worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress", "waiting_approval", "completion_requested"].includes(
      j.status
    )
  );

  const completedJobs = allJobs.filter((j) =>
    ["completed", "paid", "closed", "cancelled"].includes(j.status)
  );

  const displayList = activeTab === "active" ? activeJobs : completedJobs;

  const renderJobItem = ({ item }: { item: Job }) => {
    const formattedDate = item.scheduledDate
      ? new Date(item.scheduledDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Schedule TBD";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.jobNumber}>{item.jobNumber || "#JOB"}</Text>
            {item.categoryId?.name && (
              <Text style={styles.categoryBadge}>{item.categoryId.name}</Text>
            )}
          </View>
          <StatusBadge status={item.status} size="sm" />
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.address?.city || "Local area"}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.customerLabel}>Customer</Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customerId?.name || "Verified Customer"}
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Payout</Text>
            <Text style={styles.priceValue}>
              ₹{(item.finalPrice || item.estimatedPrice || 0).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <Text style={styles.headerSubtitle}>
          Track your ongoing service executions and past history
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>
            Active ({activeJobs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.tabActive]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
            History ({completedJobs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} height={140} style={{ marginBottom: Spacing.md }} />
          ))}
        </View>
      ) : displayList.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title={activeTab === "active" ? "No Active Jobs" : "No Job History Yet"}
          description={
            activeTab === "active"
              ? "Accept incoming requests from the Requests tab to start earning."
              : "Completed jobs and customer ratings will be archived here."
          }
          actionTitle={activeTab === "active" ? "Browse Requests" : undefined}
          onActionPress={activeTab === "active" ? () => navigation.navigate("Requests") : undefined}
        />
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item) => item._id}
          renderItem={renderJobItem}
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
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSubtle,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: 3,
    borderRadius: BorderRadius.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    fontWeight: "700",
    color: Colors.textPrimary,
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
  idGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobNumber: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  categoryBadge: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  customerLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  customerName: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 1,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 1,
  },
});

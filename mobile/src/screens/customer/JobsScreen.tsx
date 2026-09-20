import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";
import { useJobs } from "../../hooks/use-api";
import { onJobStatusUpdate } from "../../services/chat";

type JobTab = "active" | "completed" | "cancelled";

const tabs: { key: JobTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const activeStatuses = [
  "searching",
  "worker_assigned",
  "worker_accepted",
  "on_the_way",
  "arrived",
  "work_started",
  "in_progress",
];

const completedStatuses = ["completed", "paid"];

const cancelledStatuses = ["cancelled"];

const statusColors: Record<string, string> = {
  searching: Colors.warning,
  worker_assigned: Colors.info,
  worker_accepted: Colors.info,
  on_the_way: Colors.primaryLight,
  arrived: Colors.primary,
  in_progress: Colors.primary,
  completed: Colors.success,
  cancelled: Colors.error,
};

function getStatusForTab(status: string, tab: JobTab): boolean {
  if (tab === "active") return activeStatuses.includes(status);
  if (tab === "completed") return completedStatuses.includes(status);
  if (tab === "cancelled") return cancelledStatuses.includes(status);
  return false;
}

export default function JobsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<JobTab>("active");
  const user = useSelector((state: any) => state.auth.user);
  const { data: jobData, isLoading, refetch } = useJobs({ customerId: user?._id });

  useEffect(() => {
    const unsubscribe = onJobStatusUpdate((data) => {
      refetch();
    });
    return () => unsubscribe();
  }, []);

  const allJobs = jobData?.data ?? [];
  const filteredJobs = allJobs.filter((job: any) => getStatusForTab(job.status, activeTab));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Jobs</Text>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="briefcase-outline"
              size={64}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No {activeTab} jobs</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "active"
                ? "Your active jobs will appear here"
                : activeTab === "completed"
                  ? "Completed jobs will show up here"
                  : "No cancelled jobs"}
            </Text>
          </View>
        ) : (
          filteredJobs.map((job: any) => (
            <TouchableOpacity
              key={job._id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("JobDetail", { jobId: job._id })
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (statusColors[job.status] || Colors.textMuted) + "15" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors[job.status] || Colors.textMuted },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusColors[job.status] || Colors.textMuted },
                    ]}
                  >
                    {job.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </Text>
                </View>
              </View>

              <Text style={styles.serviceName}>{job.categoryId?.name ?? "Service"}</Text>

              <View style={styles.cardFooter}>
                <View style={styles.workerInfo}>
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.workerName}>{job.workerId?.name ?? "Unassigned"}</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.date}>{new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
                style={styles.arrow}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary + "15",
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  jobNumber: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  serviceName: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  arrow: {
    position: "absolute",
    right: Spacing.md,
    top: "50%",
    marginTop: -9,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});

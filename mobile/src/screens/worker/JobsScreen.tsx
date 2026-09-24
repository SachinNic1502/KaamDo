import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";
import { useJobs } from "../../hooks/use-api";

type JobTab = "active" | "pending" | "completed";

interface Job {
  id: string;
  jobNumber: string;
  customerName: string;
  service: string;
  status: string;
  date: string;
}

const tabs: { key: JobTab; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const statusColorMap: Record<string, string> = {
  worker_assigned: Colors.info,
  worker_accepted: Colors.info,
  on_the_way: Colors.primaryLight,
  arrived: Colors.primary,
  work_started: Colors.primaryDark,
  in_progress: Colors.primary,
  searching: Colors.warning,
  waiting_approval: Colors.warning,
  completion_requested: Colors.warning,
  draft: Colors.textMuted,
  completed: Colors.success,
  paid: Colors.success,
  closed: Colors.textMuted,
  cancelled: Colors.error,
  disputed: Colors.error,
};

const statusLabelMap: Record<string, string> = {
  worker_assigned: "Assigned",
  worker_accepted: "Accepted",
  on_the_way: "On The Way",
  arrived: "Arrived",
  work_started: "Work Started",
  in_progress: "In Progress",
  searching: "Searching",
  waiting_approval: "Waiting Approval",
  completion_requested: "Completion Requested",
  draft: "Draft",
  completed: "Completed",
  paid: "Paid",
  closed: "Closed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const mockJobs: Job[] = [
  {
    id: "1",
    jobNumber: "#1024",
    customerName: "Ravi Kumar",
    service: "Plumbing Repair",
    status: "in_progress",
    date: "Sep 20, 2026",
  },
  {
    id: "2",
    jobNumber: "#1025",
    customerName: "Priya Sharma",
    service: "Electrical Wiring",
    status: "on_the_way",
    date: "Sep 20, 2026",
  },
  {
    id: "3",
    jobNumber: "#1020",
    customerName: "Amit Singh",
    service: "AC Installation",
    status: "worker_assigned",
    date: "Sep 19, 2026",
  },
  {
    id: "4",
    jobNumber: "#1018",
    customerName: "Sneha Patel",
    service: "Painting",
    status: "searching",
    date: "Sep 19, 2026",
  },
  {
    id: "5",
    jobNumber: "#1015",
    customerName: "Vikram Joshi",
    service: "Carpentry Work",
    status: "completed",
    date: "Sep 18, 2026",
  },
];

export default function JobsScreen() {
  const [activeTab, setActiveTab] = useState<JobTab>("active");
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.user);

  const { data: jobsRes } = useJobs({ workerId: user?._id });
  const allJobs: Job[] = (jobsRes?.data ?? []).map((j: any) => ({
    id: j._id,
    jobNumber: j.jobNumber ?? `#${j._id?.slice(-4)}`,
    customerName: j.customerId?.name ?? 'Customer',
    service: j.categoryId?.name ?? j.title ?? 'Service',
    status: j.status,
    date: j.scheduledDate ?? '—',
  }));

  const filteredJobs = allJobs.filter((job) => {
    if (activeTab === "active") {
      return [
        "worker_assigned",
        "worker_accepted",
        "on_the_way",
        "arrived",
        "work_started",
        "in_progress",
      ].includes(job.status);
    }
    if (activeTab === "pending") {
      return ["searching", "waiting_approval", "completion_requested", "draft"].includes(job.status);
    }
    return ["completed", "paid", "closed"].includes(job.status);
  });

  const handleJobPress = (jobId: string) => {
    navigation.navigate("WorkerJobDetail", { jobId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No {activeTab} jobs</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "active"
                ? "You have no active jobs right now"
                : activeTab === "pending"
                ? "No pending jobs at the moment"
                : "No completed jobs yet"}
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              onPress={() => handleJobPress(job.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.jobNumber}>{job.jobNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (statusColorMap[job.status] || Colors.textMuted) + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColorMap[job.status] || Colors.textMuted },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: statusColorMap[job.status] || Colors.textMuted },
                    ]}
                  >
                    {statusLabelMap[job.status] || job.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.customerName}>{job.customerName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="construct-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.serviceName}>{job.service}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.dateText}>{job.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text,
  },
  filterButton: {
    padding: Spacing.sm,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  jobNumber: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
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
  cardBody: {
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  customerName: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  serviceName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
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
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});

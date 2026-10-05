import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useJobs } from "../../../hooks/use-api";
import { AppHeader, FilterChip, JobCard, SkeletonCard, EmptyState } from "../../../components/ui";

const TABS = ["All", "In Progress", "Active", "Completed", "Cancelled"];

export default function CustomerJobsScreen({ navigation }: any) {
  const user = useSelector((state: any) => state.auth.user);
  const [selectedTab, setSelectedTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useJobs({
    customerId: user?._id,
    asCustomer: "true",
  });

  const allJobs = data?.data ?? [];

  // Identify if any job is currently in progress on site
  const liveInProgressJob = useMemo(() => {
    return allJobs.find((j) =>
      ["work_started", "in_progress", "waiting_approval", "completion_requested"].includes(j.status)
    );
  }, [allJobs]);

  const filteredJobs = useMemo(() => {
    switch (selectedTab) {
      case "In Progress":
        return allJobs.filter((j) =>
          [
            "work_started",
            "in_progress",
            "waiting_approval",
            "completion_requested",
            "arrived",
          ].includes(j.status)
        );
      case "Active":
        return allJobs.filter((j) =>
          [
            "searching",
            "worker_assigned",
            "worker_accepted",
            "on_the_way",
            "arrived",
            "work_started",
            "in_progress",
            "waiting_approval",
            "completion_requested",
            "rework_requested",
          ].includes(j.status)
        );
      case "Completed":
        return allJobs.filter((j) => ["completed", "paid", "closed"].includes(j.status));
      case "Cancelled":
        return allJobs.filter((j) => ["cancelled", "rejected", "disputed", "refunded"].includes(j.status));
      default:
        return allJobs;
    }
  }, [allJobs, selectedTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="My Bookings" subtitle="Live tracking & service history" />

      {/* Filter Tabs */}
      <View style={styles.tabsWrap}>
        {TABS.map((tab) => {
          let count = 0;
          if (tab === "In Progress") {
            count = allJobs.filter((j) =>
              ["work_started", "in_progress", "waiting_approval", "completion_requested", "arrived"].includes(j.status)
            ).length;
          } else if (tab === "Active") {
            count = allJobs.filter((j) =>
              ["searching", "worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress", "waiting_approval", "completion_requested"].includes(j.status)
            ).length;
          }

          const label = count > 0 && (tab === "In Progress" || tab === "Active") ? `${tab} (${count})` : tab;

          return (
            <FilterChip
              key={tab}
              label={label}
              selected={selectedTab === tab}
              onPress={() => setSelectedTab(tab)}
            />
          );
        })}
      </View>

      {/* Live In-Progress Quick Alert Banner */}
      {liveInProgressJob && selectedTab !== "Completed" && selectedTab !== "Cancelled" && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate("JobDetail", { jobId: liveInProgressJob._id })}
          style={styles.liveBanner}
        >
          <View style={styles.livePulseDot} />
          <View style={{ flex: 1 }}>
            <View style={styles.liveBannerTitleRow}>
              <Text style={styles.liveBannerTitle}>
                Service In Progress: {liveInProgressJob.jobNumber || "Active Booking"}
              </Text>
              <Text style={styles.liveTag}>LIVE</Text>
            </View>
            <Text style={styles.liveBannerSub} numberOfLines={1}>
              {liveInProgressJob.categoryId?.name || liveInProgressJob.description || "Technician is on site"} • Tap to view timer & approve costs
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Bookings List */}
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.listContent}>
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="briefcase-outline"
                title="No Bookings Found"
                description={
                  selectedTab === "All"
                    ? "You haven't requested any services yet. Need a technician?"
                    : selectedTab === "In Progress"
                    ? "You currently have no jobs being actively executed on site."
                    : `You have no ${selectedTab.toLowerCase()} bookings at the moment.`
                }
                actionTitle="Post a Service Request"
                onActionPress={() => navigation.navigate("CreateJob")}
              />
            }
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={() => navigation.navigate("JobDetail", { jobId: item._id })}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsWrap: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 105,
    gap: Spacing.sm,
  },
  liveBanner: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "#F0FDFA",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#99F6E4",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0D9488",
  },
  liveBannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveBannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: "#0F766E",
  },
  liveTag: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.white,
    backgroundColor: "#0D9488",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
  },
  liveBannerSub: {
    fontSize: FontSize.xs,
    color: "#115E59",
    marginTop: 2,
  },
});

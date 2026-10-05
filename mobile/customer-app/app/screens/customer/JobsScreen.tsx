import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../../utils/constants";
import { useJobs } from "../../../hooks/use-api";
import { AppHeader, FilterChip, JobCard, SkeletonCard, EmptyState } from "../../../components/ui";

const TABS = ["All", "Active", "Completed", "Cancelled"];

export default function CustomerJobsScreen({ navigation }: any) {
  const user = useSelector((state: any) => state.auth.user);
  const [selectedTab, setSelectedTab] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useJobs({
    customerId: user?._id,
  });

  const allJobs = data?.data ?? [];

  const filteredJobs = useMemo(() => {
    switch (selectedTab) {
      case "Active":
        return allJobs.filter((j) =>
          ["searching", "worker_assigned", "on_the_way", "arrived", "work_started"].includes(j.status)
        );
      case "Completed":
        return allJobs.filter((j) => ["completed", "paid", "closed"].includes(j.status));
      case "Cancelled":
        return allJobs.filter((j) => ["cancelled", "disputed"].includes(j.status));
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
        {TABS.map((tab) => (
          <FilterChip
            key={tab}
            label={tab}
            selected={selectedTab === tab}
            onPress={() => setSelectedTab(tab)}
          />
        ))}
      </View>

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
});

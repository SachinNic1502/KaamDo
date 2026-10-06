import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSelector } from "react-redux";
import { Colors, Spacing } from "../../../utils/constants";
import { useCategories, useJobs, useWorkers } from "../../../hooks/use-api";
import {
  HomeHeader,
  HomeSearchBar,
  HomeHeroBanner,
  ActiveJobBanner,
  CategoryGrid,
  TrustValueStrip,
  FeaturedWorkersSection,
} from "../../../components/home";

interface HomeScreenProps {
  navigation: any;
}

export default function CustomerHomeScreen({ navigation }: HomeScreenProps) {
  const user = useSelector((state: any) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: catData,
    isLoading: catLoading,
    refetch: refetchCategories,
  } = useCategories();

  const {
    data: jobData,
    isLoading: jobLoading,
    refetch: refetchJobs,
  } = useJobs({ customerId: user?._id });

  const {
    data: workerData,
    isLoading: workerLoading,
    refetch: refetchWorkers,
  } = useWorkers({ limit: 4 });

  const categories = catData?.data ?? [];
  const jobs = jobData?.data ?? [];
  const workers = workerData?.data ?? [];

  const activeJobs = jobs.filter((j) =>
    [
      "searching",
      "worker_assigned",
      "worker_accepted",
      "on_the_way",
      "arrived",
      "work_started",
      "in_progress",
    ].includes(j.status)
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchJobs(), refetchWorkers()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* 1. Header with Brand, Notifications & User Location */}
      <HomeHeader
        user={user}
        onNotificationsPress={() => navigation.navigate("Notifications")}
        onProfilePress={() => navigation.navigate("Profile")}
        onLocationPress={() => navigation.navigate("SavedAddresses")}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* 2. Search Bar with Filter Trigger */}
        <HomeSearchBar
          onPress={() => navigation.navigate("Search")}
          placeholder="Search electricians, plumbers, AC repair..."
        />

        {/* 3. Hero Guaranteed Services Banner */}
        <HomeHeroBanner
          onBookPress={() => navigation.navigate("CreateJob")}
        />

        {/* 4. Live In-Progress Job Tracking Card */}
        <ActiveJobBanner
          jobs={activeJobs}
          onManageAll={() => navigation.navigate("Bookings")}
          onTrackJob={(jobId) => navigation.navigate("JobDetail", { jobId })}
        />

        {/* 5. Trade Categories Grid */}
        <CategoryGrid
          categories={categories}
          isLoading={catLoading}
          onViewAll={() => navigation.navigate("Services")}
          onSelectCategory={(categoryName) =>
            navigation.navigate("CreateJob", { preselectedCategory: categoryName })
          }
        />

        {/* 6. Trust Value & Warranty Strip */}
        <TrustValueStrip />

        {/* 7. Featured Top Specialists Section */}
        <FeaturedWorkersSection
          workers={workers}
          isLoading={workerLoading}
          onBrowseAll={() => navigation.navigate("Search")}
          onSelectWorker={(workerId) =>
            navigation.navigate("WorkerDetail", { workerId })
          }
          onHireWorker={(workerId) =>
            navigation.navigate("CreateJob", { preselectedWorker: workerId })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 115,
  },
});

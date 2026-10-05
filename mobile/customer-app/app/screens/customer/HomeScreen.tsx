import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useCategories, useJobs, useWorkers } from "../../../hooks/use-api";
import {
  SectionHeader,
  JobCard,
  WorkerCard,
  SkeletonCard,
  Avatar,
  Badge,
  LogoWordmark,
} from "../../../components/ui";

interface HomeScreenProps {
  navigation: any;
}

const CATEGORY_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  plumbing: { icon: "water-outline", color: "#0284C7", bg: "#F0F9FF" },
  electrical: { icon: "flash-outline", color: "#D97706", bg: "#FFFBEB" },
  carpentry: { icon: "hammer-outline", color: "#B45309", bg: "#FEF3C7" },
  painting: { icon: "color-palette-outline", color: "#7C3AED", bg: "#F5F3FF" },
  cleaning: { icon: "sparkles-outline", color: "#059669", bg: "#ECFDF5" },
  appliance: { icon: "tv-outline", color: "#DC2626", bg: "#FEF2F2" },
  hvac: { icon: "snow-outline", color: "#0891B2", bg: "#ECFEFF" },
  masonry: { icon: "construct-outline", color: "#475569", bg: "#F1F5F9" },
  default: { icon: "grid-outline", color: Colors.primary, bg: Colors.primaryLight },
};

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
    ["searching", "worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"].includes(j.status)
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchJobs(), refetchWorkers()]);
    setRefreshing(false);
  };

  const getCatMeta = (slug?: string) => {
    if (!slug) return CATEGORY_META.default;
    const key = Object.keys(CATEGORY_META).find((k) => slug.toLowerCase().includes(k));
    return key ? CATEGORY_META[key] : CATEGORY_META.default;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Brand Bar with Logo & Notifications */}
      <View style={styles.brandRow}>
        <LogoWordmark width={136} />
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Location & User Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Avatar
            uri={user?.avatar}
            name={user?.name || "Customer"}
            size={42}
            isVerified
          />
          <View style={styles.headerTextWrap}>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.locationCity}>
                {user?.city || user?.address?.city || "Indiranagar, Bengaluru"}
              </Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
            </View>
            <Text style={styles.userNameText} numberOfLines={1}>
              Hello, {user?.name ? user.name.split(" ")[0] : "Customer"} 👋
            </Text>
          </View>
        </View>
      </View>

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
        {/* Sleek Search Bar */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Search")}
          activeOpacity={0.88}
          style={styles.searchBar}
        >
          <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
          <Text style={styles.searchPlaceholder}>
            Search electricians, plumbers, painters...
          </Text>
          <View style={styles.filterShortcut}>
            <Ionicons name="options-outline" size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Hero Banner with Modern Deep Navy / Royal Accent */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextCol}>
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.accent} />
              <Text style={styles.verifiedTagText}>KAAMDO GUARANTEED</Text>
            </View>
            <Text style={styles.heroTitle}>Verified Home Services at Your Doorstep</Text>
            <Text style={styles.heroSubtitle}>
              Transparent pricing, background-checked pros & 30-day work warranty.
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate("CreateJob")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Book an Expert</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Active Bookings Card (if any) */}
        {activeJobs.length > 0 && (
          <View style={styles.activeSection}>
            <SectionHeader
              title="Ongoing Service"
              count={activeJobs.length}
              actionText="Manage All"
              onAction={() => navigation.navigate("Bookings")}
            />
            {activeJobs.slice(0, 1).map((job) => (
              <View key={job._id} style={styles.liveTrackingCard}>
                <View style={styles.liveCardHeader}>
                  <View style={styles.liveStatusRow}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveStatusText}>
                      {job.status === "worker_assigned"
                        ? "Worker Confirmed & Assigned"
                        : job.status === "on_the_way"
                        ? "Worker is En Route"
                        : job.status === "arrived"
                        ? "Worker Reached Location"
                        : job.status === "work_started"
                        ? "Service In Progress"
                        : "Finding Best Match"}
                    </Text>
                  </View>
                  <Text style={styles.liveJobNumber}>#{job.jobNumber || job._id.slice(-6)}</Text>
                </View>

                <Text style={styles.liveTitle} numberOfLines={1}>
                  {job.description}
                </Text>

                <View style={styles.liveFooter}>
                  <View>
                    <Text style={styles.liveWorkerLabel}>Assigned Specialist</Text>
                    <Text style={styles.liveWorkerName}>
                      {job.workerId?.name || "Assigning top pro nearby..."}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.liveTrackBtn}
                    onPress={() => navigation.navigate("JobDetail", { jobId: job._id })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.liveTrackBtnText}>Track Status</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Trade Categories Grid */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="Browse Categories"
            actionText="View All"
            onAction={() => navigation.navigate("Services")}
          />

          {catLoading ? (
            <View style={styles.categoriesRow}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.catSkeleton}>
                  <SkeletonCard height={80} borderRadius={16} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.categoryGrid}>
              {categories.slice(0, 8).map((cat) => {
                const meta = getCatMeta(cat.slug || cat.name);
                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={styles.categoryTile}
                    onPress={() =>
                      navigation.navigate("CreateJob", { preselectedCategory: cat.name })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIconWrap, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={24} color={meta.color} />
                    </View>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <Text style={styles.categoryCount}>
                      {cat.subcategories?.length || 1}+ options
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Trust Value Badges Strip */}
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.trustTitle}>Vetted Pros</Text>
            <Text style={styles.trustSub}>Police & KYC verified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="cash-outline" size={20} color={Colors.success} />
            <Text style={styles.trustTitle}>Fixed Rates</Text>
            <Text style={styles.trustSub}>No surprise charges</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="time-outline" size={20} color={Colors.accent} />
            <Text style={styles.trustTitle}>On-Time Arrival</Text>
            <Text style={styles.trustSub}>Or instant discount</Text>
          </View>
        </View>

        {/* Top Verified Professionals */}
        <View style={styles.sectionWrap}>
          <SectionHeader
            title="Featured Top Specialists"
            actionText="Browse All"
            onAction={() => navigation.navigate("Search")}
          />

          {workerLoading ? (
            <View style={{ gap: Spacing.sm }}>
              <SkeletonCard height={96} borderRadius={16} />
              <SkeletonCard height={96} borderRadius={16} />
            </View>
          ) : workers.length > 0 ? (
            workers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onPress={() =>
                  navigation.navigate("WorkerDetail", { workerId: worker._id })
                }
                onHirePress={() =>
                  navigation.navigate("CreateJob", { preselectedWorker: worker._id })
                }
              />
            ))
          ) : (
            <View style={styles.emptyWorkersBox}>
              <Text style={styles.emptyWorkersText}>
                No verified specialists currently active in this locality.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTextWrap: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  locationCity: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  userNameText: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 105,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    height: 48,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  searchPlaceholder: {
    fontSize: FontSize.xs + 1,
    color: Colors.textMuted,
    flex: 1,
  },
  filterShortcut: {
    backgroundColor: Colors.primaryLight,
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  heroBanner: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  heroTextCol: {
    alignItems: "flex-start",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(254, 103, 5, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  verifiedTagText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: FontSize.xs,
    color: "#CBD5E1",
    lineHeight: 18,
    marginBottom: Spacing.base,
    maxWidth: 290,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm + 2,
  },
  heroBtnText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 6,
  },
  activeSection: {
    marginBottom: Spacing.xl,
  },
  liveTrackingCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  liveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  liveStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  liveStatusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  liveJobNumber: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  liveTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  liveFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  liveWorkerLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  liveWorkerName: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 1,
  },
  liveTrackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  liveTrackBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 2,
  },
  sectionWrap: {
    marginBottom: Spacing.xl,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  catSkeleton: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryTile: {
    width: "23%",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 4,
    ...Shadows.sm,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  categoryCount: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trustStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  trustItem: {
    alignItems: "center",
    flex: 1,
  },
  trustTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  trustSub: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 1,
    textAlign: "center",
  },
  trustDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  emptyWorkersBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyWorkersText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Avatar, EmptyState } from "../../../components/ui";
import { useWorkerReviews } from "../../../hooks/use-api";
import { useAppSelector } from "../../../store";

const RATING_FILTERS = ["All", "5 Star", "4 Star", "3 Star & Below"];

export const ReviewsScreen = ({ navigation }: any) => {
  const { user, workerProfile } = useAppSelector((s) => s.auth);
  const workerId = workerProfile?._id || user?._id;

  const { data: reviewData, isLoading, refetch } = useWorkerReviews(workerId);
  const [activeFilter, setActiveFilter] = useState("All");

  const averageRating = reviewData?.averageRating || workerProfile?.rating || 5.0;
  const totalReviews = reviewData?.totalReviews || 0;
  const breakdown = reviewData?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const allReviews = reviewData?.reviews || [];

  const filteredReviews = useMemo(() => {
    if (activeFilter === "5 Star") {
      return allReviews.filter((r) => Math.round(r.rating) === 5);
    }
    if (activeFilter === "4 Star") {
      return allReviews.filter((r) => Math.round(r.rating) === 4);
    }
    if (activeFilter === "3 Star & Below") {
      return allReviews.filter((r) => Math.round(r.rating) <= 3);
    }
    return allReviews;
  }, [allReviews, activeFilter]);

  const renderStars = (rating: number, size = 16) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(rating) ? "star" : "star-outline"}
            size={size}
            color={Colors.accent}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.topSection}>
        {/* Overview Score Card */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreBig}>{averageRating.toFixed(1)}</Text>
            {renderStars(averageRating, 18)}
            <Text style={styles.scoreSub}>
              Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </Text>
          </View>

          <View style={styles.scoreDivider} />

          {/* Breakdown Bars */}
          <View style={styles.scoreBars}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = (breakdown as any)[stars] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <View key={stars} style={styles.barRow}>
                  <Text style={styles.barLabel}>{stars}★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {RATING_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f && styles.filterChipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Client Feedback ({filteredReviews.length})
        </Text>
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: any }) => {
    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recent Job";

    return (
      <View style={styles.reviewCard}>
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Avatar name={item.customerName || "Customer"} size={38} />
            <View style={styles.clientTextWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.clientName} numberOfLines={1}>
                  {item.customerName || "Verified Customer"}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.reviewDate}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color={Colors.accent} />
            <Text style={styles.ratingValue}>{Number(item.rating || 5).toFixed(1)}</Text>
          </View>
        </View>

        {item.jobNumber ? (
          <View style={styles.jobRefTag}>
            <Ionicons name="briefcase-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.jobRefText}>Job #{item.jobNumber}</Text>
          </View>
        ) : null}

        <Text style={styles.reviewBody}>{item.review || "Completed service successfully."}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ratings & Feedback</Text>
          <Text style={styles.headerSub}>Client reviews & verified satisfaction</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => refetch()}
          activeOpacity={0.7}
        >
          <Ionicons name="reload" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderReviewItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="star-outline"
              title="No Reviews Found"
              description={
                totalReviews === 0
                  ? "Reviews given by customers upon job completion will show up here."
                  : "No reviews match the selected filter."
              }
            />
          ) : (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 24 }} />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  refreshBtn: {
    padding: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl * 2,
  },
  topSection: {
    marginBottom: Spacing.md,
  },
  scoreCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  scoreLeft: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: Spacing.md,
  },
  scoreBig: {
    fontSize: 44,
    fontWeight: "900",
    color: Colors.textPrimary,
    lineHeight: 50,
  },
  starsRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  scoreSub: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  scoreDivider: {
    width: 1,
    height: "85%",
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  scoreBars: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textSecondary,
    width: 22,
  },
  barTrack: {
    flex: 1,
    height: 7,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  barCount: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textMuted,
    width: 24,
    textAlign: "right",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  clientTextWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clientName: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verifiedText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  reviewDate: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  ratingValue: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.secondaryDark,
  },
  jobRefTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
    marginVertical: Spacing.xs,
  },
  jobRefText: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  reviewBody: {
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginTop: 4,
  },
});

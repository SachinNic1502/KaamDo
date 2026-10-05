import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { StatusBadge } from "./StatusBadge";
import { Job } from "../../types";

export interface JobCardProps {
  job?: Job;
  id?: string;
  jobNumber?: string;
  title?: string;
  category?: string;
  status?: string;
  date?: string;
  time?: string;
  location?: string;
  price?: number;
  counterpartName?: string;
  counterpartRole?: "worker" | "customer";
  onPress: () => void;
  actionText?: string;
  onActionPress?: () => void;
  actionVariant?: "primary" | "outline" | "success";
  style?: ViewStyle;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  id,
  jobNumber,
  title,
  category,
  status,
  date,
  time,
  location,
  price,
  counterpartName,
  counterpartRole = "worker",
  onPress,
  actionText,
  onActionPress,
  actionVariant = "primary",
  style,
}) => {
  const displayJobNumber = job?.jobNumber || jobNumber || "#JOB";
  const displayTitle = job?.description || title || "Service Request";
  const displayCategory = job?.categoryId?.name || category;
  const displayStatus = job?.status || status || "pending";
  const displayDate = job?.scheduledDate || date;
  const displayTime = job?.scheduledTime || time;
  const displayLocation = job?.address ? `${job.address.city || ""}, ${job.address.state || ""}` : location;
  const displayPrice = job?.finalPrice ?? job?.estimatedPrice ?? price;
  const displayCounterpart = counterpartName || job?.workerId?.name;

  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Schedule TBD";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.card, style]}
    >
      {/* Top row: Job Number & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.idGroup}>
          <Text style={styles.jobNumber}>{displayJobNumber}</Text>
          {displayCategory && (
            <Text style={styles.categoryBadge} numberOfLines={1}>
              {displayCategory}
            </Text>
          )}
        </View>
        <StatusBadge status={displayStatus} size="sm" />
      </View>

      {/* Title / Description */}
      <Text style={styles.title} numberOfLines={2}>
        {displayTitle}
      </Text>

      {/* Key metadata grid */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {formattedDate} {displayTime ? `• ${displayTime}` : ""}
          </Text>
        </View>
        {displayLocation && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {displayLocation}
            </Text>
          </View>
        )}
      </View>

      {/* Footer: Price & Counterpart / CTA */}
      <View style={styles.footerRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimate</Text>
          <Text style={styles.priceValue}>
            {displayPrice !== undefined && displayPrice > 0
              ? `₹${displayPrice.toLocaleString("en-IN")}`
              : "Fixed Quote"}
          </Text>
        </View>

        {actionText ? (
          <TouchableOpacity
            onPress={onActionPress || onPress}
            activeOpacity={0.7}
            style={[
              styles.actionBtn,
              actionVariant === "outline" ? styles.actionBtnOutline : styles.actionBtnPrimary,
            ]}
          >
            <Text
              style={[
                styles.actionBtnText,
                actionVariant === "outline" ? styles.actionBtnTextOutline : styles.actionBtnTextPrimary,
              ]}
            >
              {actionText}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={actionVariant === "outline" ? Colors.primary : Colors.white}
            />
          </TouchableOpacity>
        ) : displayCounterpart ? (
          <View style={styles.counterpartRow}>
            <Ionicons
              name={counterpartRole === "worker" ? "person-circle-outline" : "person-outline"}
              size={15}
              color={Colors.primary}
            />
            <Text style={styles.counterpartText} numberOfLines={1}>
              {displayCounterpart}
            </Text>
          </View>
        ) : (
          <View style={styles.viewDetailRow}>
            <Text style={styles.viewDetailText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
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
    fontSize: FontSize.xxs + 1,
    fontWeight: "600",
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceContainer: {
    justifyContent: "center",
  },
  priceLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm + 2,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  actionBtnOutline: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginRight: 2,
  },
  actionBtnTextPrimary: {
    color: Colors.white,
  },
  actionBtnTextOutline: {
    color: Colors.primary,
  },
  counterpartRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  counterpartText: {
    fontSize: FontSize.xs,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginLeft: 4,
    maxWidth: 120,
  },
  viewDetailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
    marginRight: 2,
  },
});

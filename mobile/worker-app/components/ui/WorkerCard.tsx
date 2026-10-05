import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { Avatar } from "./Avatar";
import { RatingBadge } from "./RatingBadge";
import { WorkerProfile } from "../../types";

export interface WorkerCardProps {
  worker?: WorkerProfile;
  id?: string;
  name?: string;
  avatar?: string;
  skills?: string[];
  experience?: number;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  serviceAreas?: string[];
  onPress: () => void;
  onHirePress?: () => void;
  style?: ViewStyle;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  id,
  name,
  avatar,
  skills,
  experience,
  rating = 5,
  reviewCount,
  hourlyRate,
  isOnline,
  isVerified = true,
  serviceAreas,
  onPress,
  onHirePress,
  style,
}) => {
  const displayName = worker?.userId?.name || name || "Professional Worker";
  const displayAvatar = worker?.userId?.avatar || avatar;
  const displaySkills = worker?.skills || skills || [];
  const displayExperience = worker?.experience || experience;
  const displayRating = worker?.rating || rating;
  const displayTotalJobs = worker?.totalJobs || reviewCount;
  const displayHourlyRate = worker?.hourlyRate || hourlyRate;
  const displayIsOnline = worker?.isOnline ?? isOnline;
  const displayAreas = worker?.serviceAreas || serviceAreas || [];

  const primarySkill = displaySkills[0] || "Professional";
  const area = displayAreas[0] || "Local Area";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <Avatar
          uri={displayAvatar}
          name={displayName}
          size={52}
          isOnline={displayIsOnline}
          isVerified={isVerified}
        />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {isVerified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="shield-checkmark" size={11} color={Colors.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.skillText} numberOfLines={1}>
            {primarySkill} {displayExperience ? `• ${displayExperience} yrs exp` : ""}
          </Text>

          <View style={styles.ratingRow}>
            <RatingBadge rating={displayRating} reviewCount={displayTotalJobs} size="sm" />
            <Text style={styles.areaText} numberOfLines={1}>
              📍 {area}
            </Text>
          </View>
        </View>
      </View>

      {/* Skills tags */}
      {displaySkills.length > 1 && (
        <View style={styles.skillsRow}>
          {displaySkills.slice(0, 3).map((s, idx) => (
            <View key={idx} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{s}</Text>
            </View>
          ))}
          {displaySkills.length > 3 && (
            <View style={styles.skillChipMore}>
              <Text style={styles.skillChipMoreText}>+{displaySkills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <View style={styles.rateContainer}>
          <Text style={styles.rateLabel}>Hourly Rate</Text>
          <Text style={styles.rateValue}>
            {displayHourlyRate ? `₹${displayHourlyRate}/hr` : "Inspect & Quote"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onHirePress || onPress}
          activeOpacity={0.7}
          style={styles.hireBtn}
        >
          <Text style={styles.hireBtnText}>Book Service</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.white} />
        </TouchableOpacity>
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
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoCol: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    flex: 1,
    marginRight: Spacing.xs,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  verifiedText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primaryDark,
    marginLeft: 2,
  },
  skillText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  areaText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  skillChip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  skillChipText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  skillChipMore: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  skillChipMoreText: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  rateContainer: {
    justifyContent: "center",
  },
  rateLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  rateValue: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  hireBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm + 2,
  },
  hireBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.white,
    marginRight: 4,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useWorkerDetail } from "../../../hooks/use-api";
import { AppHeader, Avatar, Card, PrimaryButton, OutlineButton, RatingBadge } from "../../../components/ui";

export default function CustomerWorkerDetailScreen({ route, navigation }: any) {
  const workerId = route.params?.workerId;
  const { data, isLoading } = useWorkerDetail(workerId);
  const worker = data?.data;

  const handleCall = () => {
    if (worker?.userId?.phone) {
      Linking.openURL(`tel:${worker.userId.phone}`);
    }
  };

  const handleBookDirect = () => {
    const primarySkill = worker?.skills?.[0] || "";
    navigation.navigate("CreateJob", {
      preselectedCategory: primarySkill,
      preferredWorkerId: worker?._id,
      preferredWorkerName: worker?.userId?.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Technician Profile" showBack onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading technician details...</Text>
        </View>
      ) : worker ? (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Worker Hero Card */}
            <Card style={styles.heroCard}>
              <View style={styles.avatarRow}>
                <Avatar
                  uri={worker.userId?.avatar}
                  name={worker.userId?.name || "Technician"}
                  size={76}
                  isVerified
                />
                <View style={styles.workerMeta}>
                  <View style={styles.nameRow}>
                    <Text style={styles.workerName}>{worker.userId?.name || "Technician"}</Text>
                    <View style={styles.verifiedPill}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                      <Text style={styles.verifiedText}>Police Verified</Text>
                    </View>
                  </View>
                  <Text style={styles.workerArea}>
                    {worker.serviceAreas?.join(", ") || "Delhi NCR"}
                  </Text>
                  <View style={styles.statsRow}>
                    <RatingBadge rating={worker.rating || 5.0} totalRatings={worker.totalJobs || 12} />
                    <View style={styles.onlineBadge}>
                      <View
                        style={[
                          styles.onlineDot,
                          { backgroundColor: worker.isOnline ? Colors.success : Colors.textMuted },
                        ]}
                      />
                      <Text style={styles.onlineText}>
                        {worker.isOnline ? "Available Now" : "Offline"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Contact Buttons */}
              <View style={styles.quickContactRow}>
                <OutlineButton
                  title="Direct Call"
                  icon="call-outline"
                  onPress={handleCall}
                  style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <PrimaryButton
                  title="Book Service"
                  icon="calendar-outline"
                  onPress={handleBookDirect}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>

            {/* Stats Overview */}
            <View style={styles.statsGrid}>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{worker.experience || 4} Years</Text>
                <Text style={styles.statLabel}>Trade Experience</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>{worker.totalJobs || 28}+</Text>
                <Text style={styles.statLabel}>Completed Jobs</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statNumber}>
                  {worker.hourlyRate ? `₹${worker.hourlyRate}/h` : "Standard"}
                </Text>
                <Text style={styles.statLabel}>Standard Rate</Text>
              </View>
            </View>

            {/* Skills & Specialties */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              <View style={styles.skillsWrap}>
                {worker.skills?.map((skill, idx) => (
                  <View key={idx} style={styles.skillPill}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* KaamDo Trust & Safety */}
            <Card variant="flat" style={styles.trustCard}>
              <View style={styles.trustHeader}>
                <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                  <Text style={styles.trustTitle}>KaamDo Safety Standards</Text>
                  <Text style={styles.trustDesc}>
                    This technician has passed Aadhaar ID verification, trade evaluation, and background checks. You only pay after work completion.
                  </Text>
                </View>
              </View>
            </Card>
          </ScrollView>

          {/* Bottom Floating Booking Bar */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomBarLabel}>Inspection / Base Fee</Text>
              <Text style={styles.bottomBarPrice}>₹199 onwards</Text>
            </View>
            <PrimaryButton
              title="Book This Technician"
              onPress={handleBookDirect}
              style={{ paddingHorizontal: Spacing.xl }}
              fullWidth={false}
            />
          </View>
        </View>
      ) : (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Technician profile not found.</Text>
        </View>
      )}
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
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  heroCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerMeta: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  workerName: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 2,
  },
  verifiedText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  workerArea: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: 6,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  onlineText: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  quickContactRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  statNumber: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  skillPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  skillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primaryDark,
  },
  trustCard: {
    padding: Spacing.base,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  trustTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  trustDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.md,
  },
  bottomBarLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
  },
  bottomBarPrice: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.primary,
  },
});

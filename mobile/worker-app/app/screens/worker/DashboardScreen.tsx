import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Avatar, SectionHeader, StatusBadge, LogoWordmark } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setOnlineStatus } from "../../../store/authSlice";
import { locationService } from "../../../services/location";
import {
  useIncomingRequests,
  useWorkerJobs,
  useWorkerEarnings,
  useAcceptJob,
  useAttendanceList,
} from "../../../hooks/use-api";
import { api } from "../../../services/api";

export const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user, isOnline, workerProfile } = useAppSelector((s) => s.auth);

  const {
    data: requests = [],
    isLoading: reqLoading,
    refetch: refetchRequests,
  } = useIncomingRequests();

  const {
    data: activeJobs = [],
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useWorkerJobs("in_progress");

  const {
    data: earnings,
    isLoading: earnLoading,
    refetch: refetchEarnings,
  } = useWorkerEarnings();

  const {
    data: attendanceLogs = [],
    refetch: refetchAttendance,
  } = useAttendanceList();

  const todayAttendance = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return (attendanceLogs || []).find((r: any) => {
      const recDate = new Date(r.date).toISOString().split("T")[0];
      return recDate === today;
    });
  }, [attendanceLogs]);

  const acceptJobMutation = useAcceptJob();

  // Location & Service Radius State
  const [currentLocation, setCurrentLocation] = React.useState<{
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    serviceRadiusKm: number;
  }>({
    latitude: 12.9716,
    longitude: 77.5946,
    address: workerProfile?.serviceAreas?.[0] || "Calibrate Dispatch Base",
    city: workerProfile?.serviceAreas?.[0] || "Service Territory",
    serviceRadiusKm: workerProfile?.serviceRadiusKm || 15,
  });
  const [isUpdatingLocation, setIsUpdatingLocation] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const loadLocation = async () => {
      try {
        const data = await locationService.getWorkerLocation();
        if (isMounted && data) {
          setCurrentLocation({
            latitude: data.latitude || 12.9716,
            longitude: data.longitude || 77.5946,
            address: data.address || workerProfile?.serviceAreas?.[0] || "Live Coverage Base",
            city: data.city || workerProfile?.serviceAreas?.[0] || "Service Territory",
            serviceRadiusKm: data.serviceRadiusKm || workerProfile?.serviceRadiusKm || 15,
          });
        }
      } catch {
        // Fallback
      }
    };
    loadLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshGPS = async () => {
    setIsUpdatingLocation(true);
    try {
      const pos = await locationService.getCurrentPosition();
      if (!pos) {
        Alert.alert(
          "Location Permission",
          "Please enable GPS location permissions to calibrate your live dispatch radius."
        );
        return;
      }
      const geo = await locationService.reverseGeocode(pos.latitude, pos.longitude);
      const updated = await locationService.updateLocationAndRadius({
        latitude: pos.latitude,
        longitude: pos.longitude,
        serviceRadiusKm: currentLocation.serviceRadiusKm,
        address: geo.address,
        city: geo.city,
        state: geo.state,
        pincode: geo.pincode,
      });
      if (updated) {
        setCurrentLocation({
          latitude: updated.latitude,
          longitude: updated.longitude,
          address: updated.address || geo.address,
          city: updated.city || geo.city,
          serviceRadiusKm: updated.serviceRadiusKm,
        });
        Alert.alert(
          "Location Calibrated",
          `Coverage center updated to ${geo.address} (${currentLocation.serviceRadiusKm} km radius)`
        );
      }
    } catch (err: any) {
      Alert.alert("Location Update", err.message || "Could not retrieve live GPS coordinates.");
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSelectRadius = async (radius: number) => {
    try {
      setCurrentLocation((prev) => ({ ...prev, serviceRadiusKm: radius }));
      await locationService.updateLocationAndRadius({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        serviceRadiusKm: radius,
        address: currentLocation.address,
        city: currentLocation.city,
      });
    } catch {
      // Keep local selection
    }
  };

  const handleToggleOnline = async (val: boolean) => {
    dispatch(setOnlineStatus(val));
    try {
      await api.patch("/api/workers/me/status", { isOnline: val });
    } catch {
      // Revert if API fails
      dispatch(setOnlineStatus(!val));
      Alert.alert("Network Error", "Could not update your live availability status.");
    }
  };

  const handleQuickAccept = async (jobId: string) => {
    try {
      await acceptJobMutation.mutateAsync(jobId);
      Alert.alert("Job Accepted!", "You have been assigned to this request. Navigate to active jobs to start.", [
        { text: "View Job", onPress: () => navigation.navigate("JobDetail", { jobId }) },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to accept job.");
    }
  };

  const isRefreshing = reqLoading || jobsLoading || earnLoading;

  const onRefresh = () => {
    refetchRequests();
    refetchJobs();
    refetchEarnings();
    refetchAttendance();
  };

  const activeJob = activeJobs[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Brand Bar with Official Partner Logo & Alerts */}
        <View style={styles.brandBar}>
          <View style={styles.brandLeft}>
            <LogoWordmark width={128} />
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>PARTNER</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.iconCircle}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Top Worker Profile Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.profileSnippet}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
          >
            <Avatar
              name={user?.name || "Worker"}
              size={44}
              isOnline={isOnline}
              isVerified={true}
            />
            <View style={styles.nameBlock}>
              <Text style={styles.greeting}>Service Partner</Text>
              <Text style={styles.workerName} numberOfLines={1}>
                {user?.name || "Professional"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Live Availability Toggle Card */}
        <View
          style={[
            styles.statusCard,
            isOnline ? styles.statusCardOnline : styles.statusCardOffline,
          ]}
        >
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusPulseDot,
                { backgroundColor: isOnline ? Colors.online : Colors.textMuted },
              ]}
            />
            <View>
              <Text style={styles.statusHeading}>
                {isOnline ? "You are Online & Visible" : "You are Currently Offline"}
              </Text>
              <Text style={styles.statusSub}>
                {isOnline
                  ? "Receiving real-time jobs in your service area"
                  : "Turn ON to receive new customer bookings"}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: Colors.toggle.deactiveTrack, true: Colors.toggle.activeTrack }}
            thumbColor={isOnline ? Colors.toggle.activeThumb : Colors.toggle.deactiveThumb}
          />
        </View>

        {/* Live Service Radius & Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationTopRow}>
            <View style={styles.locationLeftGroup}>
              <View style={styles.locationIconWrap}>
                <Ionicons name="location" size={17} color={Colors.primary} />
              </View>
              <View style={styles.locationTextWrap}>
                <Text style={styles.locationHeading} numberOfLines={1}>
                  {currentLocation.address}
                </Text>
                <Text style={styles.locationSub}>
                  Live Base • {currentLocation.city}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.gpsSyncBtn}
              onPress={handleRefreshGPS}
              disabled={isUpdatingLocation}
              activeOpacity={0.7}
            >
              {isUpdatingLocation ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="navigate" size={13} color={Colors.primary} />
                  <Text style={styles.gpsSyncText}>Calibrate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Radius Selector */}
          <View style={styles.radiusControlRow}>
            <View style={styles.radiusTitleGroup}>
              <Text style={styles.radiusLabel}>Broadcast Radius:</Text>
              <Text style={styles.radiusActiveValue}>
                Within {currentLocation.serviceRadiusKm} km
              </Text>
            </View>

            <View style={styles.radiusChipsGroup}>
              {[5, 10, 15, 25, 50].map((km) => {
                const isSelected = currentLocation.serviceRadiusKm === km;
                return (
                  <TouchableOpacity
                    key={km}
                    onPress={() => handleSelectRadius(km)}
                    style={[
                      styles.radiusChip,
                      isSelected && styles.radiusChipSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        isSelected && styles.radiusChipTextSelected,
                      ]}
                    >
                      {km}km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Coverage Beacon Status */}
          <View style={styles.coverageBeaconRow}>
            <Ionicons name="radio" size={13} color={Colors.accent} />
            <Text style={styles.coverageBeaconText}>
              Receiving job requests across a {Math.round(Math.PI * Math.pow(currentLocation.serviceRadiusKm, 2))} km² coverage area
            </Text>
          </View>
        </View>

        {/* Financial KPI Summary Cards */}
        <View style={styles.kpiRow}>
          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate("Earnings")}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Today's Earnings</Text>
              <Ionicons name="cash-outline" size={16} color={Colors.accent} />
            </View>
            <Text style={styles.kpiValue}>
              ₹{(earnings?.today || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.kpiSub}>Settled & ready</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kpiCard}
            onPress={() => navigation.navigate("Requests")}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>New Requests</Text>
              <Ionicons name="flash-outline" size={16} color={Colors.accent} />
            </View>
            <Text style={[styles.kpiValue, { color: Colors.accent }]}>
              {requests.length}
            </Text>
            <Text style={styles.kpiSub}>Nearby available</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Shift Attendance Quick Card */}
        <TouchableOpacity
          style={styles.shiftAttendanceCard}
          onPress={() => navigation.navigate("Attendance")}
          activeOpacity={0.85}
        >
          <View style={styles.shiftAttendanceLeft}>
            <View
              style={[
                styles.shiftIconWrap,
                todayAttendance?.checkIn && !todayAttendance?.checkOut
                  ? styles.shiftIconWrapActive
                  : styles.shiftIconWrapIdle,
              ]}
            >
              <Ionicons
                name="time"
                size={20}
                color={
                  todayAttendance?.checkIn && !todayAttendance?.checkOut
                    ? Colors.online
                    : Colors.primary
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.shiftTitleRow}>
                <Text style={styles.shiftCardTitle}>Shift Attendance</Text>
                <View
                  style={[
                    styles.shiftStatusPill,
                    todayAttendance?.checkIn && !todayAttendance?.checkOut
                      ? styles.shiftStatusPillActive
                      : todayAttendance?.checkOut
                      ? styles.shiftStatusPillDone
                      : styles.shiftStatusPillIdle,
                  ]}
                >
                  <Text
                    style={[
                      styles.shiftStatusPillText,
                      todayAttendance?.checkIn && !todayAttendance?.checkOut
                        ? { color: Colors.online }
                        : todayAttendance?.checkOut
                        ? { color: Colors.primary }
                        : { color: Colors.textSecondary },
                    ]}
                  >
                    {todayAttendance?.checkIn && !todayAttendance?.checkOut
                      ? "PUNCHED IN"
                      : todayAttendance?.checkOut
                      ? "COMPLETED"
                      : "PUNCH REQUIRED"}
                  </Text>
                </View>
              </View>
              <Text style={styles.shiftCardSub}>
                {todayAttendance?.checkIn && !todayAttendance?.checkOut
                  ? `Shift running • Started at ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : todayAttendance?.checkOut
                  ? `Completed • Logged ${todayAttendance.workingHours || 0} hours today`
                  : "Tap to record your shift start and on-site hours"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Active In-Progress Job Section (if any) */}
        {activeJob && (
          <View style={styles.activeJobSection}>
            <SectionHeader
              title="Current Active Job"
              actionText="Manage"
              onActionPress={() => navigation.navigate("JobDetail", { jobId: activeJob._id })}
            />

            <View style={styles.activeJobCard}>
              <View style={styles.activeJobTop}>
                <View style={styles.activeJobBadge}>
                  <Text style={styles.activeJobBadgeText}>IN PROGRESS</Text>
                </View>
                <StatusBadge status={activeJob.status} size="sm" />
              </View>

              <Text style={styles.activeJobTitle} numberOfLines={2}>
                {activeJob.description || "Active Service Work"}
              </Text>

              <View style={styles.activeMeta}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.activeMetaText} numberOfLines={1}>
                  {activeJob.address?.address}, {activeJob.address?.city}
                </Text>
              </View>

              <View style={styles.activeFooter}>
                <View>
                  <Text style={styles.customerName}>
                    👤 {activeJob.customerId?.name || "Customer"}
                  </Text>
                  <Text style={styles.customerPhone}>
                    📞 {activeJob.customerId?.phone || "Private Contact"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.resumeBtn}
                  onPress={() => navigation.navigate("JobDetail", { jobId: activeJob._id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resumeBtnText}>Update Status</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Incoming Broadcast Requests Section */}
        <View style={styles.requestsSection}>
          <SectionHeader
            title="Live Customer Requests"
            count={requests.length}
            actionText="View All"
            onActionPress={() => navigation.navigate("Requests")}
          />

          {requests.length === 0 ? (
            <View style={styles.emptyRequests}>
              <Ionicons name="radio-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyRequestsTitle}>No pending requests nearby</Text>
              <Text style={styles.emptyRequestsSub}>
                Keep your status Online. When customers book in your category, they will appear here.
              </Text>
            </View>
          ) : (
            requests.slice(0, 3).map((job) => (
              <View key={job._id} style={styles.requestCard}>
                <View style={styles.reqTopRow}>
                  <View style={styles.reqBadge}>
                    <Text style={styles.reqBadgeText}>
                      {job.categoryId?.name || "Service"}
                    </Text>
                  </View>
                  <Text style={styles.reqPrice}>
                    ₹{(job.estimatedPrice || 499).toLocaleString("en-IN")}
                  </Text>
                </View>

                <Text style={styles.reqTitle} numberOfLines={2}>
                  {job.description}
                </Text>

                <View style={styles.reqDetailsRow}>
                  <View style={styles.reqDetailItem}>
                    <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.reqDetailText} numberOfLines={1}>
                      {job.address?.city || "Nearby location"}
                    </Text>
                  </View>

                  <View style={styles.reqDetailItem}>
                    <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.reqDetailText}>
                      {job.scheduledDate
                        ? new Date(job.scheduledDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Today"}
                    </Text>
                  </View>
                </View>

                {/* Accept / View Actions */}
                <View style={styles.reqActions}>
                  <TouchableOpacity
                    style={styles.reqDetailsBtn}
                    onPress={() => navigation.navigate("JobDetail", { jobId: job._id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.reqDetailsBtnText}>Inspect Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reqAcceptBtn}
                    onPress={() => handleQuickAccept(job._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reqAcceptBtnText}>Accept Job</Text>
                    <Ionicons name="checkmark" size={15} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Shortcut Hub */}
        <View style={styles.shortcutsSection}>
          <Text style={styles.shortcutsHeader}>Partner Quick Access</Text>
          <View style={styles.shortcutsGrid}>
            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate("KYCOnboarding")}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.shortcutTitle}>KYC Verification</Text>
              <Text style={styles.shortcutSub}>
                {workerProfile?.kyc?.status === "approved" ? "Verified" : "Pending action"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate("Skills")}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: Colors.secondaryLight }]}>
                <Ionicons name="construct" size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.shortcutTitle}>Skills & Pricing</Text>
              <Text style={styles.shortcutSub}>Manage trades</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate("Earnings")}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="wallet" size={20} color={Colors.success} />
              </View>
              <Text style={styles.shortcutTitle}>Bank Withdrawals</Text>
              <Text style={styles.shortcutSub}>Direct payout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate("Attendance")}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="time" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.shortcutTitle}>Shift Attendance</Text>
              <Text style={styles.shortcutSub}>Punch & Logs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shortcutCard}
              onPress={() => navigation.navigate("Support")}
              activeOpacity={0.8}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: Colors.surfaceSubtle }]}>
                <Ionicons name="headset" size={20} color={Colors.textSecondary} />
              </View>
              <Text style={styles.shortcutTitle}>Partner Helpline</Text>
              <Text style={styles.shortcutSub}>24x7 Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 115,
  },
  brandBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  proPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  proPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.base,
  },
  profileSnippet: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameBlock: {
    marginLeft: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  workerName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
    maxWidth: 180,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.base,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  statusCardOnline: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  statusCardOffline: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  locationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  locationIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  locationTextWrap: {
    flex: 1,
  },
  locationHeading: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  locationSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  gpsSyncBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  gpsSyncText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  radiusControlRow: {
    marginTop: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  radiusTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  radiusLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  radiusActiveValue: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  radiusChipsGroup: {
    flexDirection: "row",
    gap: 6,
  },
  radiusChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  radiusChipText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  radiusChipTextSelected: {
    color: Colors.white,
    fontWeight: "700",
  },
  coverageBeaconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FEF3C7", // Light Champagne Gold tint
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: Spacing.sm,
  },
  coverageBeaconText: {
    fontSize: FontSize.xxs,
    color: "#92400E",
    fontWeight: "600",
    flex: 1,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusHeading: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  kpiRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  kpiSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeJobSection: {
    marginBottom: Spacing.xl,
  },
  activeJobCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.md,
  },
  activeJobTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  activeJobBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  activeJobBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  activeJobTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  activeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  activeMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  activeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  customerName: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  resumeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 4,
  },
  requestsSection: {
    marginBottom: Spacing.xl,
  },
  emptyRequests: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyRequestsTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyRequestsSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 280,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  reqTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  reqBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  reqBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  reqPrice: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  reqTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  reqDetailsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  reqDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  reqDetailText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginLeft: 3,
  },
  reqActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  reqDetailsBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  reqDetailsBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  reqAcceptBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  reqAcceptBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 4,
  },
  shortcutsSection: {
    marginBottom: Spacing.lg,
  },
  shortcutsHeader: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  shortcutsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  shortcutCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  shortcutTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  shortcutSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  shiftAttendanceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  shiftAttendanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  shiftIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  shiftIconWrapActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  shiftIconWrapIdle: {
    backgroundColor: Colors.primaryLight,
  },
  shiftTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  shiftCardTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  shiftStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  shiftStatusPillActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  shiftStatusPillDone: {
    backgroundColor: Colors.primaryLight,
  },
  shiftStatusPillIdle: {
    backgroundColor: Colors.surfaceSubtle,
  },
  shiftStatusPillText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  shiftCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Avatar, RatingBadge, LogoWordmark } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setOnlineStatus, logout } from "../../../store/authSlice";
import { clearAll } from "../../../services/storage";
import { api } from "../../../services/api";

export const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { user, workerProfile, isOnline } = useAppSelector((s) => s.auth);

  const handleToggleOnline = async (val: boolean) => {
    dispatch(setOnlineStatus(val));
    try {
      await api.patch("/api/workers/me/status", { isOnline: val });
    } catch {
      dispatch(setOnlineStatus(!val));
      Alert.alert("Network Error", "Could not toggle online availability.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out of your partner portal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await clearAll();
          dispatch(logout());
        },
      },
    ]);
  };

  const primaryTrade = workerProfile?.skills?.[0] || "Service Professional";
  const kycStatus = workerProfile?.kyc?.status || "pending";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar
              name={user?.name || "Worker"}
              size={64}
              isOnline={isOnline}
              isVerified={true}
            />
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {user?.name || "Professional Partner"}
                </Text>
              </View>
              <Text style={styles.trade}>{primaryTrade}</Text>
              <Text style={styles.phone}>+91 {user?.phone}</Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workerProfile?.totalJobs || 0}
              </Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate("Reviews")}
              activeOpacity={0.7}
            >
              <RatingBadge rating={workerProfile?.rating || 5.0} showCount={false} size="sm" />
              <Text style={styles.statLabel}>Avg Rating</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workerProfile?.experience || 0}y
              </Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <Ionicons
              name="radio-button-on"
              size={20}
              color={isOnline ? Colors.online : Colors.textMuted}
            />
            <View style={{ marginLeft: Spacing.sm }}>
              <Text style={styles.toggleTitle}>
                {isOnline ? "Partner Status: Online" : "Partner Status: Offline"}
              </Text>
              <Text style={styles.toggleSub}>
                {isOnline ? "Receiving job dispatches" : "Hidden from search"}
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

        {/* KYC Verification Banner */}
        <TouchableOpacity
          style={styles.kycCard}
          onPress={() => navigation.navigate("KYCOnboarding")}
          activeOpacity={0.8}
        >
          <View style={styles.kycLeft}>
            <View style={styles.kycIconWrap}>
              <Ionicons
                name="shield-checkmark"
                size={22}
                color={kycStatus === "approved" ? Colors.success : Colors.accent}
              />
            </View>
            <View>
              <Text style={styles.kycTitle}>Government KYC Verification</Text>
              <Text style={styles.kycSub}>
                {kycStatus === "approved"
                  ? "Identity verified. Trust score 100%."
                  : "Upload Aadhaar & PAN to unlock all jobs."}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Navigation Menu List */}
        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>Account & Services</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Skills")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="construct-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuText}>Trade Skills & Base Pricing</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Earnings")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="cash-outline" size={18} color={Colors.success} />
              </View>
              <Text style={styles.menuText}>Payouts & Bank Accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Reviews")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="star-outline" size={18} color={Colors.accent} />
              </View>
              <Text style={styles.menuText}>Client Ratings & Reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.surfaceSubtle }]}>
                <Ionicons name="notifications-outline" size={18} color={Colors.textPrimary} />
              </View>
              <Text style={styles.menuText}>Notifications & Broadcasts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuHeader}>Support & Safety</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Dispute")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.errorLight }]}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              </View>
              <Text style={styles.menuText}>Dispute Resolution</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Support")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="headset-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuText}>Partner Helpline & Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.surfaceSubtle }]}>
                <Ionicons name="settings-outline" size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuText}>App Settings & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutBtnText}>Sign Out of Partner Portal</Text>
        </TouchableOpacity>

        <View style={styles.footerBrandWrap}>
          <LogoWordmark width={124} />
          <Text style={styles.versionText}>KaamDo Partner Network • v1.0.0 (Pro Guild)</Text>
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
  profileCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileDetails: {
    marginLeft: Spacing.base,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  trade: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 2,
  },
  phone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.base,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  toggleSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  kycCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  kycIconWrap: {
    marginRight: Spacing.sm,
  },
  kycTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  kycSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuHeader: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  menuText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  logoutBtnText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.error,
    marginLeft: 6,
  },
  footerBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: 6,
  },
  versionText: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

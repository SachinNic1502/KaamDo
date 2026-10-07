import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { logout } from "../../../store/authSlice";
import { AppDispatch } from "../../../store";
import { AppHeader, Avatar, Card, LogoWordmark } from "../../../components/ui";
import { useJobs } from "../../../hooks/use-api";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route?: string;
  action?: () => void;
  badge?: string;
}

export default function CustomerProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);

  const { data: jobData } = useJobs({ customerId: user?._id });
  const jobs = jobData?.data ?? [];

  const completedCount = jobs.filter((j) =>
    ["completed", "paid", "closed"].includes(j.status)
  ).length;
  const activeCount = jobs.filter(
    (j) => !["completed", "paid", "closed", "cancelled"].includes(j.status)
  ).length;

  const handleLogout = () => {
    Alert.alert("Confirm Sign Out", "Are you sure you want to sign out from your KaamDo account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "My Activity",
      items: [
        {
          icon: "briefcase-outline",
          title: "Booking History",
          subtitle: "View receipts, invoices & completed work",
          route: "Bookings",
        },
        {
          icon: "location-outline",
          title: "Saved Addresses",
          subtitle: "Manage home and work service locations",
          route: "SavedAddresses",
        },
        {
          icon: "receipt-outline",
          title: "Payments & Invoices",
          subtitle: "Track your paid service receipts & transactions",
          route: "PaymentHistory",
        },
        {
          icon: "pricetag-outline",
          title: "Offers & Coupons",
          subtitle: "Save on your upcoming home repairs",
          route: "Promo",
        },
      ],
    },
    {
      title: "Preferences & Security",
      items: [
        {
          icon: "notifications-outline",
          title: "Notification Settings",
          subtitle: "SMS, WhatsApp and push notifications",
          route: "Settings",
        },
        {
          icon: "shield-checkmark-outline",
          title: "Privacy & Data Protection",
          subtitle: "India DPDP Act encrypted security",
          route: "Privacy",
        },
      ],
    },
    {
      title: "Help & Support",
      items: [
        {
          icon: "chatbubbles-outline",
          title: "Customer Support & Helpline",
          subtitle: "WhatsApp assistance & 24/7 issue escalation",
          route: "Support",
        },
        {
          icon: "information-circle-outline",
          title: "About KaamDo",
          subtitle: "Version 1.0.0 (Har Kaam, Sahi Insaan)",
          route: "About",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Profile & Account" subtitle="Customer Settings & Preferences" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.userCard}>
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.8}
          >
            <Avatar
              uri={user?.avatar}
              name={user?.name || "Customer"}
              size={64}
              isVerified
            />
            <View style={styles.userMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || "Customer"}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.userPhone}>
                {user?.phone ? `+91 ${user.phone}` : "Phone verified"}
              </Text>
              {user?.email ? (
                <Text style={styles.userEmail}>{user.email}</Text>
              ) : (
                <Text style={styles.addEmailPrompt}>+ Add email address</Text>
              )}
            </View>
            <View style={styles.editProfilePill}>
              <Ionicons name="pencil" size={13} color={Colors.primary} />
              <Text style={styles.editProfileText}>Edit</Text>
            </View>
          </TouchableOpacity>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{jobs.length}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
          </View>
        </Card>

        {/* Menu Sections */}
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionHeader}>{section.title}</Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[
                    styles.menuItem,
                    iIdx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    if (item.action) item.action();
                    else if (item.route) navigation.navigate(item.route);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.menuMeta}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    {item.subtitle ? (
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out from Account</Text>
        </TouchableOpacity>

        <View style={styles.footerBrandWrap}>
          <LogoWordmark width={120} />
          <Text style={styles.footerNote}>
            KaamDo India • Har Kaam, Sahi Insaan
          </Text>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  userCard: {
    padding: Spacing.base,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userMeta: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  verifiedBadge: {
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
  userPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
  },
  addEmailPrompt: {
    fontSize: FontSize.xxs,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  editProfilePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  editProfileText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "700",
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: FontSize.lg,
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
    backgroundColor: Colors.border,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginLeft: Spacing.xs,
  },
  menuCard: {
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuMeta: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.base,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    gap: 6,
    marginTop: Spacing.sm,
  },
  signOutText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.error,
  },
  footerBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: 4,
  },
  footerNote: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

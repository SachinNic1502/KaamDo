import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../../utils/constants";
import { LogoFull } from "../../../components/Logo";
import { AppHeader, Card, useToast } from "../../../components/ui";

export default function CustomerAboutScreen({ navigation }: any) {
  const toast = useToast();

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Book verified electricians, plumbers, and home repair technicians in minutes with KaamDo! Download now: https://kaamdo.in",
        title: "KaamDo — Har Kaam, Sahi Insaan",
      });
    } catch {
      // ignore
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL("https://kaamdo.in/terms");
  };

  const handleOpenSafety = () => {
    Linking.openURL("https://kaamdo.in/safety");
  };

  const handleRateApp = () => {
    toast.success("Thank you! ❤️", "Opening App Store review page.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="About KaamDo"
        subtitle="Har Kaam, Sahi Insaan"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Banner */}
        <View style={styles.brandHero}>
          <LogoFull width={220} />
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0 (Production Build)</Text>
          </View>
          <Text style={styles.missionText}>
            India’s dedicated marketplace connecting households and businesses with police-verified, certified trade specialists.
          </Text>
        </View>

        {/* Pillars Card */}
        <Text style={styles.sectionHeader}>The KaamDo Promise</Text>
        <Card style={styles.card}>
          <View style={styles.promiseItem}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <View style={styles.promiseMeta}>
              <Text style={styles.promiseTitle}>Police & KYC Vetted Pros</Text>
              <Text style={styles.promiseSub}>Aadhaar background verification and trade skill testing</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.promiseItem}>
            <Ionicons name="card" size={20} color={Colors.success} />
            <View style={styles.promiseMeta}>
              <Text style={styles.promiseTitle}>Milestone Escrow Protection</Text>
              <Text style={styles.promiseSub}>Funds released only after work is inspected and approved</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.promiseItem}>
            <Ionicons name="ribbon" size={20} color={Colors.accent} />
            <View style={styles.promiseMeta}>
              <Text style={styles.promiseTitle}>30-Day Workmanship Warranty</Text>
              <Text style={styles.promiseSub}>Free rework if an issue recurs within 30 days of service</Text>
            </View>
          </View>
        </Card>

        {/* Legal & Standards Links */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          Policies & Transparency
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenTerms} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Terms of Service & User Agreement</Text>
            <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate("Privacy")}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy & Data Security</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={handleOpenSafety} activeOpacity={0.7}>
            <Ionicons name="medkit-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Safety & Community Guidelines</Text>
            <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Actions */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShareApp} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Share with Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleRateApp} activeOpacity={0.8}>
            <Ionicons name="star-outline" size={18} color={Colors.accent} />
            <Text style={[styles.actionBtnText, { color: Colors.accent }]}>Rate 5 Stars</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyrightText}>
          © 2026 KaamDo India Technologies Pvt. Ltd. All rights reserved. Made with pride for Bharat.
        </Text>
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
  },
  brandHero: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  versionBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  versionText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  missionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: Spacing.md,
    maxWidth: 290,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: 0,
    overflow: "hidden",
  },
  promiseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  promiseMeta: {
    flex: 1,
  },
  promiseTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  promiseSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.base,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
    gap: Spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  actionGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  actionBtnText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.primary,
  },
  copyrightText: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 16,
  },
});

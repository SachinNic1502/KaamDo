import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { AppDispatch, RootState } from "../../../store";
import { updateNotificationSettings } from "../../../store/authSlice";
import { AppHeader, Card, useToast, LogoWordmark } from "../../../components/ui";

export default function WorkerSettingsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const settings = useSelector(
    (state: RootState) => state.auth.notificationSettings
  );

  const [localSettings, setLocalSettings] = useState(
    settings || {
      jobUpdates: true,
      chatMessages: true,
      paymentReceipts: true,
      disputeUpdates: true,
    }
  );

  const toggle = (key: keyof typeof localSettings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    dispatch(updateNotificationSettings({ settings: updated }))
      .unwrap()
      .then(() => toast.success("Preferences Saved", "Your partner notification settings have been updated."))
      .catch(() => toast.error("Error", "Could not save preferences."));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Partner Preferences"
        subtitle="Lead broadcasts & alert sounds"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Dispatch & Broadcast Alerts</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>New Lead & Job Broadcasts</Text>
              <Text style={styles.settingSub}>
                Instant notifications when a customer requests service in your dispatch radius
              </Text>
            </View>
            <Switch
              value={localSettings.jobUpdates}
              onValueChange={() => toggle("jobUpdates")}
              trackColor={{ false: Colors.toggle.deactiveTrack, true: Colors.toggle.activeTrack }}
              thumbColor={localSettings.jobUpdates ? Colors.toggle.activeThumb : Colors.toggle.deactiveThumb}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Client Chat Messages</Text>
              <Text style={styles.settingSub}>
                Real-time message alerts from customers with assigned or ongoing jobs
              </Text>
            </View>
            <Switch
              value={localSettings.chatMessages}
              onValueChange={() => toggle("chatMessages")}
              trackColor={{ false: Colors.toggle.deactiveTrack, true: Colors.toggle.activeTrack }}
              thumbColor={localSettings.chatMessages ? Colors.toggle.activeThumb : Colors.toggle.deactiveThumb}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Payout & Settlement Receipts</Text>
              <Text style={styles.settingSub}>
                Instant receipts and bank transfer confirmations
              </Text>
            </View>
            <Switch
              value={localSettings.paymentReceipts}
              onValueChange={() => toggle("paymentReceipts")}
              trackColor={{ false: Colors.toggle.deactiveTrack, true: Colors.toggle.activeTrack }}
              thumbColor={localSettings.paymentReceipts ? Colors.toggle.activeThumb : Colors.toggle.deactiveThumb}
            />
          </View>
        </Card>

        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>App Info</Text>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>KaamDo Partner Build</Text>
            <Text style={styles.infoVal}>v2.4.0 (Regal Pro Edition)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dispatch Engine</Text>
            <Text style={styles.infoVal}>GeoJSON Proximity v2</Text>
          </View>
        </Card>

        <View style={styles.footerBrandWrap}>
          <LogoWordmark width={116} />
          <Text style={styles.footerNote}>
            KaamDo India • Verified Partner Portal
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
    paddingBottom: 115,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: 0,
    overflow: "hidden",
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.base,
  },
  settingMeta: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.base,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  footerBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: 6,
  },
  footerNote: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

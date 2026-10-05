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
import { Colors, Spacing, FontSize, BorderRadius } from "../../../utils/constants";
import { AppDispatch, RootState } from "../../../store";
import { updateNotificationSettings } from "../../../store/authSlice";
import { AppHeader, Card, useToast } from "../../../components/ui";

export default function CustomerSettingsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const settings = useSelector(
    (state: RootState) => state.auth.notificationSettings
  );

  const [localSettings, setLocalSettings] = useState(settings);

  const toggle = (key: keyof typeof settings) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    dispatch(updateNotificationSettings({ settings: updated }))
      .unwrap()
      .then(() => toast.success("Settings Saved", "Your notification preferences are updated."))
      .catch(() => toast.error("Error", "Could not save preferences."));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Settings & Alerts" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Push & SMS Notifications</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Booking & ETA Updates</Text>
              <Text style={styles.settingSub}>
                Technician dispatch, arrival, and completion alerts
              </Text>
            </View>
            <Switch
              value={localSettings.jobUpdates}
              onValueChange={() => toggle("jobUpdates")}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={localSettings.jobUpdates ? Colors.primary : Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Live Chat Messages</Text>
              <Text style={styles.settingSub}>
                Instant message alerts from your active service technician
              </Text>
            </View>
            <Switch
              value={localSettings.chatMessages}
              onValueChange={() => toggle("chatMessages")}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={localSettings.chatMessages ? Colors.primary : Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Payment & Invoices</Text>
              <Text style={styles.settingSub}>
                Official GST receipts and settlement confirmation
              </Text>
            </View>
            <Switch
              value={localSettings.paymentReceipts}
              onValueChange={() => toggle("paymentReceipts")}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={localSettings.paymentReceipts ? Colors.primary : Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Dispute & Safety Updates</Text>
              <Text style={styles.settingSub}>
                Resolution desk tickets and customer protection alerts
              </Text>
            </View>
            <Switch
              value={localSettings.disputeUpdates}
              onValueChange={() => toggle("disputeUpdates")}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={localSettings.disputeUpdates ? Colors.primary : Colors.surface}
            />
          </View>
        </Card>
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
    padding: Spacing.base,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
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
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});

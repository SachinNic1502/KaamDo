import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../../utils/constants";
import { AppHeader, Card, useToast } from "../../../components/ui";

export default function CustomerPrivacyScreen({ navigation }: any) {
  const toast = useToast();
  const [locationConsent, setLocationConsent] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [serviceLogging, setServiceLogging] = useState(true);

  const handleExportData = () => {
    Alert.alert(
      "Personal Data Export",
      "We will compile your complete booking receipts, service logs, and account data into a password-protected PDF and send it to your registered email.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send to Email",
          onPress: () => {
            toast.success(
              "Export Initiated",
              "Your encrypted data package will arrive within 24 hours."
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Request Account Deletion",
      "Under DPDP Act 2023, all your personal identities, payment tokens, and addresses will be permanently wiped within 30 days. Active jobs must be completed first.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed to Deletion",
          style: "destructive",
          onPress: () => {
            toast.info(
              "Request Submitted",
              "A confirmation link has been sent to your registered phone."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Privacy & Data Protection"
        subtitle="India DPDP Act 2023 Compliant"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compliance Banner */}
        <View style={styles.complianceCard}>
          <View style={styles.complianceIconWrap}>
            <Ionicons name="shield-checkmark" size={26} color="#16A34A" />
          </View>
          <View style={styles.complianceMeta}>
            <Text style={styles.complianceTitle}>Your Data is Protected</Text>
            <Text style={styles.complianceSub}>
              KaamDo adheres strictly to the Digital Personal Data Protection (DPDP) Act of India. We never sell your contact details or address to third-party marketing firms.
            </Text>
          </View>
        </View>

        {/* Permissions & Consent */}
        <Text style={styles.sectionHeader}>Data Processing Consents</Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Real-Time GPS Location</Text>
              <Text style={styles.settingSub}>
                Allows matching with verified trade technicians within your 5-10 km radius
              </Text>
            </View>
            <Switch
              value={locationConsent}
              onValueChange={setLocationConsent}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={locationConsent ? Colors.primary : Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Anonymous App Analytics</Text>
              <Text style={styles.settingSub}>
                Helps improve dispatch speed, reduce crashes, and optimize battery usage
              </Text>
            </View>
            <Switch
              value={analyticsConsent}
              onValueChange={setAnalyticsConsent}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={analyticsConsent ? Colors.primary : Colors.surface}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingMeta}>
              <Text style={styles.settingTitle}>Service Warranty Log</Text>
              <Text style={styles.settingSub}>
                Retains service photos and parts receipts for your 30-day warranty claims
              </Text>
            </View>
            <Switch
              value={serviceLogging}
              onValueChange={setServiceLogging}
              trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
              thumbColor={serviceLogging ? Colors.primary : Colors.surface}
            />
          </View>
        </Card>

        {/* User Rights */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          Your Statutory Rights
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="download-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.actionMeta}>
              <Text style={styles.actionTitle}>Download Personal Data Archive</Text>
              <Text style={styles.actionSub}>Export all your invoices, addresses, and history</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.errorLight }]}>
              <Ionicons name="trash-bin-outline" size={20} color={Colors.error} />
            </View>
            <View style={styles.actionMeta}>
              <Text style={[styles.actionTitle, { color: Colors.error }]}>
                Delete Account & Erase Data
              </Text>
              <Text style={styles.actionSub}>Irreversible erasure under Right to be Forgotten</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
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
    paddingBottom: 110,
  },
  complianceCard: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  complianceIconWrap: {
    marginTop: 2,
  },
  complianceMeta: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: "#166534",
  },
  complianceSub: {
    fontSize: FontSize.xxs + 1,
    color: "#15803D",
    marginTop: 3,
    lineHeight: 16,
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
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.base,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  actionMeta: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

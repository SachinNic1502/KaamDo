import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { Colors, Spacing, FontSize } from "../../constants";
import { updateNotificationSettings } from "../../store/authSlice";

interface NotificationPreference {
  key: string;
  label: string;
  description: string;
  defaultValue: boolean;
  value?: boolean;
}

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth.user);
  const { notificationSettings } = useSelector((state: any) => state.auth);

  const preferences: NotificationPreference[] = [
    {
      key: "jobUpdates",
      label: "Job Updates",
      description: "Receive notifications about new job opportunities",
      defaultValue: true,
    },
    {
      key: "chatMessages",
      label: "Chat Messages",
      description: "Receive notifications for new messages from customers/workers",
      defaultValue: true,
    },
    {
      key: "paymentReceipts",
      label: "Payment Receipts",
      description: "Receive notifications when payments are completed",
      defaultValue: true,
    },
    {
      key: "disputeUpdates",
      label: "Dispute Updates",
      description: "Receive notifications about dispute status changes",
      defaultValue: true,
    },
  ];

  const [prefs, setPrefs] = useState<NotificationPreference[]>(preferences);

  useEffect(() => {
    // Load saved preferences from user profile or use defaults
    if (user?.notificationSettings) {
      setPrefs(current => current.map(pref => ({
        ...pref,
        value: user.notificationSettings[pref.key as keyof typeof user.notificationSettings],
      })));
    }
  }, [user]);

  const handleSwitchChange = (key: string, value: boolean) => {
    setPrefs(prev => prev.map(p => p.key === key ? { ...p, value } : p));
  };

  const savePreferences = async () => {
    try {
      await dispatch(updateNotificationSettings({ userId: user?._id || "", settings: Object.fromEntries(prefs.map(p => [p.key, p.value ?? p.defaultValue])) })).unwrap();
      Alert.alert("Success", "Notification preferences saved successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionSubtitle}>
            Choose which notifications you'd like to receive
          </Text>
        </View>

        {prefs.map((pref) => (
          <View
            key={pref.key}
            style={styles.preferenceRow}
          >
            <View style={styles.preferenceLabelContainer}>
              <Text style={styles.preferenceLabel}>{pref.label}</Text>
              <Text style={styles.preferenceDescription}>{pref.description}</Text>
            </View>

            <Switch
              value={prefs.find(p => p.key === pref.key)?.value ?? pref.defaultValue}
              onValueChange={(value) => handleSwitchChange(pref.key, value)}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : prefs.find(p => p.key === pref.key)?.value ? '#fff' : '#f4f3f4'}
            />
          </View>
        ))}

        <TouchableOpacity accessibilityRole="button" style={styles.section} onPress={savePreferences}>
          <Text style={styles.saveButton}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  preferenceLabelContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  preferenceLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  preferenceDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
});
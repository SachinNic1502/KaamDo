import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";

export const TrustValueStrip: React.FC = () => {
  return (
    <View style={styles.strip}>
      <View style={styles.item}>
        <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
        <Text style={styles.title}>Vetted Pros</Text>
        <Text style={styles.subtitle}>Police & KYC verified</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <Ionicons name="cash-outline" size={20} color={Colors.success} />
        <Text style={styles.title}>Fixed Rates</Text>
        <Text style={styles.subtitle}>No surprise charges</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <Ionicons name="time-outline" size={20} color={Colors.accent} />
        <Text style={styles.title}>On-Time Arrival</Text>
        <Text style={styles.subtitle}>Guaranteed dispatch</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 1,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});

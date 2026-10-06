import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { Address } from "../../types";

export interface JobLocationCardProps {
  address?: Address;
  onOpenMaps: () => void;
}

export const JobLocationCard: React.FC<JobLocationCardProps> = ({
  address,
  onOpenMaps,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.addressHeader}>
        <Text style={styles.sectionTitle}>Service Location</Text>
        <TouchableOpacity
          onPress={onOpenMaps}
          style={styles.mapLink}
          activeOpacity={0.7}
        >
          <Ionicons name="navigate" size={14} color={Colors.primary} />
          <Text style={styles.mapLinkText}>Google Maps</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressFull}>
        {address?.address || "Address not provided"}
      </Text>
      <Text style={styles.addressCity}>
        {address?.city}, {address?.state} - {address?.pincode}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mapLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapLinkText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 3,
  },
  addressFull: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  addressCity: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

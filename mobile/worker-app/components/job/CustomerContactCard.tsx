import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { User } from "../../types";

export interface CustomerContactCardProps {
  customer?: User;
  onCall: () => void;
  onChat: () => void;
}

export const CustomerContactCard: React.FC<CustomerContactCardProps> = ({
  customer,
  onCall,
  onChat,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Customer Information</Text>
      <View style={styles.customerRow}>
        <View style={styles.customerAvatar}>
          <Ionicons name="person" size={24} color={Colors.primary} />
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {customer?.name || "Customer"}
          </Text>
          <Text style={styles.customerPhone}>
            {customer?.phone ? `+91 ${customer.phone}` : "Verified Client"}
          </Text>
        </View>
      </View>

      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={onCall}
          activeOpacity={0.8}
        >
          <Ionicons name="call" size={16} color={Colors.white} />
          <Text style={styles.contactBtnText}>Call Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={onChat}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={16} color={Colors.primary} />
          <Text style={styles.chatBtnText}>In-App Chat</Text>
        </TouchableOpacity>
      </View>
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
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: {
    marginLeft: Spacing.sm,
  },
  customerName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.secondaryDark,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  contactBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginLeft: 4,
  },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  chatBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 4,
  },
});

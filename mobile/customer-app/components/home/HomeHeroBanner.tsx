import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";

interface HomeHeroBannerProps {
  onBookPress: () => void;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({ onBookPress }) => {
  return (
    <View style={styles.banner}>
      <View style={styles.contentCol}>
        {/* Quality guarantee pill */}
        <View style={styles.guaranteeTag}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.accent} />
          <Text style={styles.guaranteeTagText}>KAAMDO GUARANTEED</Text>
        </View>

        <Text style={styles.title}>Verified Home Services at Your Doorstep</Text>
        <Text style={styles.subtitle}>
          Fixed pricing, background-checked pros & 30-day work warranty across India.
        </Text>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onBookPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Book an Expert</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg + 2,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    ...Shadows.md,
  },
  contentCol: {
    alignItems: "flex-start",
  },
  guaranteeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(254, 103, 5, 0.22)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  guaranteeTagText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: 0.6,
    marginLeft: 4,
  },
  title: {
    fontSize: FontSize.lg + 2,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.4,
    lineHeight: 25,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: "#CBD5E1",
    lineHeight: 18,
    marginBottom: Spacing.base,
    maxWidth: 295,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  ctaText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.white,
    marginRight: 6,
  },
});

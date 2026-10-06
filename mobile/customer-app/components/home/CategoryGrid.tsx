import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../utils/constants";
import { SectionHeader, SkeletonCard } from "../ui";

const CATEGORY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  plumbing: { icon: "water-outline", color: "#0284C7", bg: "#F0F9FF" },
  electrician: { icon: "flash-outline", color: "#D97706", bg: "#FFFBEB" },
  electrical: { icon: "flash-outline", color: "#D97706", bg: "#FFFBEB" },
  carpentry: { icon: "hammer-outline", color: "#B45309", bg: "#FEF3C7" },
  painting: { icon: "color-palette-outline", color: "#7C3AED", bg: "#F5F3FF" },
  cleaning: { icon: "sparkles-outline", color: "#059669", bg: "#ECFDF5" },
  appliance: { icon: "tv-outline", color: "#DC2626", bg: "#FEF2F2" },
  ac: { icon: "snow-outline", color: "#0891B2", bg: "#ECFEFF" },
  masonry: { icon: "construct-outline", color: "#475569", bg: "#F1F5F9" },
  default: { icon: "grid-outline", color: Colors.primary, bg: Colors.primaryLight },
};

interface CategoryGridProps {
  categories: any[];
  isLoading: boolean;
  onViewAll: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading,
  onViewAll,
  onSelectCategory,
}) => {
  const getCatMeta = (slug?: string) => {
    if (!slug) return CATEGORY_META.default;
    const lower = slug.toLowerCase();
    const key = Object.keys(CATEGORY_META).find((k) => lower.includes(k));
    return key ? CATEGORY_META[key] : CATEGORY_META.default;
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Browse Trade Categories"
        actionText="View All"
        onAction={onViewAll}
      />

      {isLoading ? (
        <View style={styles.skeletonRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCol}>
              <SkeletonCard height={88} borderRadius={16} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {categories.slice(0, 8).map((cat) => {
            const meta = getCatMeta(cat.slug || cat.name);
            return (
              <TouchableOpacity
                key={cat._id}
                style={styles.tile}
                onPress={() => onSelectCategory(cat.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
                <Text style={styles.catSub}>
                  {cat.subcategories?.length || 1}+ services
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  skeletonCol: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tile: {
    width: "23%",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: 4,
    ...Shadows.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  catName: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  catSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

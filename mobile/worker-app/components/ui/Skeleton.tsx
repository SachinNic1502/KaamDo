import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { Colors, BorderRadius, Spacing } from "../../constants";

export const SkeletonLine: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}> = ({ width = "100%", height = 16, borderRadius = BorderRadius.sm, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}> = ({ height = 120, borderRadius, style }) => {
  return (
    <View style={[styles.card, borderRadius !== undefined && { borderRadius }, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLine width="40%" height={16} />
        <SkeletonLine width={60} height={22} borderRadius={BorderRadius.full} />
      </View>
      <SkeletonLine width="80%" height={14} style={{ marginTop: Spacing.md }} />
      <SkeletonLine width="60%" height={14} style={{ marginTop: Spacing.xs }} />
      <View style={styles.cardFooter}>
        <SkeletonLine width={80} height={18} />
        <SkeletonLine width={100} height={32} borderRadius={BorderRadius.sm} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});

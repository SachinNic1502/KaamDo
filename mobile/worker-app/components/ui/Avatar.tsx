import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, BorderRadius } from "../../constants";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = "User",
  size = 48,
  isOnline,
  isVerified,
  style,
}) => {
  const getInitials = (n: string): string => {
    const parts = n.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase() || "KD";
  };

  const hasValidImage = !!uri && uri.startsWith("http");

  return (
    <View style={[{ width: size, height: size }, style]}>
      {hasValidImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}

      {/* Online indicator */}
      {isOnline !== undefined && (
        <View
          style={[
            styles.onlineBadge,
            {
              backgroundColor: isOnline ? Colors.online : Colors.textMuted,
              width: Math.max(10, size * 0.24),
              height: Math.max(10, size * 0.24),
              borderRadius: Math.max(5, size * 0.12),
            },
          ]}
        />
      )}

      {/* Verified check badge */}
      {isVerified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={Math.max(14, size * 0.36)}
            color={Colors.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.surfaceSubtle,
  },
  fallback: {
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  initials: {
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  verifiedBadge: {
    position: "absolute",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
  },
});

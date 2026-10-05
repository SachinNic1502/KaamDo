import React from "react";
import { View, Text, Image, ImageStyle, StyleProp, StyleSheet } from "react-native";
import { Colors } from "../utils/constants";

// Require official brand assets directly from local app assets
const iconAsset = require("../assets/logo/icon.png");
const fullLogoAsset = require("../assets/logo/full-logo.png");
const horizontalLogoAsset = require("../assets/logo/horizontal-logo.png");

interface LogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function LogoIcon({ size = 80, style }: LogoProps) {
  return (
    <Image
      source={iconAsset}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

interface LogoFullProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export function LogoFull({ width = 280, height, style }: LogoFullProps) {
  // Official primary logo aspect ratio is 1400:420 (3.33 : 1)
  const calculatedHeight = height ?? Math.round(width * (420 / 1400));

  return (
    <Image
      source={fullLogoAsset}
      style={[{ width, height: calculatedHeight }, style]}
      resizeMode="contain"
    />
  );
}

export function LogoWordmark({ width = 240, height, style }: LogoFullProps) {
  const calculatedHeight = height ?? Math.round(width * (420 / 1400));

  return (
    <Image
      source={horizontalLogoAsset}
      style={[{ width, height: calculatedHeight }, style]}
      resizeMode="contain"
    />
  );
}

export function LogoPartner({ size = 42, showBadge = true }: { size?: number; showBadge?: boolean }) {
  return (
    <View style={styles.partnerContainer}>
      <LogoIcon size={size} />
      {showBadge && (
        <View style={styles.partnerTag}>
          <Text style={styles.partnerTagText}>PARTNER</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  partnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partnerTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partnerTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.8,
  },
});

export const Logo = LogoIcon;
export default LogoIcon;

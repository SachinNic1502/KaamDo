import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

// Require official brand assets directly from local app assets
const iconAsset = require("../assets/logo/icon.png");
const fullLogoAsset = require("../assets/logo/full-logo.png");
const horizontalLogoAsset = require("../assets/logo/horizontal-logo.png");

interface LogoIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function LogoIcon({ size = 80, style }: LogoIconProps) {
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

export function LogoWordmark({ width = 260, height, style }: LogoFullProps) {
  // Horizontal logo without/with tagline
  const calculatedHeight = height ?? Math.round(width * (420 / 1400));

  return (
    <Image
      source={horizontalLogoAsset}
      style={[{ width, height: calculatedHeight }, style]}
      resizeMode="contain"
    />
  );
}

export const Logo = LogoIcon;
export default LogoIcon;

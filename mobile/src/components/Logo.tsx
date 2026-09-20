import React from "react";
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface LogoIconProps {
  size?: number;
}

export function LogoIcon({ size = 80 }: LogoIconProps) {
  const scale = size / 200;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
        <LinearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#F97316" />
        </LinearGradient>
      </Defs>
      <Rect x="20" y="30" width="36" height="140" rx="18" fill="url(#blueGrad)" />
      <Circle cx="90" cy="42" r="20" fill="url(#blueGrad)" />
      <Path d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z" fill="url(#orangeGrad)" />
      <Path
        d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144"
        fill="url(#blueGrad)"
      />
    </Svg>
  );
}

interface LogoFullProps {
  width?: number;
}

export function LogoFull({ width = 280 }: LogoFullProps) {
  const height = width * 0.27;

  return (
    <Svg width={width} height={height} viewBox="0 0 600 160">
      <Defs>
        <LinearGradient id="blueGradFull" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
        <LinearGradient id="orangeGradFull" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#F97316" />
        </LinearGradient>
      </Defs>
      <g transform="translate(0, 10) scale(0.7)">
        <Rect x="20" y="30" width="36" height="140" rx="18" fill="url(#blueGradFull)" />
        <Circle cx="90" cy="42" r="20" fill="url(#blueGradFull)" />
        <Path d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z" fill="url(#orangeGradFull)" />
        <Path
          d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144"
          fill="url(#blueGradFull)"
        />
      </g>
    </Svg>
  );
}

export function LogoWordmark({ width = 400 }: { width?: number }) {
  const height = width * 0.4;

  return (
    <Svg width={width} height={height} viewBox="0 0 400 120">
      <Defs>
        <LinearGradient id="blueGradWM" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
        <LinearGradient id="orangeGradWM" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#F97316" />
        </LinearGradient>
      </Defs>
      <g transform="translate(10, 5) scale(0.5)">
        <Rect x="20" y="30" width="36" height="140" rx="18" fill="url(#blueGradWM)" />
        <Circle cx="90" cy="42" r="20" fill="url(#blueGradWM)" />
        <Path d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z" fill="url(#orangeGradWM)" />
        <Path
          d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144"
          fill="url(#blueGradWM)"
        />
      </g>
    </Svg>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./constants";

export interface CategoryMeta {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label?: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  plumbing: { icon: "water", color: "#0284C7", bg: "#E0F2FE", label: "Plumber" },
  electrical: { icon: "flash", color: "#4F46E5", bg: "#EEF2FF", label: "Electrician" },
  carpentry: { icon: "hammer", color: "#D97706", bg: "#FEF3C7", label: "Carpenter" },
  painting: { icon: "color-palette", color: "#DB2777", bg: "#FCE7F3", label: "Painter" },
  cleaning: { icon: "sparkles", color: "#16A34A", bg: "#DCFCE7", label: "Cleaning" },
  appliance: { icon: "tv", color: "#9333EA", bg: "#F3E8FF", label: "Appliances" },
  hvac: { icon: "snow", color: "#0284C7", bg: "#E0F2FE", label: "AC Service" },
  ac: { icon: "snow", color: "#0284C7", bg: "#E0F2FE", label: "AC Service" },
  masonry: { icon: "construct", color: "#EA580C", bg: "#FFEDD5", label: "Masonry" },
  default: { icon: "grid", color: Colors.primary, bg: Colors.primaryLight, label: "Services" },
};

export function getCategoryMeta(slugOrName?: string): CategoryMeta {
  if (!slugOrName) return CATEGORY_META.default;
  const lower = slugOrName.toLowerCase();
  const key = Object.keys(CATEGORY_META).find((k) => lower.includes(k));
  return key ? CATEGORY_META[key] : CATEGORY_META.default;
}

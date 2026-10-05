const grayPalette = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
};

const grayObject = Object.assign(new String("#64748B"), grayPalette) as unknown as string & typeof grayPalette;

export const Colors = {
  // Brand
  primary: "#0456D3",
  primaryLight: "#EFF6FF",
  primaryDark: "#0343A5",
  primaryLight2: "#DBEAFE",
  primaryMuted: "#DBEAFE",
  secondary: "#FE6705",
  secondaryLight: "#FFF7ED",
  secondaryDark: "#DC5402",

  // Accents
  accent: "#FE6705",
  accentLight: "#FFF7ED",

  // Surfaces & Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSubtle: "#F1F5F9",
  card: "#FFFFFF",
  navy: "#001E68",

  // Typography
  text: "#0F172A",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",
  white: "#FFFFFF",

  // Borders
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  borderFocus: "#0456D3",

  // Functional Semantic Accents
  success: "#10B981",
  successLight: "#ECFDF5",
  successDark: "#047857",

  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  warningDark: "#B45309",

  error: "#EF4444",
  danger: "#EF4444",
  errorLight: "#FEF2F2",
  errorDark: "#B91C1C",

  info: "#0EA5E9",
  infoLight: "#EFF6FF",
  infoDark: "#0369A1",

  // Neutral grays
  gray: grayObject,
  lightGray: "#F1F5F9",
  disabled: "#E2E8F0",
  disabledText: "#94A3B8",
};

export const Spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screen: 16,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xxs: 10,
  xs: 12,
  sm: 13,
  md: 14,
  base: 15,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 24,
  header: 28,
  display: 32,
};

export const Shadows = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};

export interface StatusMeta {
  label: string;
  color: string;
  bg: string;
  dot: string;
  stepIndex: number;
}

export const JobStatus: Record<string, StatusMeta> = {
  draft: {
    label: "Draft",
    color: Colors.textMuted,
    bg: Colors.surfaceSubtle,
    dot: Colors.textMuted,
    stepIndex: 0,
  },
  searching: {
    label: "Finding Worker",
    color: "#B45309",
    bg: "#FFFBEB",
    dot: "#F59E0B",
    stepIndex: 1,
  },
  worker_assigned: {
    label: "Worker Assigned",
    color: "#0369A1",
    bg: "#F0F9FF",
    dot: "#0EA5E9",
    stepIndex: 2,
  },
  worker_accepted: {
    label: "Offer Accepted",
    color: "#0369A1",
    bg: "#F0F9FF",
    dot: "#0EA5E9",
    stepIndex: 2,
  },
  on_the_way: {
    label: "On The Way",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    dot: "#2563EB",
    stepIndex: 3,
  },
  arrived: {
    label: "Worker Arrived",
    color: "#4338CA",
    bg: "#EEF2FF",
    dot: "#6366F1",
    stepIndex: 4,
  },
  work_started: {
    label: "Work Started",
    color: "#0D9488",
    bg: "#F0FDFA",
    dot: "#14B8A6",
    stepIndex: 5,
  },
  in_progress: {
    label: "In Progress",
    color: "#0D9488",
    bg: "#F0FDFA",
    dot: "#14B8A6",
    stepIndex: 5,
  },
  waiting_approval: {
    label: "Approval Needed",
    color: "#B45309",
    bg: "#FFFBEB",
    dot: "#F59E0B",
    stepIndex: 5,
  },
  completion_requested: {
    label: "Completion Review",
    color: "#C2410C",
    bg: "#FFF7ED",
    dot: "#EA580C",
    stepIndex: 5,
  },
  completed: {
    label: "Completed",
    color: "#047857",
    bg: "#ECFDF5",
    dot: "#10B981",
    stepIndex: 6,
  },
  paid: {
    label: "Paid & Settled",
    color: "#047857",
    bg: "#ECFDF5",
    dot: "#10B981",
    stepIndex: 6,
  },
  closed: {
    label: "Closed",
    color: Colors.textMuted,
    bg: Colors.surfaceSubtle,
    dot: Colors.textMuted,
    stepIndex: 6,
  },
  cancelled: {
    label: "Cancelled",
    color: "#B91C1C",
    bg: "#FEF2F2",
    dot: "#EF4444",
    stepIndex: 0,
  },
  disputed: {
    label: "Under Dispute",
    color: "#B91C1C",
    bg: "#FEF2F2",
    dot: "#EF4444",
    stepIndex: 5,
  },
};

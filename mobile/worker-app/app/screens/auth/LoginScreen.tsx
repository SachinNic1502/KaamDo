import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Input, PrimaryButton } from "../../../components/ui";
import { Logo } from "../../../components/Logo";
import { api } from "../../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 320);

interface SeedWorker {
  id: string;
  name: string;
  phone: string;
  trade: string;
  category: "Electrician" | "Plumber" | "Carpenter" | "Contractor" | "Admin";
  role: "worker" | "contractor" | "admin";
  experience: string;
  rating: number;
  totalJobs: number;
  badge: string;
  hourlyRate: string;
  specialization: string[];
  serviceAreas: string;
  passwordRaw: string;
  demoOtp: string;
  avatarIcon: keyof typeof Ionicons.glyphMap;
  tagColor: string;
  tagBg: string;
}

const SEED_WORKERS: SeedWorker[] = [
  {
    id: "ramesh",
    name: "Ramesh Kumar",
    phone: "9876543212",
    trade: "Master Electrician",
    category: "Electrician",
    role: "worker",
    experience: "6 Yrs Exp",
    rating: 4.9,
    totalJobs: 142,
    badge: "Verified Pro Worker",
    hourlyRate: "₹299/hr • ₹1,499/day",
    specialization: ["Wiring", "Switchboard", "Appliance Fix"],
    serviceAreas: "Bengaluru, Mumbai",
    passwordRaw: "WorkerPass123!",
    demoOtp: "1234",
    avatarIcon: "flash",
    tagColor: Colors.primary,
    tagBg: Colors.primaryLight,
  },
  {
    id: "suresh",
    name: "Suresh Verma",
    phone: "9876543220",
    trade: "Sanitary Specialist",
    category: "Plumber",
    role: "worker",
    experience: "8 Yrs Exp",
    rating: 4.85,
    totalJobs: 98,
    badge: "Master Plumber",
    hourlyRate: "₹249/hr • ₹1,299/day",
    specialization: ["Pipe Leakage", "Motors", "Drainage"],
    serviceAreas: "Bengaluru & Mysuru",
    passwordRaw: "WorkerPass123!",
    demoOtp: "1234",
    avatarIcon: "water",
    tagColor: "#0284C7",
    tagBg: "#E0F2FE",
  },
  {
    id: "mohan",
    name: "Mohan Lal",
    phone: "9876543221",
    trade: "Custom Woodwork",
    category: "Carpenter",
    role: "worker",
    experience: "5 Yrs Exp",
    rating: 4.92,
    totalJobs: 76,
    badge: "Furniture Craftsman",
    hourlyRate: "₹349/hr • ₹1,699/day",
    specialization: ["Modular Kitchen", "Door Fitting", "Polishing"],
    serviceAreas: "Mumbai Suburban",
    passwordRaw: "WorkerPass123!",
    demoOtp: "1234",
    avatarIcon: "hammer",
    tagColor: "#B45309",
    tagBg: "#FEF3C7",
  },
  {
    id: "apex",
    name: "Apex Builders",
    phone: "9876543213",
    trade: "Renovation Lead",
    category: "Contractor",
    role: "contractor",
    experience: "12 Yrs Exp",
    rating: 4.8,
    totalJobs: 38,
    badge: "Commercial Contractor",
    hourlyRate: "Milestone Bids",
    specialization: ["Full Home Renovation", "Painting", "Masonry"],
    serviceAreas: "All Metro Hubs",
    passwordRaw: "ContractorPass123!",
    demoOtp: "1234",
    avatarIcon: "business",
    tagColor: Colors.secondary,
    tagBg: Colors.secondaryLight,
  },
  {
    id: "admin",
    name: "Super Admin",
    phone: "9876543210",
    trade: "Platform Operations",
    category: "Admin",
    role: "admin",
    experience: "Lead Operator",
    rating: 5.0,
    totalJobs: 500,
    badge: "Full Control",
    hourlyRate: "Super Operator",
    specialization: ["KYC Approvals", "Payout Releases", "Disputes"],
    serviceAreas: "Platform Wide",
    passwordRaw: "AdminPassword123!",
    demoOtp: "1234",
    avatarIcon: "shield-checkmark",
    tagColor: "#7C3AED",
    tagBg: "#EDE9FE",
  },
];

const CATEGORIES = ["All", "Electrician", "Plumber", "Carpenter", "Contractor", "Admin"];

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState("Electrician");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeedId, setSelectedSeedId] = useState<string>("ramesh");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const carouselRef = useRef<ScrollView>(null);

  const trades = [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Painter",
    "AC Technician",
    "Appliance Repair",
    "Cleaner",
    "Mason",
  ];

  const filteredWorkers = SEED_WORKERS.filter((w) => {
    if (selectedCategory === "All") return true;
    return w.category === selectedCategory;
  });

  const handleSelectSeedWorker = (worker: SeedWorker, autoSend = false) => {
    setSelectedSeedId(worker.id);
    setPhone(worker.phone);
    if (isRegister) {
      setFullName(worker.name);
      if (trades.includes(worker.category)) {
        setSelectedTrade(worker.category);
      }
    }

    if (autoSend) {
      handleSendOtp(worker.phone, worker.name, worker.trade);
    }
  };

  const handleCategoryPress = (cat: string) => {
    setSelectedCategory(cat);
    // Find first worker in that category and select
    const firstMatch = cat === "All" ? SEED_WORKERS[0] : SEED_WORKERS.find((w) => w.category === cat);
    if (firstMatch) {
      handleSelectSeedWorker(firstMatch, false);
      carouselRef.current?.scrollTo({ x: 0, animated: true });
      setActiveCardIndex(0);
    }
  };

  const onScrollCarousel = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 12));
    if (index >= 0 && index < filteredWorkers.length && index !== activeCardIndex) {
      setActiveCardIndex(index);
    }
  };

  const handleSendOtp = async (overridePhone?: string, overrideName?: string, overrideTrade?: string) => {
    const rawTargetPhone = overridePhone || phone;
    const cleanPhone = rawTargetPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number");
      return;
    }

    const nameToUse = overrideName || (isRegister ? fullName.trim() : undefined);
    const tradeToUse = overrideTrade || (isRegister ? selectedTrade : undefined);

    if (isRegister && !overrideName && !fullName.trim()) {
      Alert.alert("Name Required", "Please enter your full legal name for your partner account");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<any>("/api/auth/send-otp", {
        phone: cleanPhone,
        role: "worker",
        name: nameToUse,
        trade: tradeToUse,
      });

      const demoCode = res.demoOtp || res.otp || res.data?.demoOtp || res.data?.otp || "1234";
      navigation.navigate("Otp", {
        phone: cleanPhone,
        fullName: nameToUse,
        role: "worker",
        trade: tradeToUse,
        isRegister,
        otpDemo: demoCode,
      });
    } catch (err: any) {
      Alert.alert(
        "Development Notice",
        err.message || "Could not dispatch SMS. You can proceed with demo verification code 1234."
      );
      navigation.navigate("Otp", {
        phone: cleanPhone,
        fullName: nameToUse,
        role: "worker",
        trade: tradeToUse,
        isRegister,
        otpDemo: "1234",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo with Regal Wine & Champagne Gold Accent */}
          <View style={styles.header}>
            <Logo size={46} />
            <View style={styles.partnerBadge}>
              <Ionicons name="sparkles" size={12} color="#F59E0B" />
              <Text style={styles.partnerBadgeText}>SERVICE PARTNER GUILD</Text>
            </View>
            <Text style={styles.title}>
              {isRegister ? "Join as a KaamDo Pro" : "Partner Portal Sign In"}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister
                ? "Get verified, receive direct customer leads, and earn guaranteed weekly bank settlements."
                : "Select a pre-seeded professional profile or enter your 10-digit mobile number."}
            </Text>
          </View>

          {/* Seed Profiles Carousel Section */}
          <View style={styles.seedSection}>
            <View style={styles.seedHeaderRow}>
              <View style={styles.seedTitleGroup}>
                <Ionicons name="people" size={16} color={Colors.primary} />
                <Text style={styles.seedSectionTitle}>Demo Partner Profiles</Text>
              </View>
              <View style={styles.seedBadgePill}>
                <Text style={styles.seedBadgeText}>{filteredWorkers.length} Active</Text>
              </View>
            </View>

            {/* Segmented Category Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFiltersRow}
            >
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => handleCategoryPress(cat)}
                    style={[
                      styles.categoryFilterChip,
                      isActive && styles.categoryFilterChipActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryFilterText,
                        isActive && styles.categoryFilterTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Horizontal Swipeable Card Carousel */}
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled={false}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + 12}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              onScroll={onScrollCarousel}
              scrollEventThrottle={16}
            >
              {filteredWorkers.map((worker) => {
                const isSelected = selectedSeedId === worker.id && phone === worker.phone;

                return (
                  <TouchableOpacity
                    key={worker.id}
                    style={[
                      styles.carouselCard,
                      { width: CARD_WIDTH },
                      isSelected && styles.carouselCardSelected,
                    ]}
                    onPress={() => handleSelectSeedWorker(worker, false)}
                    activeOpacity={0.9}
                  >
                    {/* Top Row: Avatar, Name, Selection Badge */}
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.avatarWrap, { backgroundColor: worker.tagBg }]}>
                        <Ionicons name={worker.avatarIcon} size={18} color={worker.tagColor} />
                      </View>

                      <View style={styles.cardNameBlock}>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardName} numberOfLines={1}>
                            {worker.name}
                          </Text>
                          {isSelected && (
                            <View style={styles.selectedTag}>
                              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
                              <Text style={styles.selectedTagText}>Active</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardTradeText}>{worker.trade} • {worker.experience}</Text>
                      </View>
                    </View>

                    {/* Stats Pill Row */}
                    <View style={styles.statsStrip}>
                      <View style={styles.statGroup}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.statRating}>{worker.rating}</Text>
                        <Text style={styles.statCount}>({worker.totalJobs} jobs)</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <Text style={styles.statRate} numberOfLines={1}>{worker.hourlyRate}</Text>
                    </View>

                    {/* Skills Chips */}
                    <View style={styles.chipsRow}>
                      {worker.specialization.map((skill) => (
                        <View key={skill} style={styles.miniChip}>
                          <Text style={styles.miniChipText}>{skill}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Credentials Strip */}
                    <View style={styles.credentialsRow}>
                      <View style={styles.credCell}>
                        <Text style={styles.credLabel}>Phone:</Text>
                        <Text style={styles.credVal}>+91 {worker.phone}</Text>
                      </View>
                      <View style={styles.credSep} />
                      <View style={styles.credCell}>
                        <Text style={styles.credLabel}>OTP:</Text>
                        <Text style={styles.credCode}>{worker.demoOtp}</Text>
                      </View>
                    </View>

                    {/* 1-Tap Login Action */}
                    <TouchableOpacity
                      style={[
                        styles.oneTapButton,
                        isSelected && styles.oneTapButtonActive,
                      ]}
                      onPress={() => handleSelectSeedWorker(worker, true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="flash"
                        size={13}
                        color={isSelected ? "#FFFFFF" : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.oneTapText,
                          isSelected && styles.oneTapTextActive,
                        ]}
                      >
                        1-Tap Sign In
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Carousel Pagination Dots */}
            {filteredWorkers.length > 1 && (
              <View style={styles.dotsRow}>
                {filteredWorkers.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeCardIndex === i && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formTitleRow}>
              <Text style={styles.formTitle}>
                {isRegister ? "Partner Registration" : "Account Verification"}
              </Text>
            </View>

            {isRegister && (
              <>
                <Input
                  label="Full Legal Name"
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon="person-outline"
                />

                <Text style={styles.fieldLabel}>Select Primary Trade</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tradesRow}
                >
                  {trades.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setSelectedTrade(t)}
                      style={[
                        styles.tradeChip,
                        selectedTrade === t && styles.tradeChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tradeChipText,
                          selectedTrade === t && styles.tradeChipTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Input
              label="Registered Mobile Number"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              leftIcon="call-outline"
            />

            <PrimaryButton
              title={isLoading ? "Sending OTP..." : "Get Verification Code"}
              onPress={() => handleSendOtp()}
              loading={isLoading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              onPress={() => setIsRegister(!isRegister)}
              style={styles.switchMode}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {isRegister
                  ? "Already registered as a partner? "
                  : "New service professional? "}
                <Text style={styles.switchLink}>
                  {isRegister ? "Sign In" : "Register as Partner"}
                </Text>
              </Text>
            </TouchableOpacity>

            {!isRegister && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotPassBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPassText}>Trouble signing in?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Partner Benefits Banner */}
          <View style={styles.benefitContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <Ionicons name="flash-outline" size={16} color={Colors.primary} />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Direct Local Customer Leads</Text>
                <Text style={styles.benefitDesc}>Instant job alerts with upfront guaranteed prices</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#F59E0B" />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>Guaranteed Bank Payouts</Text>
                <Text style={styles.benefitDesc}>Weekly settlements via UPI or direct bank account</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  partnerBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: "#F59E0B", // Champagne Gold
    letterSpacing: 0.8,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },
  seedSection: {
    marginBottom: Spacing.base,
  },
  seedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  seedTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  seedSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  seedBadgePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  seedBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  categoryFiltersRow: {
    gap: 6,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  categoryFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  categoryFilterText: {
    fontSize: FontSize.xs - 1,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  categoryFilterTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  carouselContainer: {
    paddingHorizontal: 2,
    gap: 12,
    paddingBottom: 4,
  },
  carouselCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  carouselCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFAFA",
    ...Shadows.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardNameBlock: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardName: {
    fontSize: FontSize.sm + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.xs,
  },
  selectedTagText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  cardTradeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statRating: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statCount: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  statRate: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "600",
    color: Colors.textSecondary,
    flex: 1,
    textAlign: "right",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  miniChip: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  miniChipText: {
    fontSize: FontSize.xxs - 0.5,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  credentialsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  credCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  credLabel: {
    fontSize: FontSize.xxs - 0.5,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  credVal: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  credCode: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  credSep: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  oneTapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
  oneTapButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  oneTapText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  oneTapTextActive: {
    color: Colors.white,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    ...Shadows.sm,
  },
  formTitleRow: {
    marginBottom: Spacing.sm,
  },
  formTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tradesRow: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tradeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tradeChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tradeChipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  tradeChipTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  switchMode: {
    marginTop: Spacing.base,
    alignItems: "center",
  },
  switchText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  switchLink: {
    color: Colors.primary,
    fontWeight: "700",
  },
  forgotPassBtn: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  forgotPassText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  benefitContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefitIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  benefitDesc: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

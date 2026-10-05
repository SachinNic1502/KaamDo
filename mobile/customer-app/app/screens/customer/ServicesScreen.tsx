import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { getCategoryMeta } from "../../../utils/category-meta";
import { useCategories } from "../../../hooks/use-api";
import { AppHeader } from "../../../components/ui";

type PricingModelFilter = "all" | "fixed" | "hourly" | "visit";
type PriceRangeFilter = "all" | "under300" | "300to600" | "above600";
type SortByFilter = "popular" | "price_asc" | "price_desc";

interface FilterOptions {
  categoryId: string; // "all" or specific category _id
  pricingModel: PricingModelFilter;
  priceRange: PriceRangeFilter;
  sortBy: SortByFilter;
  fastEtaOnly: boolean;
  warrantyOnly: boolean;
}

const DEFAULT_FILTERS: FilterOptions = {
  categoryId: "all",
  pricingModel: "all",
  priceRange: "all",
  sortBy: "popular",
  fastEtaOnly: false,
  warrantyOnly: false,
};

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.85, 340);

export default function ServicesScreen({ navigation }: any) {
  const [search, setSearch] = useState("");
  const [selectedTradeTab, setSelectedTradeTab] = useState<string>("all");
  const { data, isLoading } = useCategories();
  const categories = data?.data ?? [];

  // Filter Drawer State & Animations
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openDrawer = () => {
    setTempFilters(filters);
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    if (tempFilters.categoryId !== "all") {
      setSelectedTradeTab(tempFilters.categoryId);
    }
    closeDrawer();
  };

  const resetFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setSelectedTradeTab("all");
    closeDrawer();
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId !== "all") count++;
    if (filters.pricingModel !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.sortBy !== "popular") count++;
    if (filters.fastEtaOnly) count++;
    if (filters.warrantyOnly) count++;
    return count;
  }, [filters]);

  // Aggregate all subcategories across categories with their parent category info
  const allServiceItems = useMemo(() => {
    const list: Array<{
      _id: string;
      name: string;
      pricingModel: string;
      basePrice?: number;
      category: {
        _id: string;
        name: string;
        slug: string;
        description?: string;
      };
    }> = [];

    categories.forEach((cat) => {
      (cat.subcategories || []).forEach((sub) => {
        list.push({
          _id: sub._id,
          name: sub.name,
          pricingModel: sub.pricingModel,
          basePrice: sub.basePrice,
          category: {
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
          },
        });
      });
    });

    return list;
  }, [categories]);

  // Filtered and Sorted Services List
  const displayedServices = useMemo(() => {
    let result = allServiceItems.filter((item) => {
      // 1. Search text filter
      const q = search.toLowerCase().trim();
      if (q) {
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.category.name.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Category tab / filter
      const activeCatId =
        filters.categoryId !== "all" ? filters.categoryId : selectedTradeTab;
      if (activeCatId !== "all" && item.category._id !== activeCatId) {
        return false;
      }

      // 3. Pricing model filter
      if (filters.pricingModel !== "all") {
        if (filters.pricingModel === "fixed" && item.pricingModel !== "fixed") return false;
        if (filters.pricingModel === "hourly" && item.pricingModel !== "hourly") return false;
        if (filters.pricingModel === "visit" && item.pricingModel !== "visit") return false;
      }

      // 4. Price range filter
      const price = item.basePrice || 0;
      if (filters.priceRange === "under300" && price > 300) return false;
      if (filters.priceRange === "300to600" && (price <= 300 || price > 600)) return false;
      if (filters.priceRange === "above600" && price <= 600) return false;

      return true;
    });

    // 5. Sort
    if (filters.sortBy === "price_asc") {
      result = [...result].sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    } else if (filters.sortBy === "price_desc") {
      result = [...result].sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
    }

    return result;
  }, [allServiceItems, search, filters, selectedTradeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Services & Repairs"
        subtitle="Upfront Rates • 30-Day Workmanship Warranty"
      />

      {/* Search Bar + Filter Trigger */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={Colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks (e.g. Switch, Tap, AC gas, Leak)..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Popup Button */}
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFilterCount > 0 && styles.filterTriggerBtnActive,
          ]}
          onPress={openDrawer}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={19}
            color={activeFilterCount > 0 ? Colors.white : Colors.primary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Horizontal Trade Category Pill Bar */}
      <View style={styles.categoryBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryBarScroll}
        >
          {/* All Trades Tab */}
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedTradeTab === "all" && styles.categoryPillActive,
            ]}
            onPress={() => {
              setSelectedTradeTab("all");
              setFilters((prev) => ({ ...prev, categoryId: "all" }));
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="apps"
              size={14}
              color={selectedTradeTab === "all" ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.categoryPillText,
                selectedTradeTab === "all" && styles.categoryPillTextActive,
              ]}
            >
              All Trades
            </Text>
          </TouchableOpacity>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat.slug || cat.name);
            const isSelected = selectedTradeTab === cat._id;

            return (
              <TouchableOpacity
                key={cat._id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => {
                  setSelectedTradeTab(cat._id);
                  setFilters((prev) => ({ ...prev, categoryId: cat._id }));
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={meta.icon}
                  size={14}
                  color={isSelected ? Colors.white : meta.color}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filter Chips Bar (shown when extra filters are applied) */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsScroll}
          >
            <View style={styles.filterIndicatorPill}>
              <Ionicons name="funnel" size={12} color={Colors.primary} />
              <Text style={styles.filterIndicatorText}>
                {activeFilterCount} Active Filters
              </Text>
            </View>

            {filters.pricingModel !== "all" && (
              <View style={styles.filterChipPill}>
                <Text style={styles.filterChipPillText}>
                  Model: {filters.pricingModel}
                </Text>
              </View>
            )}

            {filters.priceRange !== "all" && (
              <View style={styles.filterChipPill}>
                <Text style={styles.filterChipPillText}>
                  {filters.priceRange === "under300"
                    ? "< ₹300"
                    : filters.priceRange === "300to600"
                    ? "₹300 - ₹600"
                    : "> ₹600"}
                </Text>
              </View>
            )}

            {filters.sortBy !== "popular" && (
              <View style={styles.filterChipPill}>
                <Text style={styles.filterChipPillText}>
                  {filters.sortBy === "price_asc" ? "Price: Low to High" : "Price: High to Low"}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={resetFilters} style={styles.clearFiltersBtn}>
              <Text style={styles.clearFiltersText}>Reset All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Main Full-Width Services List */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading verified service catalog...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Summary */}
          <View style={styles.catalogSummaryRow}>
            <Text style={styles.catalogCountText}>
              Showing {displayedServices.length} Verified Services
            </Text>
            <View style={styles.warrantyBadgeMini}>
              <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
              <Text style={styles.warrantyBadgeMiniText}>30d Warranty</Text>
            </View>
          </View>

          {/* Service Cards */}
          {displayedServices.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={44} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching services found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or reset the applied filters.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearch("");
                  resetFilters();
                }}
              >
                <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            displayedServices.map((item) => {
              const meta = getCategoryMeta(item.category?.slug || item.category?.name);
              const isHourly = item.pricingModel === "hourly";
              const isVisit = item.pricingModel === "visit";
              const priceLabel = item.basePrice ? `₹${item.basePrice}` : "Diagnostic Visit";
              const modelLabel = isHourly
                ? "Per Hour"
                : isVisit
                ? "Inspection & Quote"
                : "Fixed Base Rate";

              return (
                <View key={item._id} style={styles.serviceCard}>
                  {/* Category Pill Tag */}
                  <View style={styles.cardTopRow}>
                    <View style={[styles.categoryTagPill, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={13} color={meta.color} />
                      <Text style={[styles.categoryTagText, { color: meta.color }]}>
                        {item.category?.name || "General Service"}
                      </Text>
                    </View>
                    <View style={styles.etaPill}>
                      <Ionicons name="flash" size={11} color={Colors.primary} />
                      <Text style={styles.etaPillText}>45m ETA</Text>
                    </View>
                  </View>

                  {/* Task Name */}
                  <Text style={styles.serviceTitle}>{item.name}</Text>

                  {/* Highlights / Guarantee */}
                  <View style={styles.perksRow}>
                    <View style={styles.perkItem}>
                      <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                      <Text style={styles.perkText}>Police & KYC Verified Pro</Text>
                    </View>
                    <View style={styles.perkItem}>
                      <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
                      <Text style={styles.perkText}>Genuine Replacement Parts</Text>
                    </View>
                  </View>

                  {/* Price & CTA Action */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.priceMeta}>
                      <Text style={styles.priceText}>{priceLabel}</Text>
                      <Text style={styles.modelText}>{modelLabel}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() =>
                        navigation.navigate("CreateJob", {
                          preselectedCategory: item.category.name,
                          preselectedSubcategoryId: item._id,
                          preselectedSubcategoryName: item.name,
                        })
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.bookButtonText}>Book Service</Text>
                      <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Filter Side Popup Modal */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerOverlay}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdropTouch, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={closeDrawer}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Drawer Panel */}
          <Animated.View
            style={[
              styles.drawerPanel,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTitleRow}>
                <Ionicons name="options" size={20} color={Colors.primary} />
                <Text style={styles.drawerTitle}>Filter Services</Text>
              </View>
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.drawerCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Filter Controls Scroll */}
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Category Selection in Modal */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Trade Category</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      tempFilters.categoryId === "all" && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setTempFilters((prev) => ({ ...prev, categoryId: "all" }))
                    }
                  >
                    <Ionicons
                      name="apps"
                      size={13}
                      color={
                        tempFilters.categoryId === "all"
                          ? Colors.primary
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        tempFilters.categoryId === "all" && styles.filterChipTextActive,
                      ]}
                    >
                      All Trades
                    </Text>
                  </TouchableOpacity>

                  {categories.map((cat) => {
                    const meta = getCategoryMeta(cat.slug || cat.name);
                    const isSelected = tempFilters.categoryId === cat._id;
                    return (
                      <TouchableOpacity
                        key={cat._id}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            categoryId: cat._id,
                          }))
                        }
                      >
                        <Ionicons
                          name={meta.icon}
                          size={13}
                          color={isSelected ? Colors.primary : meta.color}
                        />
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Sort By */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.chipRow}>
                  {[
                    { key: "popular", label: "Recommended" },
                    { key: "price_asc", label: "Price: Low to High" },
                    { key: "price_desc", label: "Price: High to Low" },
                  ].map((item) => {
                    const isSelected = tempFilters.sortBy === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            sortBy: item.key as SortByFilter,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Budget / Price</Text>
                <View style={styles.chipRow}>
                  {[
                    { key: "all", label: "All Prices" },
                    { key: "under300", label: "Under ₹300" },
                    { key: "300to600", label: "₹300 - ₹600" },
                    { key: "above600", label: "Above ₹600" },
                  ].map((item) => {
                    const isSelected = tempFilters.priceRange === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            priceRange: item.key as PriceRangeFilter,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. Pricing Model */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Pricing Model</Text>
                <View style={styles.chipRow}>
                  {[
                    { key: "all", label: "All Models" },
                    { key: "fixed", label: "Fixed Base" },
                    { key: "hourly", label: "Hourly Rate" },
                    { key: "visit", label: "Inspection Visit" },
                  ].map((item) => {
                    const isSelected = tempFilters.pricingModel === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.filterChip,
                          isSelected && styles.filterChipActive,
                        ]}
                        onPress={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            pricingModel: item.key as PricingModelFilter,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isSelected && styles.filterChipTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 5. Perks & Guarantees */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Perks & Guarantees</Text>
                <TouchableOpacity
                  style={[
                    styles.togglePillRow,
                    tempFilters.fastEtaOnly && styles.togglePillRowActive,
                  ]}
                  onPress={() =>
                    setTempFilters((prev) => ({
                      ...prev,
                      fastEtaOnly: !prev.fastEtaOnly,
                    }))
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.togglePillLeft}>
                    <Ionicons
                      name="flash"
                      size={16}
                      color={tempFilters.fastEtaOnly ? Colors.primary : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.togglePillText,
                        tempFilters.fastEtaOnly && styles.togglePillTextActive,
                      ]}
                    >
                      Urgent 45-Min Dispatch Only
                    </Text>
                  </View>
                  <Ionicons
                    name={tempFilters.fastEtaOnly ? "checkbox" : "square-outline"}
                    size={20}
                    color={tempFilters.fastEtaOnly ? Colors.primary : Colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.togglePillRow,
                    tempFilters.warrantyOnly && styles.togglePillRowActive,
                    { marginTop: Spacing.sm },
                  ]}
                  onPress={() =>
                    setTempFilters((prev) => ({
                      ...prev,
                      warrantyOnly: !prev.warrantyOnly,
                    }))
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.togglePillLeft}>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={tempFilters.warrantyOnly ? "#16A34A" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.togglePillText,
                        tempFilters.warrantyOnly && styles.togglePillTextActive,
                      ]}
                    >
                      30-Day Parts Warranty Included
                    </Text>
                  </View>
                  <Ionicons
                    name={tempFilters.warrantyOnly ? "checkbox" : "square-outline"}
                    size={20}
                    color={tempFilters.warrantyOnly ? "#16A34A" : Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                onPress={() => setTempFilters(DEFAULT_FILTERS)}
                style={styles.drawerResetBtn}
              >
                <Text style={styles.drawerResetText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyFilters}
                style={styles.drawerApplyBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.drawerApplyText}>Apply Filters</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
  },
  clearBtn: {
    padding: 2,
  },
  filterTriggerBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  filterTriggerBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  filterCountText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.white,
  },
  categoryBarWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 8,
  },
  categoryBarScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 5,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: Colors.white,
  },
  activeFiltersBar: {
    backgroundColor: "#EFF6FF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(4, 86, 211, 0.15)",
    paddingVertical: 6,
  },
  activeChipsScroll: {
    paddingHorizontal: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs + 2,
  },
  filterIndicatorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 4,
  },
  filterIndicatorText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  filterChipPill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: "rgba(4, 86, 211, 0.2)",
  },
  filterChipPillText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: Colors.primary,
  },
  clearFiltersBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  clearFiltersText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.error,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  catalogSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.xs,
  },
  catalogCountText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  warrantyBadgeMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  warrantyBadgeMiniText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#001E68",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 3px 10px rgba(0, 30, 104, 0.06)",
      } as any,
    }),
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryTagPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  categoryTagText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "700",
  },
  etaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  etaPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  serviceTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  perksRow: {
    flexDirection: "column",
    gap: 4,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  perkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  perkText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceMeta: {
    flexDirection: "column",
  },
  priceText: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.primary,
  },
  modelText: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: "600",
    marginTop: 1,
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  bookButtonText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  resetBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 9,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
  },
  resetBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },

  // Drawer Side Popup Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 30, 104, 0.45)",
  },
  drawerPanel: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    ...Shadows.lg,
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  drawerHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drawerTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  filterSection: {
    gap: Spacing.xs + 2,
  },
  filterSectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs + 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "transparent",
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: "800",
  },
  togglePillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  togglePillRowActive: {
    backgroundColor: "#EFF6FF",
    borderColor: Colors.primary,
  },
  togglePillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  togglePillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  togglePillTextActive: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  drawerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: "#FFFFFF",
    gap: Spacing.md,
  },
  drawerResetBtn: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  drawerResetText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  drawerApplyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    gap: 6,
  },
  drawerApplyText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.white,
  },
});

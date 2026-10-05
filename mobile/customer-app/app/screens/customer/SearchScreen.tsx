import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Modal,
  TouchableOpacity,
  Switch,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useWorkers, useCategories } from "../../../hooks/use-api";
import {
  AppHeader,
  SearchBar,
  FilterChip,
  WorkerCard,
  SkeletonCard,
  EmptyState,
  PrimaryButton,
  OutlineButton,
} from "../../../components/ui";

interface SearchScreenProps {
  navigation: any;
  route?: any;
}

export default function CustomerSearchScreen({ navigation, route }: SearchScreenProps) {
  const initialCategory = route?.params?.category || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyOnline, setOnlyOnline] = useState<boolean>(false);

  const { data: catData } = useCategories();
  const categories = catData?.data ?? [];

  const {
    data: workerData,
    isLoading,
    refetch,
  } = useWorkers({
    search: searchQuery.trim() || undefined,
    skill: selectedCategory === "All" ? undefined : selectedCategory,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const workers = workerData?.data ?? [];

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      if (onlyOnline && !worker.isOnline) return false;
      if (minRating > 0 && (worker.rating || 0) < minRating) return false;
      return true;
    });
  }, [workers, onlyOnline, minRating]);

  const activeFiltersCount = (onlyOnline ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const clearFilters = () => {
    setMinRating(0);
    setOnlyOnline(false);
    setFilterModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Find Professionals"
        subtitle="Verified trades specialists in your city"
        showBack={navigation.canGoBack()}
      />

      <View style={styles.container}>
        {/* Search Bar + Filter Trigger */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, skill, or trade..."
            showFilter
            onFilterPress={() => setFilterModalVisible(true)}
          />
        </View>

        {/* Categories Chip Carousel */}
        <View style={styles.categoryScrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <FilterChip
              label="All Trades"
              selected={selectedCategory === "All"}
              onPress={() => setSelectedCategory("All")}
            />
            {categories.map((c) => (
              <FilterChip
                key={c._id}
                label={c.name}
                selected={selectedCategory === c.name}
                onPress={() => setSelectedCategory(c.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Worker Results List */}
        {isLoading ? (
          <View style={styles.listContainer}>
            <SkeletonCard height={96} />
            <SkeletonCard height={96} />
            <SkeletonCard height={96} />
          </View>
        ) : (
          <FlatList
            data={filteredWorkers}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="construct-outline"
                title="No Professionals Found"
                description={
                  searchQuery
                    ? `No matching verified trades found for "${searchQuery}".`
                    : "No workers match your selected filters. Try broadening your search."
                }
                actionTitle={activeFiltersCount > 0 ? "Clear Filters" : "Post a Work Request"}
                onActionPress={
                  activeFiltersCount > 0
                    ? clearFilters
                    : () => navigation.navigate("CreateJob")
                }
              />
            }
            renderItem={({ item }) => (
              <WorkerCard
                worker={item}
                onPress={() =>
                  navigation.navigate("WorkerDetail", { workerId: item._id })
                }
              />
            )}
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Professionals</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.filterLabel}>Online & Ready Now</Text>
                  <Text style={styles.filterSub}>Show only active technicians</Text>
                </View>
                <Switch
                  value={onlyOnline}
                  onValueChange={setOnlyOnline}
                  trackColor={{ false: Colors.border, true: Colors.primaryMuted }}
                  thumbColor={onlyOnline ? Colors.primary : Colors.surface}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingChipsRow}>
                {[0, 3.5, 4.0, 4.5].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.ratingChip,
                      minRating === val && styles.ratingChipActive,
                    ]}
                    onPress={() => setMinRating(val)}
                  >
                    <Ionicons
                      name="star"
                      size={14}
                      color={minRating === val ? Colors.white : Colors.accent}
                    />
                    <Text
                      style={[
                        styles.ratingChipText,
                        minRating === val && styles.ratingChipTextActive,
                      ]}
                    >
                      {val === 0 ? "Any" : `${val}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <OutlineButton
                title="Reset"
                onPress={clearFilters}
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <PrimaryButton
                title="Apply Filters"
                onPress={() => setFilterModalVisible(false)}
                style={{ flex: 2 }}
              />
            </View>
          </View>
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
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  categoryScrollWrap: {
    marginVertical: Spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  listContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  filterSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingChipsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  ratingChipTextActive: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
});

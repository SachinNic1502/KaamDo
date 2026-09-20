import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants";
import { useWorkers } from "../../hooks/use-api";

const POPULAR_SEARCHES = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "AC Repair",
  "Cleaning",
];

const CATEGORIES = [
  "All",
  "Home Repair",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Painting",
];

const PRICE_RANGES = ["Any", "Low", "Medium", "High"];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Any");
  const [minRating, setMinRating] = useState(0);

  const { data, isLoading } = useWorkers({
    search: searchQuery,
    skill: selectedCategory === "All" ? undefined : selectedCategory,
  });

  const rawWorkers = data?.data || [];

  const mappedWorkers = rawWorkers.map((w) => ({
    id: w.userId._id || "",
    name: w.userId.name || "Unknown",
    skill: w.skills?.[0] || "General",
    rating: w.rating || 0,
    reviews: 0,
    price: w.hourlyRate || 0,
    priceUnit: "hr",
    available: w.isOnline || false,
  }));

  const filteredResults = mappedWorkers.filter((worker) => {
    const matchesSearch =
      searchQuery === "" ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = worker.rating >= minRating;
    const matchesPrice =
      selectedPriceRange === "Any" ||
      (selectedPriceRange === "Low" && worker.price <= 400) ||
      (selectedPriceRange === "Medium" &&
        worker.price > 400 &&
        worker.price <= 600) ||
      (selectedPriceRange === "High" && worker.price > 600);
    return matchesSearch && matchesRating && matchesPrice;
  });

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.floor(rating) ? "star" : "star-outline"}
            size={14}
            color={Colors.warning || "#FFC107"}
          />
        ))}
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background || "#F5F7FA" }}>
        <ActivityIndicator size="large" color={Colors.primary || "#4A90D9"} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Services</Text>
        <Text style={styles.subtitle}>Search for skilled workers near you</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textSecondary || "#666"}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, workers..."
            placeholderTextColor={Colors.textSecondary || "#999"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary || "#999"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Searches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {POPULAR_SEARCHES.map((search) => (
            <TouchableOpacity
              key={search}
              style={[
                styles.chip,
                searchQuery.toLowerCase() === search.toLowerCase() &&
                  styles.chipActive,
              ]}
              onPress={() => setSearchQuery(search)}
            >
              <Text
                style={[
                  styles.chipText,
                  searchQuery.toLowerCase() === search.toLowerCase() &&
                    styles.chipTextActive,
                ]}
              >
                {search}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                selectedCategory === category && styles.chipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === category && styles.chipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Range</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {PRICE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.chip,
                selectedPriceRange === range && styles.chipActive,
              ]}
              onPress={() => setSelectedPriceRange(range)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedPriceRange === range && styles.chipTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minimum Rating</Text>
        <View style={styles.ratingFilter}>
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingChip,
                minRating === rating && styles.ratingChipActive,
              ]}
              onPress={() => setMinRating(rating)}
            >
              <Text
                style={[
                  styles.ratingChipText,
                  minRating === rating && styles.ratingChipTextActive,
                ]}
              >
                {rating === 0 ? "Any" : `${rating}+`}
              </Text>
              {rating > 0 && (
                <Ionicons
                  name="star"
                  size={12}
                  color={
                    minRating === rating
                      ? "#FFF"
                      : Colors.warning || "#FFC107"
                  }
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Results</Text>
        <Text style={styles.resultsCount}>{filteredResults.length} found</Text>
      </View>

      {filteredResults.map((worker) => (
        <TouchableOpacity key={worker.id} style={styles.resultCard} activeOpacity={0.7}>
          <View style={styles.resultCardHeader}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={24}
                color={Colors.primary || "#4A90D9"}
              />
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <Text style={styles.workerSkill}>{worker.skill}</Text>
              {renderStars(worker.rating)}
              <Text style={styles.reviewsText}>
                {worker.reviews} reviews
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{worker.price}</Text>
              <Text style={styles.priceUnit}>/{worker.priceUnit}</Text>
            </View>
          </View>
          <View style={styles.resultCardFooter}>
            <View
              style={[
                styles.availabilityBadge,
                worker.available
                  ? styles.availableBadge
                  : styles.unavailableBadge,
              ]}
            >
              <View
                style={[
                  styles.availabilityDot,
                  worker.available
                    ? styles.availableDot
                    : styles.unavailableDot,
                ]}
              />
              <Text
                style={[
                  styles.availabilityText,
                  worker.available
                    ? styles.availableText
                    : styles.unavailableText,
                ]}
              >
                {worker.available ? "Available Now" : "Busy"}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {filteredResults.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons
            name="search-outline"
            size={48}
            color={Colors.textSecondary || "#CCC"}
          />
          <Text style={styles.emptyStateTitle}>No results found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your filters or search query
          </Text>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#F5F7FA",
  },
  header: {
    paddingHorizontal: Spacing.lg || 20,
    paddingTop: Spacing.xl || 40,
    paddingBottom: Spacing.md || 16,
  },
  title: {
    fontSize: FontSize.xl || 28,
    fontWeight: "700",
    color: Colors.text || "#1A1A2E",
  },
  subtitle: {
    fontSize: FontSize.sm || 14,
    color: Colors.textSecondary || "#666",
    marginTop: Spacing.xs || 4,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg || 20,
    marginBottom: Spacing.md || 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card || "#FFF",
    borderRadius: 12,
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.sm || 12,
    borderWidth: 1,
    borderColor: Colors.border || "#E8ECF0",
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm || 8,
    fontSize: FontSize.md || 16,
    color: Colors.text || "#1A1A2E",
  },
  section: {
    marginBottom: Spacing.md || 16,
  },
  sectionTitle: {
    fontSize: FontSize.sm || 14,
    fontWeight: "600",
    color: Colors.text || "#1A1A2E",
    paddingHorizontal: Spacing.lg || 20,
    marginBottom: Spacing.sm || 8,
  },
  chipsContainer: {
    paddingHorizontal: Spacing.lg || 20,
    gap: Spacing.sm || 8,
  },
  chip: {
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.sm || 8,
    borderRadius: 20,
    backgroundColor: Colors.card || "#FFF",
    borderWidth: 1,
    borderColor: Colors.border || "#E8ECF0",
  },
  chipActive: {
    backgroundColor: Colors.primary || "#4A90D9",
    borderColor: Colors.primary || "#4A90D9",
  },
  chipText: {
    fontSize: FontSize.sm || 14,
    color: Colors.text || "#1A1A2E",
  },
  chipTextActive: {
    color: "#FFF",
  },
  ratingFilter: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg || 20,
    gap: Spacing.sm || 8,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.sm || 8,
    borderRadius: 20,
    backgroundColor: Colors.card || "#FFF",
    borderWidth: 1,
    borderColor: Colors.border || "#E8ECF0",
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: Colors.primary || "#4A90D9",
    borderColor: Colors.primary || "#4A90D9",
  },
  ratingChipText: {
    fontSize: FontSize.sm || 14,
    color: Colors.text || "#1A1A2E",
  },
  ratingChipTextActive: {
    color: "#FFF",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg || 20,
    marginTop: Spacing.sm || 8,
    marginBottom: Spacing.md || 16,
  },
  resultsTitle: {
    fontSize: FontSize.lg || 20,
    fontWeight: "700",
    color: Colors.text || "#1A1A2E",
  },
  resultsCount: {
    fontSize: FontSize.sm || 14,
    color: Colors.textSecondary || "#666",
  },
  resultCard: {
    marginHorizontal: Spacing.lg || 20,
    marginBottom: Spacing.md || 16,
    backgroundColor: Colors.card || "#FFF",
    borderRadius: 16,
    padding: Spacing.md || 16,
    borderWidth: 1,
    borderColor: Colors.border || "#E8ECF0",
  },
  resultCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight || "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
  },
  workerInfo: {
    flex: 1,
    marginLeft: Spacing.md || 12,
  },
  workerName: {
    fontSize: FontSize.md || 16,
    fontWeight: "600",
    color: Colors.text || "#1A1A2E",
  },
  workerSkill: {
    fontSize: FontSize.sm || 14,
    color: Colors.textSecondary || "#666",
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs || 4,
    gap: 2,
  },
  ratingText: {
    fontSize: FontSize.xs || 12,
    color: Colors.textSecondary || "#666",
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: FontSize.xs || 12,
    color: Colors.textSecondary || "#999",
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: FontSize.lg || 20,
    fontWeight: "700",
    color: Colors.primary || "#4A90D9",
  },
  priceUnit: {
    fontSize: FontSize.xs || 12,
    color: Colors.textSecondary || "#666",
  },
  resultCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md || 12,
    paddingTop: Spacing.md || 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border || "#F0F0F0",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm || 8,
    paddingVertical: Spacing.xs || 4,
    borderRadius: 12,
    gap: 6,
  },
  availableBadge: {
    backgroundColor: "#E8F5E9",
  },
  unavailableBadge: {
    backgroundColor: "#FFF3E0",
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availableDot: {
    backgroundColor: "#4CAF50",
  },
  unavailableDot: {
    backgroundColor: "#FF9800",
  },
  availabilityText: {
    fontSize: FontSize.xs || 12,
    fontWeight: "500",
  },
  availableText: {
    color: "#2E7D32",
  },
  unavailableText: {
    color: "#E65100",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary || "#4A90D9",
    paddingHorizontal: Spacing.md || 16,
    paddingVertical: Spacing.sm || 8,
    borderRadius: 8,
    gap: Spacing.xs || 4,
  },
  bookButtonText: {
    fontSize: FontSize.sm || 14,
    fontWeight: "600",
    color: "#FFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl || 40,
    paddingHorizontal: Spacing.lg || 20,
  },
  emptyStateTitle: {
    fontSize: FontSize.lg || 18,
    fontWeight: "600",
    color: Colors.text || "#1A1A2E",
    marginTop: Spacing.md || 16,
  },
  emptyStateText: {
    fontSize: FontSize.sm || 14,
    color: Colors.textSecondary || "#666",
    marginTop: Spacing.xs || 4,
    textAlign: "center",
  },
  bottomSpacer: {
    height: Spacing.xl || 40,
  },
});

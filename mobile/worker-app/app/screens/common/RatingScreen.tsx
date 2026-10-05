import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { submitRating } from "../../../services/rating";
import { AppHeader, PrimaryButton, Card, useToast } from "../../../components/ui";

const FEEDBACK_TAGS = [
  "Accurate Job Description",
  "Punctual / Ready",
  "Safe Working Space",
  "Helpful Coordination",
  "Prompt Payment Release",
];

export default function WorkerRatingScreen({ route, navigation }: any) {
  const { jobId, customerName, serviceName } = route.params || {};
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Select Stars", "Please select a star rating for this job.");
      return;
    }
    setLoading(true);
    try {
      const combinedFeedback = [
        ...selectedTags,
        comment.trim() ? comment.trim() : null,
      ]
        .filter(Boolean)
        .join(". ");

      await submitRating({
        jobId,
        rating,
        comment: combinedFeedback || undefined,
      });
      toast.success("Review Submitted", "Thank you for rating your client interaction!");
      setTimeout(() => navigation.goBack(), 600);
    } catch (err: any) {
      toast.error("Submission Failed", err.message || "Could not submit client review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Rate Client Experience"
        subtitle={serviceName || "Service Feedback"}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>Verified Customer Feedback</Text>
            </View>
          </View>

          <Text style={styles.title}>How was your experience with {customerName || "the Client"}?</Text>
          <Text style={styles.subtitle}>
            Your rating helps build trust and safeguards technicians across the KaamDo partner network.
          </Text>

          {/* Star Rating Selector */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starTouch}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={36}
                  color={star <= rating ? Colors.accent : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingText}>
            {rating === 5
              ? "Outstanding Client (5/5)"
              : rating === 4
              ? "Great Experience (4/5)"
              : rating === 3
              ? "Satisfactory / Minor Delays (3/5)"
              : "Difficult Workspace / Scope Issues"}
          </Text>

          {/* Quick Compliments / Feedback Tags */}
          <Text style={styles.sectionLabel}>Highlights</Text>
          <View style={styles.tagsContainer}>
            {FEEDBACK_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={active ? "checkmark" : "add"}
                    size={14}
                    color={active ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Comment Field */}
          <Text style={styles.sectionLabel}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share details regarding workspace readiness, electrical supply, access permissions..."
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <PrimaryButton
            title="Submit Client Review"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 115,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  badgeRow: {
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  starTouch: {
    padding: Spacing.xs,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.md,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tagTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  textArea: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 90,
  },
});

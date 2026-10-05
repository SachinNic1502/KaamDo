import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { submitRating } from "../../../services/rating";
import { AppHeader, PrimaryButton, Card, useToast } from "../../../components/ui";

export default function CustomerRatingScreen({ route, navigation }: any) {
  const { jobId, workerName } = route.params || {};
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Select Stars", "Please select a star rating.");
      return;
    }
    setLoading(true);
    try {
      await submitRating({
        jobId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Review Submitted", "Thank you for rating your service experience!");
      setTimeout(() => navigation.goBack(), 600);
    } catch (err: any) {
      toast.error("Submission Failed", err.message || "Could not submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Rate Service" showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>How was your technician?</Text>
          <Text style={styles.subtitle}>
            Your rating for {workerName || "your assigned technician"} helps maintain high trade standards.
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
                  size={38}
                  color={star <= rating ? Colors.accent : Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 5
              ? "Outstanding Work (5/5)"
              : rating === 4
              ? "Good Experience (4/5)"
              : rating === 3
              ? "Average (3/5)"
              : "Needs Improvement"}
          </Text>

          {/* Comment Field */}
          <Text style={styles.inputLabel}>Comments or Feedback (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about the technician's punctuality, skill, and cleanliness..."
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          <PrimaryButton
            title="Submit Review"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: Spacing.xl }}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.base,
    justifyContent: "center",
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
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
    marginTop: 4,
    marginBottom: Spacing.xl,
    lineHeight: 16,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  starTouch: {
    padding: 4,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.accent,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    minHeight: 90,
    textAlignVertical: "top",
  },
});

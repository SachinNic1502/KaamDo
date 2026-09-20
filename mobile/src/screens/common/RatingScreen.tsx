import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants";
import { submitRating } from "../../services/rating";

export default function RatingScreen({ route, navigation }: any) {
  const { jobId, workerId, workerName } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await submitRating({ jobId, workerId, rating, review: review.trim() || undefined });
      Alert.alert("Thank You", "Your rating has been submitted.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={48}
            color={star <= rating ? Colors.warning : Colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const getRatingLabel = () => {
    if (rating === 0) return "Tap a star to rate";
    if (rating <= 2) return "Poor";
    if (rating === 3) return "Average";
    if (rating === 4) return "Good";
    return "Excellent";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>How was your experience with {workerName}?</Text>

        {renderStars()}
        <Text style={styles.ratingLabel}>{getRatingLabel()}</Text>

        <Text style={styles.reviewLabel}>Write a review (optional)</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="Share your experience..."
          placeholderTextColor={Colors.textMuted}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "Submitting..." : "Submit Rating"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: FontSize.title, fontWeight: "700", color: Colors.text, textAlign: "center" },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: "center", marginTop: Spacing.sm, marginBottom: Spacing.xl },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: Spacing.md },
  starButton: { padding: Spacing.xs },
  ratingLabel: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.primary, textAlign: "center", marginTop: Spacing.md, marginBottom: Spacing.xl },
  reviewLabel: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.sm },
  reviewInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, backgroundColor: Colors.surface, height: 120, marginBottom: Spacing.xl },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: 12, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: "600" },
  skipBtn: { alignItems: "center", paddingVertical: Spacing.md, marginTop: Spacing.md },
  skipBtnText: { color: Colors.textSecondary, fontSize: FontSize.md },
});

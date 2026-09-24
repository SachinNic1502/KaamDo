import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors, Spacing, FontSize } from "../../constants";
import { raiseDispute } from "../../services/dispute";
import { pickAndUploadImage } from "../../services/upload";

const REASONS = [
  "Poor quality work",
  "Worker was late",
  "Extra charges not agreed",
  "Worker didn't complete work",
  "Damage to property",
  "Other",
];

export default function DisputeScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddPhoto = async () => {
    const uri = await pickAndUploadImage();
    if (uri) setImages((prev) => [...prev, uri]);
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reason) {
      Alert.alert("Error", "Please select a reason");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please describe the issue");
      return;
    }
    setSubmitting(true);
    try {
      await raiseDispute({ jobId, reason, description: description.trim(), images });
      Alert.alert("Dispute Raised", "We will review your case within 24 hours.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to raise dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Raise a Dispute</Text>
        <Text style={styles.subtitle}>Tell us what went wrong</Text>

        <Text style={styles.label}>Reason *</Text>
        <View style={styles.reasonGrid}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
              onPress={() => setReason(r)}
            >
              <Text style={[styles.reasonText, reason === r && styles.reasonTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Description *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { marginTop: Spacing.lg }]}>Images (optional)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={handleAddPhoto}>
          <Ionicons name="camera-outline" size={24} color={Colors.primary} />
          <Text style={styles.photoBtnText}>Add Photo</Text>
        </TouchableOpacity>
        {images.length > 0 && (
          <View style={styles.photoGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemovePhoto(index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? "Submitting..." : "Submit Dispute"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  title: { fontSize: FontSize.title, fontWeight: "700", color: Colors.text },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.sm },
  reasonGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  reasonChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  reasonChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + "10" },
  reasonText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reasonTextActive: { color: Colors.primary, fontWeight: "600" },
  textArea: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, backgroundColor: Colors.surface, height: 120 },
  photoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed", borderRadius: 12, padding: Spacing.lg },
  photoBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: "500" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  photoContainer: { position: "relative" },
  photo: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: { position: "absolute", top: -6, right: -6 },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: 12, alignItems: "center", marginTop: Spacing.xl, marginBottom: Spacing.xxl },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: "600" },
});

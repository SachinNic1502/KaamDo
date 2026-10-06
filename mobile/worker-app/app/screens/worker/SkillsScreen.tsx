import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Input, PrimaryButton } from "../../../components/ui";
import { useAppDispatch, useAppSelector } from "../../../store";
import { updateProfile } from "../../../store/authSlice";
import { useCategories } from "../../../hooks/use-api";
import { api } from "../../../services/api";
import { locationService } from "../../../services/location";

export const SkillsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { workerProfile } = useAppSelector((s) => s.auth);
  const { data: categories = [] } = useCategories();

  const [skills, setSkills] = useState<string[]>(
    workerProfile?.skills || []
  );
  const [hourlyRate, setHourlyRate] = useState(
    workerProfile?.hourlyRate ? workerProfile.hourlyRate.toString() : ""
  );
  const [dailyRate, setDailyRate] = useState(
    workerProfile?.dailyRate ? workerProfile.dailyRate.toString() : ""
  );
  const [experience, setExperience] = useState(
    workerProfile?.experience ? workerProfile.experience.toString() : ""
  );
  const [serviceArea, setServiceArea] = useState(
    workerProfile?.serviceAreas?.[0] || ""
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(
    workerProfile?.serviceRadiusKm || 15
  );
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchSavedLocation = async () => {
      try {
        const loc = await locationService.getWorkerLocation();
        if (isMounted && loc) {
          if (loc.serviceRadiusKm) setServiceRadiusKm(loc.serviceRadiusKm);
          if (loc.address || loc.city) {
            setServiceArea(loc.address || loc.city || "");
          }
        }
      } catch {
        // Fallback to existing profile
      }
    };
    fetchSavedLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDetectGPS = async () => {
    setIsDetectingGps(true);
    try {
      const pos = await locationService.getCurrentPosition();
      if (!pos) {
        Alert.alert(
          "Permission Required",
          "Please grant GPS location permission to calibrate your service territory."
        );
        return;
      }
      const geo = await locationService.reverseGeocode(pos.latitude, pos.longitude);
      setServiceArea(geo.address || `${geo.city}, ${geo.state}`);
      Alert.alert(
        "Location Detected",
        `Base location updated to: ${geo.address || geo.city}`
      );
    } catch (err: any) {
      Alert.alert("GPS Error", err.message || "Failed to retrieve device location.");
    } finally {
      setIsDetectingGps(false);
    }
  };

  const availableSkills = categories.map((c) => c.name);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      if (skills.length === 1) {
        Alert.alert("At Least One Skill", "You must have at least one trade skill active.");
        return;
      }
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleSave = async () => {
    const hr = parseFloat(hourlyRate);
    const dr = parseFloat(dailyRate);
    const exp = parseInt(experience, 10);

    if (isNaN(hr) || hr <= 0) {
      Alert.alert("Invalid Rate", "Please enter a valid hourly rate.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        skills,
        hourlyRate: hr,
        dailyRate: isNaN(dr) ? undefined : dr,
        experience: isNaN(exp) ? 1 : exp,
        serviceAreas: [serviceArea.trim()],
        serviceRadiusKm,
      };

      await api.patch("/api/workers/me", payload);
      dispatch(updateProfile(payload));

      // Also sync to location API if GPS position can be determined
      try {
        const pos = await locationService.getCurrentPosition();
        if (pos) {
          await locationService.updateLocationAndRadius({
            latitude: pos.latitude,
            longitude: pos.longitude,
            serviceRadiusKm,
            address: serviceArea.trim(),
          });
        }
      } catch {
        // Soft fallback
      }

      Alert.alert("Saved!", "Your trade skills, service radius, and pricing have been updated.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills & Pricing Setup</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Active Trade Capabilities</Text>
          <Text style={styles.subText}>
            Select the services you are certified and experienced to perform. Customer jobs matching these trades will be broadcasted to you.
          </Text>

          <View style={styles.chipsContainer}>
            {availableSkills.length === 0 ? (
              <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, paddingVertical: 8 }}>
                Loading available trade categories...
              </Text>
            ) : (
              availableSkills.map((s) => {
                const active = skills.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.skillChip, active && styles.skillChipActive]}
                    onPress={() => toggleSkill(s)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={active ? "checkmark-circle" : "add-circle-outline"}
                      size={16}
                      color={active ? Colors.white : Colors.textSecondary}
                    />
                    <Text
                      style={[styles.skillChipText, active && styles.skillChipTextActive]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Pricing & Experience</Text>

          <Input
            label="Hourly Rate (₹/hr)"
            placeholder="Hourly service rate (₹)"
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            leftIcon="time-outline"
          />

          <Input
            label="Full Day Rate (₹/day - Optional)"
            placeholder="Full-day rate (₹)"
            value={dailyRate}
            onChangeText={setDailyRate}
            keyboardType="numeric"
            leftIcon="calendar-outline"
          />

          <Input
            label="Years of Experience"
            placeholder="Years of professional experience"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            leftIcon="ribbon-outline"
          />

          {/* Service Territory & Radius Setup */}
          <View style={styles.radiusSection}>
            <View style={styles.radiusHeaderRow}>
              <Text style={styles.radiusFieldTitle}>Base Location & Dispatch Radius</Text>
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={handleDetectGPS}
                disabled={isDetectingGps}
                activeOpacity={0.7}
              >
                <Ionicons name="navigate" size={13} color={Colors.primary} />
                <Text style={styles.gpsButtonText}>
                  {isDetectingGps ? "Locating..." : "Use Current GPS"}
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Primary Service Base / Locality"
              placeholder="e.g. Indiranagar, Bengaluru"
              value={serviceArea}
              onChangeText={setServiceArea}
              leftIcon="location-outline"
            />

            <View style={styles.radiusChooser}>
              <View style={styles.radiusLabelRow}>
                <Text style={styles.radiusLabelText}>Service Broadcast Radius:</Text>
                <Text style={styles.radiusValueText}>{serviceRadiusKm} km</Text>
              </View>

              <View style={styles.radiusChipsRow}>
                {[5, 10, 15, 25, 50].map((km) => {
                  const isSelected = serviceRadiusKm === km;
                  return (
                    <TouchableOpacity
                      key={km}
                      style={[
                        styles.radiusChipItem,
                        isSelected && styles.radiusChipItemSelected,
                      ]}
                      onPress={() => setServiceRadiusKm(km)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.radiusChipItemText,
                          isSelected && styles.radiusChipItemTextSelected,
                        ]}
                      >
                        {km} km
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.radiusNoteBox}>
                <Ionicons name="radio" size={13} color={Colors.accent} />
                <Text style={styles.radiusNoteText}>
                  Customers within {serviceRadiusKm} km of this base will receive your broadcast availability.
                </Text>
              </View>
            </View>
          </View>

          <PrimaryButton
            title={isSaving ? "Saving Changes..." : "Save Skills & Rates"}
            onPress={handleSave}
            loading={isSaving}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 115,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  sectionHeading: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skillChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  skillChipText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  skillChipTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  radiusSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  radiusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  radiusFieldTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  radiusChooser: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  radiusLabelText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  radiusValueText: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.primary,
  },
  radiusChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
  },
  radiusChipItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusChipItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusChipItemText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  radiusChipItemTextSelected: {
    color: Colors.white,
    fontWeight: "800",
  },
  radiusNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.xs,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  radiusNoteText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});


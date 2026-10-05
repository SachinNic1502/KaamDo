import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../../utils/constants";
import { RootState, AppDispatch } from "../../../store";
import { setUser } from "../../../store/authSlice";
import { userService } from "../../../services/users";
import { AppHeader, Avatar, Button, Card, useToast } from "../../../components/ui";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
];

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const user = useSelector((state: RootState) => state.auth.user);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required", "Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      const res = await userService.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        avatar: avatar || undefined,
      });

      if (res.data) {
        dispatch(setUser(res.data));
      } else if (user) {
        dispatch(
          setUser({
            ...user,
            name: name.trim(),
            email: email.trim() || undefined,
            avatar: avatar || undefined,
          })
        );
      }

      toast.success("Profile Updated", "Your profile details have been saved.");
      navigation.goBack();
    } catch (e: any) {
      toast.error("Update Failed", e.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Edit Profile"
        subtitle="Manage your personal information"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Avatar
              uri={avatar || user?.avatar}
              name={name || "Customer"}
              size={88}
              isVerified
            />
            <Text style={styles.avatarPrompt}>Choose Profile Avatar</Text>
            <View style={styles.avatarRow}>
              {AVATAR_OPTIONS.map((url, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setAvatar(url)}
                  style={[
                    styles.avatarChoice,
                    avatar === url && styles.avatarChoiceActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Avatar uri={url} size={42} />
                  {avatar === url && (
                    <View style={styles.checkBubble}>
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form Fields */}
          <Card style={styles.formCard}>
            {/* Full Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Your full name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Mobile Phone (Verified / Readonly) */}
            <View style={styles.fieldWrap}>
              <View style={styles.phoneLabelRow}>
                <Text style={styles.fieldLabel}>Registered Mobile Number</Text>
                <View style={styles.verifiedTag}>
                  <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                  <Text style={styles.verifiedTagText}>OTP Verified</Text>
                </View>
              </View>
              <View style={[styles.inputBox, styles.readOnlyInput]}>
                <Ionicons name="call-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.readOnlyText}>
                  +91 {user?.phone || "Phone number"}
                </Text>
                <Ionicons name="lock-closed" size={15} color={Colors.textMuted} />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Email Address (For Invoices)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="your.email@example.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </Card>

          <Button
            title={saving ? "Saving Changes..." : "Save Profile Details"}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: Spacing.xl }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  avatarPrompt: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatarRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  avatarChoice: {
    borderRadius: BorderRadius.full,
    padding: 2,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  avatarChoiceActive: {
    borderColor: Colors.primary,
  },
  checkBubble: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  formCard: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  phoneLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  verifiedTagText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: "#16A34A",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  readOnlyInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.borderLight,
  },
  readOnlyText: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    height: "100%",
  },
});

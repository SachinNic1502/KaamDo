import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { userService } from "../../../services/users";
import { Address } from "../../../types";
import { AppHeader, Card, Button, useToast } from "../../../components/ui";

export default function SavedAddressesScreen({ navigation }: any) {
  const toast = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [label, setLabel] = useState<"Home" | "Office" | "Other">("Home");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Noida");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("201301");

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const list = await userService.getSavedAddresses();
      setAddresses(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAddAddress = async () => {
    if (!street.trim()) {
      toast.error("Required Field", "Please enter flat / street address.");
      return;
    }
    if (!pincode.trim() || pincode.length < 6) {
      toast.error("Invalid Pincode", "Please enter a valid 6-digit postal code.");
      return;
    }

    const newAddr: Address = {
      label,
      address: street.trim(),
      city: city.trim() || "Noida",
      state: state.trim() || "Uttar Pradesh",
      pincode: pincode.trim(),
    };

    try {
      const updated = await userService.saveAddress(newAddr);
      setAddresses(updated);
      setModalVisible(false);
      setStreet("");
      toast.success("Address Added", `${label} address has been saved.`);
    } catch {
      toast.error("Error", "Could not save address. Please try again.");
    }
  };

  const handleDeleteAddress = (addressItem: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to remove this ${addressItem.label || "saved"} address?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = await userService.deleteAddress(addressItem.address);
            setAddresses(updated);
            toast.success("Deleted", "Address removed from your profile.");
          },
        },
      ]
    );
  };

  const getLabelIcon = (labelType?: string): keyof typeof Ionicons.glyphMap => {
    switch (labelType?.toLowerCase()) {
      case "home":
        return "home";
      case "office":
      case "work":
        return "business";
      default:
        return "location";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Saved Addresses"
        subtitle="Manage locations for quick service booking"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={styles.headerAddText}>Add New</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Cards List */}
        {addresses.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySub}>
              Add your home or office address to book technician visits faster.
            </Text>
            <Button
              title="Add Address Now"
              onPress={() => setModalVisible(true)}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        ) : (
          addresses.map((item, idx) => (
            <Card key={idx} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <View style={styles.labelPill}>
                  <Ionicons
                    name={getLabelIcon(item.label)}
                    size={14}
                    color={Colors.primary}
                  />
                  <Text style={styles.labelText}>{item.label || "Saved Location"}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(item)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={17} color={Colors.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.cityText}>
                {item.city}, {item.state} — {item.pincode}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.useAddressBtn}
                  onPress={() => {
                    navigation.navigate("CreateJob", { prefilledAddress: item });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={14} color={Colors.white} />
                  <Text style={styles.useAddressText}>Book at this Location</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Service Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Label Selector */}
            <Text style={styles.inputLabel}>Address Type</Text>
            <View style={styles.typeSelectorRow}>
              {(["Home", "Office", "Other"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    label === type && styles.typeChipActive,
                  ]}
                  onPress={() => setLabel(type)}
                >
                  <Ionicons
                    name={getLabelIcon(type)}
                    size={16}
                    color={label === type ? Colors.white : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      label === type && styles.typeChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Street / Flat */}
            <Text style={styles.inputLabel}>Flat / Building / Street Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Flat 301, Tower A, Sector 62"
              placeholderTextColor={Colors.textMuted}
              value={street}
              onChangeText={setStreet}
            />

            {/* City & State */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: Spacing.sm }}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Noida / Delhi"
                  placeholderTextColor={Colors.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="201301"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />
              </View>
            </View>

            <Button
              title="Save Address"
              onPress={handleAddAddress}
              style={{ marginTop: Spacing.lg }}
            />
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
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 110,
    gap: Spacing.md,
  },
  headerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  headerAddText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  addressCard: {
    padding: Spacing.base,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  labelPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 5,
  },
  labelText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
  },
  deleteBtn: {
    padding: 4,
  },
  addressText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  cityText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  cardFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  useAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    gap: 5,
  },
  useAddressText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
  },
  emptyContainer: {
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
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  rowInputs: {
    flexDirection: "row",
  },
});

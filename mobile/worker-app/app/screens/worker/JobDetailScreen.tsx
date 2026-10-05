import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { StatusBadge, PrimaryButton, SecondaryButton, Input, Modal } from "../../../components/ui";
import { useJobDetail, useUpdateJobStatus, useAddAdditionalCharge, useAddMaterial } from "../../../hooks/use-api";

export const JobDetailScreen = ({ route, navigation }: any) => {
  const { jobId } = route.params || {};
  const { data: job, isLoading, refetch } = useJobDetail(jobId);
  const updateStatusMutation = useUpdateJobStatus();
  const addChargeMutation = useAddAdditionalCharge();
  const addMaterialMutation = useAddMaterial();

  // OTP Modals
  const [startOtpModal, setStartOtpModal] = useState(false);
  const [startOtp, setStartOtp] = useState("");
  const [completeOtpModal, setCompleteOtpModal] = useState(false);
  const [completeOtp, setCompleteOtp] = useState("");

  // Additional Charge Modal (Extra Labor)
  const [chargeModal, setChargeModal] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeReason, setChargeReason] = useState("");

  // Parts / Material Modal
  const [materialModal, setMaterialModal] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("1");
  const [materialUnitPrice, setMaterialUnitPrice] = useState("");

  if (isLoading || !job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading Job Execution Details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCallCustomer = () => {
    if (job.customerId?.phone) {
      Linking.openURL(`tel:${job.customerId.phone}`);
    } else {
      Alert.alert("Contact Unavailable", "Customer phone is confidential.");
    }
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(
      `${job.address?.address || ""}, ${job.address?.city || ""}`
    );
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    if (url) Linking.openURL(url);
  };

  // Status transitions
  const handleStartJourney = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        jobId: job._id,
        status: "on_the_way",
      });
      Alert.alert("Status Updated", "Customer notified: You are on the way!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update status.");
    }
  };

  const handleArrived = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        jobId: job._id,
        status: "arrived",
      });
      Alert.alert("Arrived", "Customer notified that you have reached the service location.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update status.");
    }
  };

  const handleVerifyStartOtp = async () => {
    if (startOtp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit start OTP provided by customer.");
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        jobId: job._id,
        status: "work_started",
        startOtp,
      });
      setStartOtpModal(false);
      setStartOtp("");
      Alert.alert("Work Started!", "Job is now officially in progress. Timer active.");
    } catch (err: any) {
      Alert.alert("OTP Failed", err.message || "Incorrect start OTP entered.");
    }
  };

  const handleVerifyCompleteOtp = async () => {
    if (completeOtp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit completion OTP provided by customer.");
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        jobId: job._id,
        status: "completed",
        completionOtp: completeOtp,
      });
      setCompleteOtpModal(false);
      setCompleteOtp("");
      Alert.alert("Job Completed!", "Congratulations! The payment is now credited to your pending earnings balance.", [
        { text: "View Earnings", onPress: () => navigation.navigate("Earnings") },
      ]);
    } catch (err: any) {
      Alert.alert("OTP Failed", err.message || "Incorrect completion OTP entered.");
    }
  };

  const handleAddCharge = async () => {
    const amt = parseFloat(chargeAmount);
    if (isNaN(amt) || amt <= 0 || !chargeReason.trim()) {
      Alert.alert("Invalid Charge", "Please enter a valid amount and clear reason.");
      return;
    }
    try {
      await addChargeMutation.mutateAsync({
        jobId: job._id,
        amount: amt,
        reason: chargeReason.trim(),
      });
      setChargeModal(false);
      setChargeAmount("");
      setChargeReason("");
      Alert.alert("Additional Charge Requested", "The invoice has been updated for customer approval.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add charge.");
    }
  };

  const handleAddMaterial = async () => {
    const qty = parseInt(materialQty, 10) || 1;
    const price = parseFloat(materialUnitPrice);
    if (!materialName.trim() || isNaN(price) || price <= 0) {
      Alert.alert("Invalid Part / Material", "Please enter a valid part name and unit price.");
      return;
    }
    try {
      await addMaterialMutation.mutateAsync({
        jobId: job._id,
        name: materialName.trim(),
        quantity: qty,
        unitPrice: price,
      });
      setMaterialModal(false);
      setMaterialName("");
      setMaterialQty("1");
      setMaterialUnitPrice("");
      Alert.alert("Part Added", `${materialName} (Qty: ${qty}) added to job invoice.`);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add material.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job #{job.jobNumber || job._id.slice(-6)}</Text>
        <StatusBadge status={job.status} size="sm" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Callout based on status */}
        <View style={styles.actionCard}>
          <Text style={styles.actionCardLabel}>Current Step</Text>
          {job.status === "worker_assigned" || job.status === "worker_accepted" ? (
            <>
              <Text style={styles.actionCardTitle}>Ready to depart?</Text>
              <Text style={styles.actionCardSub}>
                Tap below when you start your journey to notify the customer.
              </Text>
              <PrimaryButton
                title="Start Journey to Location"
                onPress={handleStartJourney}
                loading={updateStatusMutation.isPending}
                style={{ marginTop: Spacing.sm }}
              />
            </>
          ) : job.status === "on_the_way" ? (
            <>
              <Text style={styles.actionCardTitle}>On The Way</Text>
              <Text style={styles.actionCardSub}>
                Navigate to customer location and tap Arrived once at the door.
              </Text>
              <PrimaryButton
                title="I Have Arrived at Location"
                onPress={handleArrived}
                loading={updateStatusMutation.isPending}
                style={{ marginTop: Spacing.sm }}
              />
            </>
          ) : job.status === "arrived" ? (
            <>
              <Text style={styles.actionCardTitle}>Arrived at Destination</Text>
              <Text style={styles.actionCardSub}>
                Ask the customer for their 4-digit Start OTP before beginning tools setup.
              </Text>
              <PrimaryButton
                title="Verify Start OTP & Begin"
                onPress={() => setStartOtpModal(true)}
                style={{ marginTop: Spacing.sm }}
              />
            </>
          ) : job.status === "work_started" || job.status === "in_progress" ? (
            <>
              <Text style={styles.actionCardTitle}>Service Work in Progress</Text>
              <Text style={styles.actionCardSub}>
                Perform service as agreed. When finished, request customer's Completion OTP.
              </Text>
              <View style={{ flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm }}>
                <SecondaryButton
                  title="+ Extra Labor"
                  onPress={() => setChargeModal(true)}
                  style={{ flex: 1 }}
                />
                <SecondaryButton
                  title="+ Add Part"
                  onPress={() => setMaterialModal(true)}
                  style={{ flex: 1 }}
                />
              </View>
              <PrimaryButton
                title="Finish & Verify OTP"
                onPress={() => setCompleteOtpModal(true)}
                style={{ marginTop: Spacing.sm }}
              />
            </>
          ) : (
            <>
              <Text style={styles.actionCardTitle}>Job {job.status.toUpperCase()}</Text>
              <Text style={styles.actionCardSub}>
                Settlement has been recorded in your earnings ledger.
              </Text>
            </>
          )}
        </View>

        {/* Customer Contact Block */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {job.customerId?.name || "Customer"}
              </Text>
              <Text style={styles.customerPhone}>
                {job.customerId?.phone ? `+91 ${job.customerId.phone}` : "Verified Client"}
              </Text>
            </View>
          </View>

          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={handleCallCustomer}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={16} color={Colors.white} />
              <Text style={styles.contactBtnText}>Call Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() =>
                navigation.navigate("Chat", {
                  jobId: job._id,
                  recipientName: job.customerId?.name || "Customer",
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={16} color={Colors.primary} />
              <Text style={styles.chatBtnText}>In-App Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address & Navigation Block */}
        <View style={styles.card}>
          <View style={styles.addressHeader}>
            <Text style={styles.sectionTitle}>Service Location</Text>
            <TouchableOpacity
              onPress={handleOpenMaps}
              style={styles.mapLink}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={14} color={Colors.primary} />
              <Text style={styles.mapLinkText}>Google Maps</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.addressFull}>
            {job.address?.address}
          </Text>
          <Text style={styles.addressCity}>
            {job.address?.city}, {job.address?.state} - {job.address?.pincode}
          </Text>
        </View>

        {/* Work Description & Service details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Task Scope & Requirements</Text>
          <View style={styles.scopeRow}>
            <Text style={styles.scopeCategory}>
              {job.categoryId?.name || "Service"}
            </Text>
            <Text style={styles.scopePrice}>
              ₹{(job.finalPrice || job.estimatedPrice || 0).toLocaleString("en-IN")}
            </Text>
          </View>
          <Text style={styles.scopeDesc}>{job.description}</Text>

          {/* Additional Charges if any */}
          {job.additionalCharges && job.additionalCharges.length > 0 && (
            <View style={styles.extraChargesList}>
              <Text style={styles.extraChargesTitle}>Extra Charges (Customer Approval):</Text>
              {job.additionalCharges.map((c: any, idx: number) => (
                <View key={idx} style={styles.extraChargeItem}>
                  <Text style={styles.extraChargeReason}>
                    {c.reason} ({c.status})
                  </Text>
                  <Text style={styles.extraChargeAmt}>+₹{c.amount}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Installed Parts & Materials if any */}
          {job.materials && job.materials.length > 0 && (
            <View style={styles.extraChargesList}>
              <Text style={styles.extraChargesTitle}>Installed Parts & Materials:</Text>
              {job.materials.map((m: any, idx: number) => (
                <View key={idx} style={styles.extraChargeItem}>
                  <Text style={styles.extraChargeReason}>
                    {m.name} (x{m.quantity})
                  </Text>
                  <Text style={styles.extraChargeAmt}>
                    +₹{m.totalPrice || (m.quantity * m.unitPrice)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Start OTP Modal */}
        <Modal
          visible={startOtpModal}
          onClose={() => setStartOtpModal(false)}
          title="Customer Start OTP"
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalSub}>
              Ask the customer for the 4-digit OTP displayed on their KaamDo screen to confirm you have arrived on-site.
            </Text>
            <Input
              label="Enter 4-Digit Start OTP"
              placeholder="e.g. 1234"
              value={startOtp}
              onChangeText={setStartOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            <PrimaryButton
              title="Verify & Start Job"
              onPress={handleVerifyStartOtp}
              loading={updateStatusMutation.isPending}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </Modal>

        {/* Completion OTP Modal */}
        <Modal
          visible={completeOtpModal}
          onClose={() => setCompleteOtpModal(false)}
          title="Customer Completion OTP"
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalSub}>
              Enter the 4-digit Completion OTP from the customer after they have inspected and approved your work.
            </Text>
            <Input
              label="Enter 4-Digit Completion OTP"
              placeholder="e.g. 5678"
              value={completeOtp}
              onChangeText={setCompleteOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            <PrimaryButton
              title="Verify & Settle Job"
              onPress={handleVerifyCompleteOtp}
              loading={updateStatusMutation.isPending}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </Modal>

        {/* Additional Charge Modal (Extra Labor) */}
        <Modal
          visible={chargeModal}
          onClose={() => setChargeModal(false)}
          title="Add Extra Labor Charge"
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalSub}>
              Itemize unforeseen extra labor required. The customer will be prompted to approve or reject this charge.
            </Text>
            <Input
              label="Additional Amount (₹)"
              placeholder="e.g. 350"
              value={chargeAmount}
              onChangeText={setChargeAmount}
              keyboardType="numeric"
            />
            <Input
              label="Labor Reason Description"
              placeholder="e.g. High-ceiling ladder work / Heavy wall chiseling"
              value={chargeReason}
              onChangeText={setChargeReason}
            />
            <PrimaryButton
              title="Request Customer Approval"
              onPress={handleAddCharge}
              loading={addChargeMutation.isPending}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </Modal>

        {/* Add Part / Material Modal */}
        <Modal
          visible={materialModal}
          onClose={() => setMaterialModal(false)}
          title="Add Part / Hardware"
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalSub}>
              Itemize replacement parts or materials purchased for this service.
            </Text>
            <Input
              label="Part / Hardware Name"
              placeholder="e.g. 32A MCB, Brass Ball Valve, 5m Wire"
              value={materialName}
              onChangeText={setMaterialName}
            />
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Quantity"
                  placeholder="1"
                  value={materialQty}
                  onChangeText={setMaterialQty}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Input
                  label="Unit Price (₹)"
                  placeholder="e.g. 250"
                  value={materialUnitPrice}
                  onChangeText={setMaterialUnitPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <PrimaryButton
              title="Add Part to Invoice"
              onPress={handleAddMaterial}
              loading={addMaterialMutation.isPending}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
  actionCard: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  actionCardLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionCardTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
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
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: {
    marginLeft: Spacing.sm,
  },
  customerName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  contactActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.successDark,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  contactBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
    marginLeft: 4,
  },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  chatBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 4,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mapLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapLinkText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 3,
  },
  addressFull: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  addressCity: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scopeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scopeCategory: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  scopePrice: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  scopeDesc: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  extraChargesList: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  extraChargesTitle: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  extraChargeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  extraChargeReason: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  extraChargeAmt: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalBody: {
    paddingTop: Spacing.xs,
  },
  modalSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
});

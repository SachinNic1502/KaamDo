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
import { Colors, Spacing, FontSize, BorderRadius } from "../../../constants";
import { StatusBadge } from "../../../components/ui";
import {
  JobActionCard,
  CustomerContactCard,
  JobLocationCard,
  JobScopeCard,
  StartOtpModal,
  CompletionOtpModal,
  AddChargeModal,
  AddMaterialModal,
} from "../../../components/job";
import {
  useJobDetail,
  useUpdateJobStatus,
  useAddAdditionalCharge,
  useAddMaterial,
} from "../../../hooks/use-api";

export const JobDetailScreen = ({ route, navigation }: any) => {
  const { jobId } = route.params || {};
  const { data: job, isLoading } = useJobDetail(jobId);
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

  const totalJobPrice = job.finalPrice || job.estimatedPrice || 0;

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
        {/* Status Action Banner */}
        <JobActionCard
          status={job.status}
          isPending={updateStatusMutation.isPending}
          onStartJourney={handleStartJourney}
          onArrived={handleArrived}
          onOpenStartOtp={() => setStartOtpModal(true)}
          onOpenCompleteOtp={() => setCompleteOtpModal(true)}
          onOpenChargeModal={() => setChargeModal(true)}
          onOpenMaterialModal={() => setMaterialModal(true)}
        />

        {/* Customer Contact Block */}
        <CustomerContactCard
          customer={job.customerId}
          onCall={handleCallCustomer}
          onChat={() =>
            navigation.navigate("Chat", {
              jobId: job._id,
              recipientName: job.customerId?.name || "Customer",
            })
          }
        />

        {/* Address & Navigation Block */}
        <JobLocationCard
          address={job.address}
          onOpenMaps={handleOpenMaps}
        />

        {/* Work Description, Charges & Parts */}
        <JobScopeCard job={job} />
      </ScrollView>

      {/* Start OTP Modal */}
      <StartOtpModal
        visible={startOtpModal}
        onClose={() => {
          setStartOtp("");
          setStartOtpModal(false);
        }}
        otp={startOtp}
        setOtp={setStartOtp}
        onVerify={handleVerifyStartOtp}
        isPending={updateStatusMutation.isPending}
        customerName={job.customerId?.name}
        customerPhone={job.customerId?.phone}
        demoOtp={(job as any)?.startOtp || "1234"}
      />

      {/* Completion OTP Modal */}
      <CompletionOtpModal
        visible={completeOtpModal}
        onClose={() => {
          setCompleteOtp("");
          setCompleteOtpModal(false);
        }}
        otp={completeOtp}
        setOtp={setCompleteOtp}
        onVerify={handleVerifyCompleteOtp}
        isPending={updateStatusMutation.isPending}
        customerName={job.customerId?.name}
        totalAmount={totalJobPrice}
        demoOtp={(job as any)?.completionOtp || "5678"}
      />

      {/* Additional Charge Modal (Extra Labor) */}
      <AddChargeModal
        visible={chargeModal}
        onClose={() => setChargeModal(false)}
        amount={chargeAmount}
        setAmount={setChargeAmount}
        reason={chargeReason}
        setReason={setChargeReason}
        onSubmit={handleAddCharge}
        isPending={addChargeMutation.isPending}
      />

      {/* Add Part / Material Modal */}
      <AddMaterialModal
        visible={materialModal}
        onClose={() => setMaterialModal(false)}
        name={materialName}
        setName={setMaterialName}
        qty={materialQty}
        setQty={setMaterialQty}
        unitPrice={materialUnitPrice}
        setUnitPrice={setMaterialUnitPrice}
        onSubmit={handleAddMaterial}
        isPending={addMaterialMutation.isPending}
      />
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
});

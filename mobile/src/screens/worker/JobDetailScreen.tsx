import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";
import { useJobDetail, useUpdateJob } from "../../hooks/use-api";
import { checkIn, checkOut, startLocationTracking, stopLocationTracking } from "../../services/attendance";

type JobStatus =
  | "worker_assigned"
  | "worker_accepted"
  | "on_the_way"
  | "arrived"
  | "work_started"
  | "in_progress"
  | "completion_requested"
  | "completed";

export default function JobDetailScreen({ route }: any) {
  const jobId = route?.params?.jobId ?? "";
  const user = useSelector((state: any) => state.auth.user);
  const { data: jobRes, isLoading } = useJobDetail(jobId);
  const { mutate: mutateJob, isPending } = useUpdateJob();
  const updateJob = (updates: { jobId: string; [key: string]: unknown }) => mutateJob(updates, { onError: error => Alert.alert("Job update failed", error.message) });

  const raw: any = jobRes?.data ?? {};
  const chargeList: { amount?: number; status?: string; description?: string }[] = Array.isArray(raw.additionalCharges)
    ? raw.additionalCharges
    : [];
  const approvedCharges = chargeList.reduce((sum, c) => sum + (c.status === "approved" ? c.amount ?? 0 : 0), 0);
  const pendingCharges = chargeList.reduce((sum, c) => sum + (c.status === "pending" ? c.amount ?? 0 : 0), 0);
  const job = {
    id: raw._id ?? jobId,
    jobNumber: raw.jobNumber ?? `#${jobId?.slice(-4)}`,
    status: (raw.status ?? "worker_assigned") as JobStatus,
    customerName: raw.customerId?.name ?? "Customer",
    customerPhone: raw.customerId?.phone ?? "",
    customerAddress: raw.address?.address ?? "",
    serviceDetails: raw.categoryId?.name ?? "",
    description: raw.description ?? "",
    price: raw.estimatedPrice ?? 0,
    additionalCharges: approvedCharges,
    pendingCharges,
    latitude: raw.address?.lat ?? 0,
    longitude: raw.address?.lng ?? 0,
  };

  const [otp, setOtp] = useState("");
  const [chargeModalVisible, setChargeModalVisible] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const attendanceIdRef = useRef<string | null>(null);

  useEffect(() => () => stopLocationTracking(trackingInterval.current), []);

  const handleCall = () => {
    const url = `tel:${job.customerPhone.replace(/\s/g, "")}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to make call"));
  };

  const handleNavigate = () => {
    const scheme = Platform.OS === "ios" ? "maps:0,0?q=" : "geo:0,0?q=";
    const url = `${scheme}${job.latitude},${job.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open maps"));
  };

  const handleAccept = () => {
    updateJob({ jobId, status: "worker_accepted" });
  };

  const handleReject = () => {
    Alert.alert("Reject Job", "Are you sure you want to reject this job?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          updateJob({ jobId, status: "rejected" });
        },
      },
    ]);
  };

  const handleStartNavigation = async () => {
    updateJob({ jobId, status: "on_the_way" });
    trackingInterval.current = await startLocationTracking(jobId, 30000, () => {});
  };

  const handleMarkArrived = async () => {
    if (trackingInterval.current) {
      stopLocationTracking(trackingInterval.current);
      trackingInterval.current = null;
    }

    updateJob({ jobId, status: "arrived" });
  };

  const handleStartWork = () => {
    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter a valid 4-digit OTP.");
      return;
    }
    updateJob({ jobId, status: "work_started", startOtp: otp });
    setOtp("");
  };

  const handleRequestCompletion = async () => {

    updateJob({ jobId, status: "completion_requested" });
  };

  const handleAddCharge = () => {
    setChargeAmount("");
    setChargeDescription("");
    setChargeModalVisible(true);
  };

  const handleSubmitCharge = () => {
    const amount = parseInt(chargeAmount, 10);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Enter a positive whole-rupee amount.");
      return;
    }
    if (chargeDescription.trim().length < 5) {
      Alert.alert("Description required", "Describe the charge in at least 5 characters.");
      return;
    }
    mutateJob(
      { jobId, additionalCharge: { description: chargeDescription.trim(), amount } },
      {
        onSuccess: () => setChargeModalVisible(false),
        onError: (error) => Alert.alert("Charge request failed", error.message),
      }
    );
  };

  const getStatusLabel = (status: JobStatus): string => {
    const labels: Record<JobStatus, string> = {
      worker_assigned: "Assigned",
      worker_accepted: "Accepted",
      on_the_way: "On The Way",
      arrived: "Arrived",
      work_started: "Work Started",
      in_progress: "In Progress",
      completion_requested: "Completion Requested",
      completed: "Completed",
    };
    return labels[status];
  };

  const getStatusColor = (status: JobStatus): string => {
    const colors: Record<JobStatus, string> = {
      worker_assigned: Colors.warning,
      worker_accepted: Colors.info,
      on_the_way: Colors.primary,
      arrived: Colors.secondary,
      work_started: Colors.success,
      in_progress: Colors.success,
      completion_requested: Colors.warning,
      completed: Colors.success,
    };
    return colors[status];
  };

  const renderActionButtons = () => {
    switch (job.status) {
      case "worker_assigned":
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <Ionicons name="close-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Reject Job</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        );

      case "worker_accepted":
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleStartNavigation}
          >
            <Ionicons name="navigate-outline" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        );

      case "on_the_way":
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleMarkArrived}
          >
            <Ionicons name="location-outline" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Mark Arrived</Text>
          </TouchableOpacity>
        );

      case "arrived":
        return (
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter Start OTP</Text>
            <View style={styles.otpInputRow}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.otpBox,
                    otp[i] ? styles.otpBoxFilled : null,
                  ]}
                >
                  <Text style={styles.otpDigit}>{otp[i] || ""}</Text>
                </View>
              ))}
            </View>
            <View style={styles.otpButtonsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.otpKey}
                  onPress={() => {
                    if (otp.length < 4) setOtp((prev) => prev + num.toString());
                  }}
                >
                  <Text style={styles.otpKeyText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.otpKey}
                onPress={() => setOtp((prev) => prev.slice(0, -1))}
              >
                <Ionicons name="backspace-outline" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { marginTop: Spacing.lg }]}
              onPress={handleStartWork}
            >
              <Ionicons name="play-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Start Work</Text>
            </TouchableOpacity>
          </View>
        );

      case "work_started":
      case "in_progress":
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleAddCharge}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Add Charge</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleRequestCompletion}
            >
              <Ionicons name="checkmark-done-outline" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Request Completion</Text>
            </TouchableOpacity>
          </View>
        );

      case "completion_requested":
        return (
          <View style={styles.waitingContainer}>
            <Ionicons name="time-outline" size={28} color={Colors.warning} />
            <Text style={styles.waitingText}>
              Waiting for customer approval...
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const totalPrice = job.price + job.additionalCharges;

  if (isLoading) return <Text>Loading job…</Text>;
  if (!jobRes?.data) return <Text>Job unavailable. Return to your jobs and retry.</Text>;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.jobNumber}>{job.jobNumber}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}
          >
            <Text style={styles.statusText}>{getStatusLabel(job.status)}</Text>
          </View>
        </View>
        {job.status === "on_the_way" && (
          <View style={styles.onTheWayBadge}>
            <Ionicons name="car-outline" size={16} color={Colors.white} />
            <Text style={styles.onTheWayText}>On The Way</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.customerCard}>
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.customerName}>{job.customerName}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.customerDetail}>{job.customerPhone}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.customerDetail} numberOfLines={2}>
              {job.customerAddress}
            </Text>
          </View>
          <View style={styles.customerActions}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={18} color={Colors.white} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleNavigate}>
              <Ionicons name="navigate" size={18} color={Colors.white} />
              <Text style={styles.contactButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Details</Text>
        <View style={styles.detailCard}>
          <Text style={styles.serviceName}>{job.serviceDetails}</Text>
          <Text style={styles.serviceDescription}>{job.description}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Charge</Text>
            <Text style={styles.priceValue}>₹{job.price}</Text>
          </View>
          {job.additionalCharges > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Additional Charges</Text>
              <Text style={styles.priceValue}>₹{job.additionalCharges}</Text>
            </View>
          )}
          {job.pendingCharges > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Pending Approval</Text>
              <Text style={styles.priceValue}>₹{job.pendingCharges}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>{renderActionButtons()}</View>

      <View style={styles.bottomSpacer} />

      <Modal
        visible={chargeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChargeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Request Additional Charge</Text>
            <Text style={styles.modalHint}>The customer must approve this before it is added to the bill.</Text>
            <Text style={styles.fieldLabel}>Amount (₹)</Text>
            <TextInput
              style={styles.modalInput}
              value={chargeAmount}
              onChangeText={setChargeAmount}
              keyboardType="number-pad"
              placeholder="e.g. 250"
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={chargeDescription}
              onChangeText={setChargeDescription}
              placeholder="What is this charge for? (min 5 characters)"
              placeholderTextColor={Colors.textSecondary}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setChargeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmit]}
                onPress={handleSubmitCharge}
                disabled={isPending}
              >
                <Text style={styles.modalSubmitText}>{isPending ? "Sending..." : "Send Request"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  jobNumber: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.white,
  },
  onTheWayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  onTheWayText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.white,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  customerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  customerName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  customerDetail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  customerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.white,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
  },
  serviceName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  serviceDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  priceLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  actionButtonText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.white,
  },
  otpContainer: {
    alignItems: "center",
  },
  otpLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  otpInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpBox: {
    width: 52,
    height: 58,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  otpDigit: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  otpButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    maxWidth: 300,
  },
  otpKey: {
    width: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  otpKeyText: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  waitingContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  waitingText: {
    fontSize: FontSize.md,
    color: Colors.warning,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  modalHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  modalSubmit: {
    backgroundColor: Colors.primary,
  },
  modalSubmitText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.white,
  },
});

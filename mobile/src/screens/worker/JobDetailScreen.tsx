import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
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
  const { mutate: updateJob, isPending } = useUpdateJob();

  const raw: any = jobRes?.data ?? {};
  const job = {
    id: raw._id ?? jobId,
    jobNumber: raw.jobNumber ?? `#${jobId?.slice(-4)}`,
    status: (raw.status ?? "worker_assigned") as JobStatus,
    customerName: raw.customerName ?? "Customer",
    customerPhone: raw.customerPhone ?? "",
    customerAddress: raw.customerAddress ?? "",
    serviceDetails: raw.service ?? raw.title ?? "",
    description: raw.description ?? "",
    price: raw.price ?? 0,
    additionalCharges: raw.additionalCharges ?? 0,
    latitude: raw.latitude ?? raw.location?.lat ?? 0,
    longitude: raw.longitude ?? raw.location?.lng ?? 0,
  };

  const [otp, setOtp] = useState("");
  const trackingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const attendanceIdRef = useRef<string | null>(null);

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
          updateJob({ jobId, status: "cancelled" });
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
    const result = await checkIn(jobId);
    if (result) {
      attendanceIdRef.current = result.attendanceId;
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
    if (attendanceIdRef.current) {
      await checkOut(attendanceIdRef.current);
      attendanceIdRef.current = null;
    }
    updateJob({ jobId, status: "completion_requested" });
  };

  const handleAddCharge = () => {
    Alert.prompt(
      "Additional Charge",
      "Enter amount (₹)",
      (value) => {
        const amount = parseInt(value || "0", 10);
        if (!isNaN(amount) && amount > 0) {
          updateJob({ jobId, additionalCharges: (job.additionalCharges ?? 0) + amount });
        }
      },
      "plain-text"
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
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>{renderActionButtons()}</View>

      <View style={styles.bottomSpacer} />
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
});

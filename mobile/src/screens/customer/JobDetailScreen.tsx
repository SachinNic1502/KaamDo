import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants";
import { useJobDetail, useUpdateJob, useCreatePayment } from "../../hooks/use-api";
import { initiatePayment } from "../../services/payment";

const JobDetailScreen = ({ route }: any) => {
  const jobId = route.params.jobId;
  const { data, isLoading } = useJobDetail(jobId);
  const { mutate: updateJob, isPending: isUpdating } = useUpdateJob();
  const { mutate: createPayment, isPending: isPaying } = useCreatePayment();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const jobData = data?.data;
  const job = jobData
    ? {
        jobNumber: jobData.jobNumber,
        status: jobData.status as "pending" | "in-progress" | "completed" | "cancelled",
        category: jobData.categoryId?.name || "",
        description: jobData.description,
        worker: {
          name: jobData.workerId?.name || "N/A",
          phone: jobData.workerId?.phone || "",
          rating: 0,
        },
        schedule: {
          date: jobData.scheduledDate || "",
          time: jobData.startTime
            ? `${jobData.startTime} - ${jobData.endTime || ""}`
            : "",
        },
        price: {
          base: jobData.estimatedPrice || 0,
          additionalCharges:
            jobData.additionalCharges?.reduce(
              (sum: number, c: any) => sum + (c.amount || c),
              0
            ) || 0,
          materials:
            jobData.materials?.reduce(
              (sum: number, m: any) => sum + (m.cost || m),
              0
            ) || 0,
          total:
            (jobData.finalPrice ||
              jobData.estimatedPrice ||
              0) +
            (jobData.additionalCharges?.reduce(
              (sum: number, c: any) => sum + (c.amount || c),
              0
            ) || 0) +
            (jobData.materials?.reduce(
              (sum: number, m: any) => sum + (m.cost || m),
              0
            ) || 0),
        },
        timeline: {
          created: "",
          assigned: undefined,
          started: jobData.startTime || undefined,
          completed: jobData.endTime || undefined,
        },
      }
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.warning;
      case "in-progress":
        return Colors.primary;
      case "completed":
        return Colors.success;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
    }
  };

  const handleVerifyOtp = () => {
    const otpString = otp.join("");
    updateJob({ jobId, status: "work_started", startOtp: otpString });
  };

  const handleMarkComplete = () => {
    updateJob({ jobId, status: "completed" });
  };

  const handlePayNow = async () => {
    if (!job || !jobData) return;
    try {
      const result = await initiatePayment({
        jobId,
        amount: job.price.total,
        customerName: jobData.customerId?.name || "",
        customerPhone: jobData.customerId?.phone || "",
        description: job.description,
      });
      Alert.alert("Payment Successful", "Your payment has been processed.");
    } catch (error: any) {
      Alert.alert("Payment Failed", error?.message || "Something went wrong.");
    }
  };

  const renderTimelineStep = (
    label: string,
    time: string | undefined,
    isCompleted: boolean,
    isLast: boolean
  ) => (
    <View style={styles.timelineStep} key={label}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            isCompleted && styles.timelineDotCompleted,
          ]}
        >
          {isCompleted && (
            <Ionicons name="checkmark" size={12} color={Colors.white} />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              isCompleted && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineLabel,
            isCompleted && styles.timelineLabelCompleted,
          ]}
        >
          {label}
        </Text>
        {time && <Text style={styles.timelineTime}>{time}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {!job ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 40 }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.jobHeaderRow}>
              <Text style={styles.jobNumber}>{job.jobNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(job.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(job.status) },
                  ]}
                >
                  {job.status.replace("-", " ").toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Service Details</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{job.category}</Text>
              </View>
              <Text style={styles.description}>{job.description}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Worker</Text>
            </View>
            <View style={styles.workerCard}>
              <View style={styles.workerInfo}>
                <View style={styles.workerAvatar}>
                  <Text style={styles.workerInitial}>
                    {job.worker.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.workerDetails}>
                  <Text style={styles.workerName}>{job.worker.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={Colors.warning} />
                    <Text style={styles.ratingText}>{job.worker.rating}</Text>
                  </View>
                  <Text style={styles.workerPhone}>{job.worker.phone}</Text>
                </View>
              </View>
              <View style={styles.workerActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="call-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Schedule</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.scheduleText}>{job.schedule.date}</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Ionicons
                  name="hourglass-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.scheduleText}>{job.schedule.time}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Price Breakdown</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base Price</Text>
                <Text style={styles.priceValue}>₹{job.price.base}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Additional Charges</Text>
                <Text style={styles.priceValue}>₹{job.price.additionalCharges}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Materials</Text>
                <Text style={styles.priceValue}>₹{job.price.materials}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{job.price.total}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Status Timeline</Text>
            </View>
            <View style={styles.sectionContent}>
              {renderTimelineStep(
                "Created",
                job.timeline.created,
                true,
                false
              )}
              {renderTimelineStep(
                "Assigned",
                job.timeline.assigned,
                !!job.timeline.assigned,
                false
              )}
              {renderTimelineStep(
                "Started",
                job.timeline.started,
                !!job.timeline.started,
                false
              )}
              {renderTimelineStep(
                "Completed",
                job.timeline.completed,
                !!job.timeline.completed,
                true
              )}
            </View>
          </View>

          {job.status === "in-progress" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>OTP Verification</Text>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.otpDescription}>
                  Enter the 6-digit OTP to verify work start/completion
                </Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.otpInput}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(index, nativeEvent.key)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                <TouchableOpacity style={[styles.primaryButton, { marginTop: 16 }]} onPress={handleVerifyOtp} disabled={isUpdating}>
                  <Ionicons name="key-outline" size={20} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>
                    {isUpdating ? "Verifying..." : "Verify OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {job.status === "in-progress" && (
              <>
                <TouchableOpacity style={styles.primaryButton}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>
                    Approve Additional Work
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleMarkComplete} disabled={isUpdating}>
                  <Ionicons name="flag-outline" size={20} color={Colors.primary} />
                  <Text style={styles.secondaryButtonText}>
                    {isUpdating ? "Completing..." : "Mark Complete"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            {job.status === "completed" && (
              <TouchableOpacity style={styles.primaryButton} onPress={handlePayNow} disabled={isPaying}>
                <Ionicons name="card-outline" size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>
                  {isPaying ? "Processing..." : `Pay Now ₹${job.price.total}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  jobHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobNumber: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  section: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    paddingHorizontal: Spacing.lg,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "500",
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  workerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Spacing.md,
  },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  workerInitial: {
    fontSize: FontSize.xl,
    fontWeight: "600",
    color: Colors.white,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  ratingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  workerPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  workerActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  scheduleText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: "700",
  },
  timelineStep: {
    flexDirection: "row",
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: Colors.border,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContent: {
    marginLeft: Spacing.md,
    paddingBottom: Spacing.md,
  },
  timelineLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  timelineLabelCompleted: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  timelineTime: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  otpDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Spacing.md,
    textAlign: "center",
    fontSize: FontSize.xl,
    fontWeight: "600",
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  actionsContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
});

export default JobDetailScreen;

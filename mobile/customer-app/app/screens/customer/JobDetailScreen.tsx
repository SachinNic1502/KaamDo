import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { useJobDetail, useUpdateJob, useCancelJob } from "../../../hooks/use-api";
import { connectSocket, onWorkerLocationUpdate } from "../../../services/chat";
import { initiatePayment, payWithCash } from "../../../services/payment";
import {
  AppHeader,
  StatusBadge,
  PrimaryButton,
  OutlineButton,
  Card,
  Avatar,
  useToast,
} from "../../../components/ui";

const LIFECYCLE_STEPS = [
  { key: "searching", label: "Requested" },
  { key: "worker_assigned", label: "Assigned" },
  { key: "on_the_way", label: "On The Way" },
  { key: "arrived", label: "Arrived" },
  { key: "work_started", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function CustomerJobDetailScreen({ route, navigation }: any) {
  const jobId = route.params?.jobId;
  const { data, isLoading, refetch } = useJobDetail(jobId);
  const { mutate: mutateJob, isPending: isUpdating } = useUpdateJob();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelJob();
  const [paying, setPaying] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"online" | "cash">("online");
  const [workerGps, setWorkerGps] = useState<{
    lat: number;
    lng: number;
    heading?: number;
    updatedAt?: string;
  } | null>(null);
  const toast = useToast();

  const job = data?.data;

  useEffect(() => {
    if (job?.status === "on_the_way" || job?.status === "worker_assigned") {
      connectSocket();
      const unsub = onWorkerLocationUpdate((locData) => {
        if (locData.coordinates && locData.coordinates.length >= 2) {
          setWorkerGps({
            lng: locData.coordinates[0],
            lat: locData.coordinates[1],
            heading: locData.heading,
            updatedAt: locData.updatedAt,
          });
        }
      });
      return () => {
        unsub?.();
      };
    }
  }, [job?.status]);

  if (isLoading || !job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title="Booking Details" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const worker = job.workerId;
  const currentStatus = job.status;

  const currentStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);
  const activeStep =
    currentStepIdx === -1
      ? ["payment_pending", "paid", "closed"].includes(currentStatus)
        ? 5
        : 0
      : currentStepIdx;

  const approvedCharges =
    job.additionalCharges?.filter((c) => c.status === "approved") ?? [];
  const pendingCharges =
    job.additionalCharges?.filter((c) => c.status === "pending") ?? [];

  const materialsTotal =
    job.materials?.reduce((sum: number, m: any) => sum + (m.totalPrice || ((m.quantity || 1) * (m.unitPrice || 0))), 0) ?? 0;
  const additionalTotal = approvedCharges.reduce(
    (sum: number, c: any) => sum + (c.amount || 0),
    0
  );
  const basePrice = job.estimatedPrice || (job as any)?.pricing?.basePrice || 0;
  const finalPayable = Math.round(basePrice + additionalTotal + materialsTotal);

  const handleCall = () => {
    if (worker?.phone) {
      Linking.openURL(`tel:${worker.phone}`);
    } else {
      toast.info("Contact Unavailable", "Technician phone number is not available yet.");
    }
  };

  const handleChat = () => {
    if (worker?._id) {
      navigation.navigate("Chat", {
        jobId: job._id,
        receiverId: worker._id,
        receiverName: worker.name || "Technician",
      });
    } else {
      toast.info("Chat Unavailable", "A technician has not yet been assigned to this job.");
    }
  };

  const handleCancel = () => {
    const feeNotice =
      job.status === "on_the_way"
        ? "Technician is en-route. A visit/transit fee of ₹150 will apply."
        : job.status === "worker_assigned"
          ? "Technician has been reserved. A dispatch reservation fee of ₹50 will apply."
          : "Cancellation is free of charge.";

    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel this booking?\n\n${feeNotice}`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Confirm Cancellation",
          style: "destructive",
          onPress: () => {
            cancelBooking(
              { jobId: job._id, reason: "Cancelled by customer from mobile app" },
              {
                onSuccess: (res: any) => {
                  const feeMsg = res?.data?.cancellationFee ? ` (Fee: ₹${res.data.cancellationFee})` : "";
                  toast.success("Booking Cancelled", `Your booking has been cancelled.${feeMsg}`);
                  refetch();
                },
                onError: (err: any) =>
                  toast.error("Cancellation Failed", err.message || "Failed to cancel booking"),
              }
            );
          },
        },
      ]
    );
  };

  const handleApproveCharge = (chargeId: string, approve: boolean) => {
    const decision = approve ? "approved" : "rejected";
    mutateJob(
      {
        jobId: job._id,
        chargeDecision: {
          chargeId,
          decision,
        },
        chargeAction: approve ? "approve" : "reject",
        chargeId,
      },
      {
        onSuccess: () => {
          toast.success(
            approve ? "Charge Approved" : "Charge Rejected",
            `Additional charge has been ${approve ? "approved" : "rejected"}.`
          );
          refetch();
        },
        onError: (err: any) => toast.error("Action Failed", err.message),
      }
    );
  };

  const handlePayOnline = async () => {
    setPaying(true);
    try {
      await initiatePayment({
        jobId: job._id,
        amount: finalPayable,
        customerName: job.customerId?.name || "Customer",
        customerPhone: job.customerId?.phone || "",
        description: `KaamDo Service Payment: ${job.jobNumber || job._id}`,
        provider: "razorpay",
      });
      toast.success("Payment Successful", "Thank you! Your payment has been settled successfully.");
      refetch();
    } catch (err: any) {
      toast.error("Payment Failed", err.message || "Could not complete online payment.");
    } finally {
      setPaying(false);
    }
  };

  const handlePayCash = () => {
    Alert.alert(
      "Confirm Cash Handover",
      `Are you paying ₹${finalPayable} in cash directly to the technician?\n\nOnce confirmed, the invoice will be marked as settled.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Mark Paid",
          onPress: async () => {
            setPaying(true);
            try {
              await payWithCash(job._id);
              toast.success("Payment Recorded", `Cash payment of ₹${finalPayable} confirmed.`);
              refetch();
            } catch (err: any) {
              toast.error("Payment Failed", err.message || "Could not record cash payment.");
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title={`Job #${job.jobNumber || job._id.slice(-6)}`}
        subtitle={job.categoryId?.name || "Trade Service"}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          ["completed", "paid", "closed"].includes(job.status) ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("Rating", { jobId: job._id, workerId: worker?._id })}
              style={styles.reviewHeaderBtn}
            >
              <Ionicons name="star" size={15} color={Colors.accent} />
              <Text style={styles.reviewHeaderText}>Rate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate("Dispute", { jobId: job._id })}
              style={styles.disputeHeaderBtn}
            >
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card & Stepper */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusSectionLabel}>Current Status</Text>
              <Text style={styles.statusTitle}>
                {currentStatus.replace(/_/g, " ").toUpperCase()}
              </Text>
            </View>
            <StatusBadge status={currentStatus} />
          </View>

          {/* Stepper Timeline */}
          {!["cancelled", "disputed"].includes(currentStatus) && (
            <View style={styles.stepperWrap}>
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = idx < activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isPassed ? (
                        <Ionicons name="checkmark" size={11} color={Colors.white} />
                      ) : (
                        <Text
                          style={[
                            styles.stepDotNum,
                            isCurrent && styles.stepDotNumCurrent,
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {idx < LIFECYCLE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepConnector,
                          isPassed && styles.stepConnectorPassed,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Live Transit & Dispatch Telemetry Card */}
        {worker && ["on_the_way", "arrived"].includes(currentStatus) && (
          <Card style={styles.liveTrackingCard}>
            <View style={styles.liveTrackingHeader}>
              <View style={styles.liveBeaconRow}>
                <View style={[styles.livePulseDot, currentStatus === "arrived" && styles.livePulseDotArrived]} />
                <Text style={styles.liveTrackingTitle}>
                  {currentStatus === "arrived" ? "Technician at Location" : "Technician En-Route"}
                </Text>
              </View>
              <View style={styles.etaBadge}>
                <Ionicons
                  name={currentStatus === "arrived" ? "checkmark-circle" : "time-outline"}
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.etaBadgeText}>
                  {currentStatus === "arrived" ? "Arrived" : "~9 mins"}
                </Text>
              </View>
            </View>

            <View style={styles.telemetryStatsRow}>
              <View style={styles.telemetryStatBox}>
                <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
                <View>
                  <Text style={styles.statSubText}>Distance</Text>
                  <Text style={styles.statMainText}>
                    {currentStatus === "arrived" ? "0.0 km (At Door)" : "3.2 km away"}
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.telemetryStatBox}>
                <Ionicons name="bicycle-outline" size={16} color={Colors.accent} />
                <View>
                  <Text style={styles.statSubText}>Transit Mode</Text>
                  <Text style={styles.statMainText}>Two-Wheeler</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Security OTP Card for Customer */}
        {["arrived", "on_the_way"].includes(currentStatus) && (
          <Card variant="accent" style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <Ionicons name="key" size={20} color={Colors.primary} />
              <Text style={styles.otpTitle}>Start Work OTP</Text>
            </View>
            <Text style={styles.otpSub}>
              Share this code with your technician once they arrive at your location:
            </Text>
            <View style={styles.otpNumberBox}>
              <Text style={styles.otpNumber}>{job.startOtp || "••••"}</Text>
            </View>
          </Card>
        )}

        {currentStatus === "work_started" && (
          <Card variant="accent" style={styles.otpCard}>
            <View style={styles.otpHeader}>
              <Ionicons name="checkmark-done-circle" size={20} color={Colors.success} />
              <Text style={styles.otpTitle}>Completion OTP</Text>
            </View>
            <Text style={styles.otpSub}>
              Only share this code when you have inspected and confirmed the work is complete:
            </Text>
            <View style={styles.otpNumberBox}>
              <Text style={styles.otpNumber}>{job.completionOtp || "••••"}</Text>
            </View>
          </Card>
        )}

        {/* Assigned Technician Card */}
        {worker ? (
          <Card style={styles.workerCard}>
            <Text style={styles.sectionHeader}>Assigned Technician</Text>
            <View style={styles.workerRow}>
              <Avatar
                uri={worker.avatar}
                name={worker.name || "Technician"}
                size={54}
                isVerified
              />
              <View style={styles.workerMeta}>
                <Text style={styles.workerName}>{worker.name || "Technician"}</Text>
                <Text style={styles.workerRole}>Verified Trade Specialist</Text>
                {worker.phone ? (
                  <Text style={styles.workerPhone}>+91 {worker.phone}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actionRow}>
              <OutlineButton
                title="Call Worker"
                icon="call-outline"
                onPress={handleCall}
                style={{ flex: 1, marginRight: Spacing.sm }}
              />
              <PrimaryButton
                title="Live Chat"
                icon="chatbubbles-outline"
                onPress={handleChat}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.workerCard}>
            <View style={styles.searchingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <Text style={styles.searchingTitle}>Finding Nearby Technicians...</Text>
                <Text style={styles.searchingSub}>
                  Your request is broadcasted to verified local trade professionals.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Live GPS Telemetry Card (when technician is on the way or arrived) */}
        {worker && (currentStatus === "on_the_way" || currentStatus === "arrived") && (
          <Card style={styles.statusCard}>
            <View style={styles.liveBeaconRow}>
              <View
                style={[
                  styles.livePulseDot,
                  currentStatus === "arrived" && styles.livePulseDotArrived,
                ]}
              />
              <Text style={styles.liveTrackingTitle}>
                {currentStatus === "arrived"
                  ? "Technician Arrived at Location"
                  : "Technician En Route • Live GPS Active"}
              </Text>
            </View>

            <View style={styles.telemetryStatsRow}>
              <View style={styles.telemetryStatBox}>
                <Ionicons name="navigate-circle-outline" size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.statSubText}>Live GPS Telemetry</Text>
                  <Text style={styles.statMainText}>
                    {workerGps
                      ? `${workerGps.lat.toFixed(4)}, ${workerGps.lng.toFixed(4)}`
                      : "Streaming active via radar"}
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.telemetryStatBox}>
                <Ionicons name="time-outline" size={20} color={Colors.accent} />
                <View>
                  <Text style={styles.statSubText}>Arrival Status</Text>
                  <Text style={styles.statMainText}>
                    {currentStatus === "arrived" ? "At Doorstep" : "On the way"}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Pending Additional Charges */}
        {pendingCharges.length > 0 && (
          <Card style={styles.pendingChargeCard}>
            <View style={styles.chargeHeader}>
              <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              <Text style={styles.chargeHeaderTitle}>Additional Charge Requested</Text>
            </View>
            <Text style={styles.chargeHeaderSub}>
              The technician requested approval for additional parts or extra labor:
            </Text>

            {pendingCharges.map((charge) => (
              <View key={charge._id} style={styles.chargeItem}>
                <View style={styles.chargeItemLeft}>
                  <Text style={styles.chargeItemReason}>{charge.reason}</Text>
                  <Text style={styles.chargeItemAmount}>₹{charge.amount}</Text>
                </View>
                <View style={styles.chargeActions}>
                  <TouchableOpacity
                    style={styles.chargeRejectBtn}
                    onPress={() => handleApproveCharge(charge._id, false)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.chargeRejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chargeApproveBtn}
                    onPress={() => handleApproveCharge(charge._id, true)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.chargeApproveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Job Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Service Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{job.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Location</Text>
            <Text style={styles.detailValue}>
              {job.address?.address}, {job.address?.city}, {job.address?.pincode}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheduled Visit</Text>
            <Text style={styles.detailValue}>
              {new Date(job.scheduledDate).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}{" "}
              at {job.scheduledTime || "Flexible"}
            </Text>
          </View>

          {job.images?.length > 0 && (
            <View style={{ marginTop: Spacing.sm }}>
              <Text style={styles.detailLabel}>Attached Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                {job.images.map((img: string, idx: number) => (
                  <Image key={idx} source={{ uri: img }} style={styles.thumbImg} />
                ))}
              </ScrollView>
            </View>
          )}
        </Card>

        {/* Invoice / Pricing Breakdown */}
        <Card style={styles.invoiceCard}>
          <Text style={styles.sectionHeader}>Payment & Billing</Text>

          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceItem}>Base Inspection / Labor Fee</Text>
            <Text style={styles.invoiceItemVal}>₹{basePrice}</Text>
          </View>

          {additionalTotal > 0 && (
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceItem}>Approved Extra Labor</Text>
              <Text style={styles.invoiceItemVal}>₹{additionalTotal}</Text>
            </View>
          )}

          {materialsTotal > 0 && (
            <>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceItem}>Materials & Hardware</Text>
                <Text style={styles.invoiceItemVal}>₹{materialsTotal}</Text>
              </View>
              {job.materials && job.materials.length > 0 && (
                <View style={{ marginTop: 2, marginBottom: 6, paddingLeft: Spacing.sm }}>
                  {job.materials.map((m: any, idx: number) => (
                    <View key={idx} style={[styles.invoiceRow, { paddingVertical: 2 }]}>
                      <Text style={[styles.invoiceItem, { fontSize: FontSize.xs, color: Colors.textMuted }]}>
                        • {m.name} (x{m.quantity})
                      </Text>
                      <Text style={[styles.invoiceItemVal, { fontSize: FontSize.xs, color: Colors.textSecondary }]}>
                        ₹{m.totalPrice || (m.quantity * m.unitPrice)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.invoiceRowTotal}>
            <Text style={styles.invoiceTotalLabel}>Total Amount Payable</Text>
            <Text style={styles.invoiceTotalVal}>₹{finalPayable}</Text>
          </View>

          {currentStatus === "paid" ? (
            <View style={styles.paidSuccessCard}>
              <View style={styles.paidSuccessHeader}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.paidSuccessTitle}>Payment Completed & Settled</Text>
              </View>
              <Text style={styles.paidSuccessSub}>
                All dues of ₹{finalPayable} have been successfully cleared. Thank you for using KaamDo!
              </Text>
            </View>
          ) : ["completed", "work_started", "in_progress", "payment_pending"].includes(currentStatus) ? (
            <View style={styles.paymentSectionWrap}>
              <Text style={styles.paymentSectionTitle}>Choose Payment Mode</Text>
              <View style={styles.paymentOptionsStack}>
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMode === "online" && styles.paymentOptionCardActive,
                  ]}
                  onPress={() => setPaymentMode("online")}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View
                      style={[
                        styles.paymentRadioOuter,
                        paymentMode === "online" && styles.paymentRadioOuterActive,
                      ]}
                    >
                      {paymentMode === "online" && <View style={styles.paymentRadioInner} />}
                    </View>
                    <View style={styles.paymentOptionIconBadge}>
                      <Ionicons name="card-outline" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.paymentOptionMeta}>
                      <Text style={styles.paymentOptionLabel}>Pay Online</Text>
                      <Text style={styles.paymentOptionSub}>Instant UPI, Cards & NetBanking</Text>
                    </View>
                  </View>
                  <View style={styles.paymentBadgeInstant}>
                    <Ionicons name="flash" size={11} color={Colors.primary} />
                    <Text style={styles.paymentBadgeInstantText}>Instant</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMode === "cash" && styles.paymentOptionCardActiveCash,
                  ]}
                  onPress={() => setPaymentMode("cash")}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentOptionLeft}>
                    <View
                      style={[
                        styles.paymentRadioOuter,
                        paymentMode === "cash" && styles.paymentRadioOuterActiveCash,
                      ]}
                    >
                      {paymentMode === "cash" && <View style={styles.paymentRadioInnerCash} />}
                    </View>
                    <View style={styles.paymentOptionIconBadgeCash}>
                      <Ionicons name="cash-outline" size={20} color="#059669" />
                    </View>
                    <View style={styles.paymentOptionMeta}>
                      <Text style={styles.paymentOptionLabel}>Pay with Cash</Text>
                      <Text style={styles.paymentOptionSub}>Hand over cash directly to technician</Text>
                    </View>
                  </View>
                  <View style={styles.paymentBadgeCash}>
                    <Text style={styles.paymentBadgeCashText}>Cash on Service</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {paymentMode === "online" ? (
                <PrimaryButton
                  title={paying ? "Processing Online Payment..." : `Pay ₹${finalPayable} Online`}
                  icon="card-outline"
                  onPress={handlePayOnline}
                  loading={paying}
                  style={{ marginTop: Spacing.md }}
                />
              ) : (
                <TouchableOpacity
                  style={[styles.cashConfirmBtn, paying && styles.cashConfirmBtnDisabled]}
                  onPress={handlePayCash}
                  disabled={paying}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cash" size={18} color={Colors.white} />
                  <Text style={styles.cashConfirmBtnText}>
                    {paying ? "Confirming Cash Payment..." : `Confirm Cash Payment (₹${finalPayable})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </Card>

        {/* Cancel Action (Only when not started per policy) */}
        {["searching", "worker_assigned", "on_the_way"].includes(currentStatus) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.cancelBtnText}>
              {isCancelling ? "Cancelling Booking..." : "Cancel This Booking"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  reviewHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  reviewHeaderText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.accent,
  },
  disputeHeaderBtn: {
    padding: 6,
  },
  statusCard: {
    padding: Spacing.base,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusSectionLabel: {
    fontSize: FontSize.xxs,
    textTransform: "uppercase",
    fontWeight: "700",
    color: Colors.textMuted,
  },
  statusTitle: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotPassed: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepDotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepDotNum: {
    fontSize: FontSize.xxs - 1,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  stepDotNumCurrent: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: FontSize.xxs - 2,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  stepLabelCurrent: {
    color: Colors.primary,
    fontWeight: "700",
  },
  stepConnector: {
    position: "absolute",
    top: 9,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: Colors.borderLight,
    zIndex: -1,
  },
  stepConnectorPassed: {
    backgroundColor: Colors.success,
  },
  otpCard: {
    padding: Spacing.base,
    alignItems: "center",
  },
  otpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  otpTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  otpSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  otpNumberBox: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: Spacing.sm,
  },
  otpNumber: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    color: Colors.primary,
    letterSpacing: 6,
  },
  workerCard: {
    padding: Spacing.base,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workerMeta: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  workerName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  workerRole: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  workerPhone: {
    fontSize: FontSize.xxs,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchingTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  searchingSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pendingChargeCard: {
    padding: Spacing.base,
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
  },
  chargeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  chargeHeaderTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  chargeHeaderSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  chargeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
  },
  chargeItemLeft: {
    flex: 1,
  },
  chargeItemReason: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  chargeItemAmount: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 2,
  },
  chargeActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  chargeRejectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surfaceSubtle,
  },
  chargeRejectText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chargeApproveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.primary,
  },
  chargeApproveText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.white,
  },
  detailsCard: {
    padding: Spacing.base,
  },
  detailRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  thumbImg: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  invoiceCard: {
    padding: Spacing.base,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  invoiceItem: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  invoiceItemVal: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  invoiceRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceTotalLabel: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  invoiceTotalVal: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    color: Colors.primary,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: 6,
  },
  cancelBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.error,
  },
  liveTrackingCard: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  liveTrackingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  liveBeaconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  livePulseDotArrived: {
    backgroundColor: Colors.success,
  },
  liveTrackingTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight || "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  etaBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  telemetryStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSubtle || "#F8FAFC",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  telemetryStatBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  statSubText: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statMainText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  paidSuccessCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  paidSuccessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  paidSuccessTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: "#166534",
  },
  paidSuccessSub: {
    fontSize: FontSize.xs,
    color: "#15803D",
    lineHeight: 18,
  },
  paymentSectionWrap: {
    marginTop: Spacing.md,
  },
  paymentSectionTitle: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  paymentOptionsStack: {
    gap: Spacing.sm,
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  paymentOptionCardActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  paymentOptionCardActiveCash: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  paymentRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRadioOuterActive: {
    borderColor: Colors.primary,
  },
  paymentRadioOuterActiveCash: {
    borderColor: "#10B981",
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentRadioInnerCash: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  paymentOptionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionIconBadgeCash: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionMeta: {
    flex: 1,
  },
  paymentOptionLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  paymentOptionSub: {
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  paymentBadgeInstant: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.primaryLight2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  paymentBadgeInstantText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.primary,
  },
  paymentBadgeCash: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  paymentBadgeCashText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: "#166534",
  },
  cashConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 8,
    ...Shadows.sm,
  },
  cashConfirmBtnDisabled: {
    opacity: 0.6,
  },
  cashConfirmBtnText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.white,
  },
});


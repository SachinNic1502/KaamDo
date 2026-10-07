import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { PrimaryButton, Input, Modal, Badge, EmptyState } from "../../../components/ui";
import {
  useWorkerEarnings,
  usePayoutHistory,
  useRequestPayout,
  useWorkerProfile,
} from "../../../hooks/use-api";

export const EarningsScreen = ({ navigation }: any) => {
  const { data: earnings, isLoading: earnLoading, refetch: refetchEarn } = useWorkerEarnings();
  const { data: payouts = [], isLoading: payLoading, refetch: refetchPays } = usePayoutHistory();
  const { data: workerProfile } = useWorkerProfile();
  const requestPayoutMutation = useRequestPayout();

  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  // Sync profile bank details if available
  React.useEffect(() => {
    if (workerProfile?.bankDetails) {
      if (workerProfile.bankDetails.upi && !upiId) {
        setUpiId(workerProfile.bankDetails.upi);
      }
      if (workerProfile.bankDetails.accountNumber && !accountNumber) {
        setAccountNumber(workerProfile.bankDetails.accountNumber);
      }
      if (workerProfile.bankDetails.ifsc && !ifsc) {
        setIfsc(workerProfile.bankDetails.ifsc);
      }
      if (workerProfile.bankDetails.accountHolderName && !accountHolderName) {
        setAccountHolderName(workerProfile.bankDetails.accountHolderName);
      }
    }
  }, [workerProfile]);

  const pendingBalance = earnings?.pendingPayout || 0;

  const handleWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payout withdrawal amount.");
      return;
    }
    if (amountNum > pendingBalance) {
      Alert.alert("Insufficient Balance", "Withdrawal amount cannot exceed your available pending balance.");
      return;
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      Alert.alert("Invalid UPI ID", "Please enter a valid UPI VPA (e.g. mobile@upi).");
      return;
    }
    if (paymentMethod === "bank") {
      if (!accountNumber || accountNumber.trim().length < 8) {
        Alert.alert("Invalid Account Number", "Please enter a valid bank account number.");
        return;
      }
      if (!ifsc || ifsc.trim().length < 4) {
        Alert.alert("Invalid IFSC", "Please enter a valid bank IFSC code.");
        return;
      }
    }

    try {
      await requestPayoutMutation.mutateAsync({
        amount: amountNum,
        paymentMethod,
        upiId: paymentMethod === "upi" ? upiId.trim() : undefined,
        accountNumber: paymentMethod === "bank" ? accountNumber.trim() : undefined,
        ifsc: paymentMethod === "bank" ? ifsc.trim().toUpperCase() : undefined,
        accountHolderName: paymentMethod === "bank" ? accountHolderName.trim() : undefined,
      });

      setWithdrawModalVisible(false);
      setWithdrawAmount("");
      Alert.alert(
        "Payout Requested",
        "Your withdrawal request has been initiated. Settlement will reflect within 2-4 hours."
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to process withdrawal request.");
    }
  };

  const isRefreshing = earnLoading || payLoading;

  const onRefresh = () => {
    refetchEarn();
    refetchPays();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings & Wallet</Text>
          <Text style={styles.headerSubtitle}>
            Direct settlements to your verified bank account or UPI
          </Text>
        </View>

        {/* Hero Payout Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Available for Withdrawal</Text>
              <Text style={styles.heroBalance}>
                ₹{pendingBalance.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.walletIconWrap}>
              <Ionicons name="wallet-outline" size={26} color={Colors.white} />
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottom}>
            <View>
              <Text style={styles.lifetimeLabel}>Lifetime Earnings</Text>
              <Text style={styles.lifetimeValue}>
                ₹{(earnings?.totalEarnings || 0).toLocaleString("en-IN")}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => {
                setWithdrawAmount(pendingBalance.toString());
                setWithdrawModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
              <Ionicons name="arrow-up-circle-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Today</Text>
            <Text style={styles.metricValue}>
              ₹{(earnings?.today || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.metricSub}>Live today</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>This Week</Text>
            <Text style={styles.metricValue}>
              ₹{(earnings?.thisWeek || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.metricSub}>Last 7 days</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>This Month</Text>
            <Text style={styles.metricValue}>
              ₹{(earnings?.thisMonth || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={styles.metricSub}>
              {earnings?.completedJobsCount || 0} jobs completed
            </Text>
          </View>
        </View>

        {/* Payout History Ledger */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Withdrawal & Settlement History</Text>
            {payouts.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("PayoutHistory")}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllHistoryText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {payouts.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No Payouts Yet"
              description="Completed job earnings will appear here once payouts and settlements are processed."
            />
          ) : (
            payouts.map((p) => (
              <View key={p._id} style={styles.payoutItem}>
                <View style={styles.payoutLeft}>
                  <View style={styles.payoutIconWrap}>
                    <Ionicons
                      name={p.status === "completed" ? "checkmark-circle" : "time-outline"}
                      size={20}
                      color={p.status === "completed" ? Colors.success : Colors.warning}
                    />
                  </View>
                  <View>
                    <Text style={styles.payoutTitle}>
                      {p.paymentMethod.toUpperCase()} Transfer
                    </Text>
                    <Text style={styles.payoutDate}>
                      {new Date(p.payoutDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.payoutRight}>
                  <Text style={styles.payoutAmount}>
                    ₹{p.amount.toLocaleString("en-IN")}
                  </Text>
                  <Badge
                    label={p.status}
                    variant={p.status === "completed" ? "success" : "warning"}
                    size="sm"
                  />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Withdrawal Modal */}
        <Modal
          visible={withdrawModalVisible}
          onClose={() => setWithdrawModalVisible(false)}
          title="Withdraw to Bank / UPI"
        >
          <View style={styles.modalBody}>
            <Text style={styles.modalSub}>
              Available balance: <Text style={styles.modalBold}>₹{pendingBalance}</Text>
            </Text>

            <Input
              label="Amount to Withdraw (₹)"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />

            <Text style={styles.modalFieldLabel}>Payout Destination</Text>
            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === "upi" && styles.methodBtnActive,
                ]}
                onPress={() => setPaymentMethod("upi")}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={16}
                  color={paymentMethod === "upi" ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === "upi" && styles.methodBtnTextActive,
                  ]}
                >
                  Instant UPI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === "bank" && styles.methodBtnActive,
                ]}
                onPress={() => setPaymentMethod("bank")}
              >
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={paymentMethod === "bank" ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === "bank" && styles.methodBtnTextActive,
                  ]}
                >
                  Bank Account
                </Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === "upi" ? (
              <Input
                label="UPI Virtual Payment Address"
                placeholder="e.g. mobile@okhdfcbank"
                value={upiId}
                onChangeText={setUpiId}
                leftIcon="at-outline"
              />
            ) : (
              <View style={{ gap: Spacing.xs }}>
                <Input
                  label="Account Holder Name"
                  placeholder="e.g. Rahul Sharma"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                  leftIcon="person-outline"
                />
                <Input
                  label="Bank Account Number"
                  placeholder="e.g. 50100412345678"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  leftIcon="card-outline"
                />
                <Input
                  label="IFSC Code"
                  placeholder="e.g. HDFC0001234"
                  value={ifsc}
                  onChangeText={(val) => setIfsc(val.toUpperCase())}
                  autoCapitalize="characters"
                  leftIcon="business-outline"
                />
              </View>
            )}

            <PrimaryButton
              title={
                requestPayoutMutation.isPending
                  ? "Processing..."
                  : `Confirm Withdrawal of ₹${withdrawAmount || 0}`
              }
              onPress={handleWithdraw}
              loading={requestPayoutMutation.isPending}
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
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: 115,
  },
  header: {
    marginBottom: Spacing.base,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: Colors.navy,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: FontSize.xs,
    color: Colors.primaryMuted,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroBalance: {
    fontSize: FontSize.display,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  walletIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: Spacing.md,
  },
  heroBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lifetimeLabel: {
    fontSize: FontSize.xxs,
    color: Colors.primaryMuted,
  },
  lifetimeValue: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.white,
    marginTop: 2,
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm + 2,
  },
  withdrawBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primaryDark,
    marginRight: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  metricLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 4,
  },
  metricSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historySection: {
    marginBottom: Spacing.lg,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  historyTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  viewAllHistoryText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
  demoPayouts: {
    gap: Spacing.sm,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  payoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  payoutIconWrap: {
    marginRight: Spacing.sm,
  },
  payoutTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  payoutDate: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  payoutRight: {
    alignItems: "flex-end",
  },
  payoutAmount: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modalBody: {
    paddingTop: Spacing.sm,
  },
  modalSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  modalBold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalFieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  methodRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  methodBtnText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  methodBtnTextActive: {
    color: Colors.primary,
    fontWeight: "700",
  },
});

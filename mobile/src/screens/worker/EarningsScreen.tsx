import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { Colors, Spacing, FontSize } from "../../constants";
import { usePayments } from "../../hooks/use-api";

type Tab = "wallet" | "payouts";

const STATUS_COLORS: Record<string, string> = {
  completed: "#22C55E",
  pending: "#F59E0B",
  failed: "#EF4444",
};

const EarningsScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>("wallet");
  const user = useSelector((state: any) => state.auth.user);
  const { data: paymentsResponse, isLoading } = usePayments({ workerId: user?._id });
  const payments = paymentsResponse?.data ?? [];

  const grossEarnings = useMemo(() => payments.reduce((sum, p) => sum + (p.amount || 0), 0), [payments]);
  const commission = useMemo(() => payments.reduce((sum, p) => sum + (p.platformFee || 0), 0), [payments]);
  const netEarnings = grossEarnings - commission;
  const availableBalance = useMemo(() => payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.workerEarning || 0), 0), [payments]);
  const pendingAmount = useMemo(() => payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.workerEarning || 0), 0), [payments]);

  const renderStatusBadge = (status: string) => (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${STATUS_COLORS[status]}20` },
      ]}
    >
      <View
        style={[styles.badgeDot, { backgroundColor: STATUS_COLORS[status] }]}
      />
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <Ionicons name="wallet-outline" size={28} color={Colors.primary} />
      </View>

      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Gross Earnings</Text>
          <Text style={styles.totalValue}>
            {"\u20B9"}{grossEarnings.toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Commission Deducted</Text>
          <Text style={styles.deductionValue}>
            -{"\u20B9"}{commission.toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.netLabel}>Net Amount</Text>
          <Text style={styles.netValue}>
            {"\u20B9"}{netEarnings.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "wallet" && styles.activeTab]}
          onPress={() => setActiveTab("wallet")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="wallet"
            size={18}
            color={
              activeTab === "wallet" ? Colors.primary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "wallet" && styles.activeTabText,
            ]}
          >
            Wallet
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "payouts" && styles.activeTab]}
          onPress={() => setActiveTab("payouts")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={
              activeTab === "payouts" ? Colors.primary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "payouts" && styles.activeTabText,
            ]}
          >
            Payouts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "wallet" && (
        <View style={styles.walletSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Ionicons name="cash-outline" size={24} color={Colors.primary} />
              <Text style={styles.balanceTitle}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>
              {"\u20B9"}{availableBalance.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.withdrawButton}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up-circle" size={20} color="#FFF" />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pendingCard}>
            <View style={styles.pendingHeader}>
              <Ionicons name="time-outline" size={22} color="#F59E0B" />
              <Text style={styles.pendingTitle}>Pending Amount</Text>
            </View>
            <Text style={styles.pendingAmount}>
              {"\u20B9"}{pendingAmount.toLocaleString()}
            </Text>
            <Text style={styles.settlementText}>
              Settlement by 22 Sep 2026
            </Text>
          </View>

          <View style={styles.settlementInfo}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={Colors.textSecondary}
            />
            <Text style={styles.settlementInfoText}>
              Payouts are processed every Monday. Amounts pending for more than
              7 days are auto-settled.
            </Text>
          </View>
        </View>
      )}

      {activeTab === "payouts" && (
        <View style={styles.payoutsSection}>
          {payments.map((payout: any) => (
            <View key={payout._id} style={styles.payoutItem}>
              <View style={styles.payoutLeft}>
                <View style={styles.payoutIcon}>
                  <Ionicons
                    name={
                      payout.status === "completed"
                        ? "checkmark-circle"
                        : payout.status === "pending"
                        ? "time"
                        : "close-circle"
                    }
                    size={20}
                    color={STATUS_COLORS[payout.status]}
                  />
                </View>
                <View>
                  <Text style={styles.payoutAmount}>
                    {"\u20B9"}{payout.amount?.toLocaleString()}
                  </Text>
                  <Text style={styles.payoutDate}>{payout.createdAt?.split("T")[0] ?? ""}</Text>
                </View>
              </View>
              {renderStatusBadge(payout.status)}
            </View>
          ))}
        </View>
      )}

      <View style={styles.bankSection}>
        <View style={styles.bankHeader}>
          <Ionicons name="business-outline" size={20} color={Colors.primary} />
          <Text style={styles.bankTitle}>Bank Account</Text>
        </View>
        <View style={styles.bankDetails}>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Account Holder</Text>
            <Text style={styles.bankValue}>Rajesh Kumar</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Bank</Text>
            <Text style={styles.bankValue}>State Bank of India</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Account No.</Text>
            <Text style={styles.bankValue}>****4567</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>IFSC</Text>
            <Text style={styles.bankValue}>SBIN0001234</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.changeBankButton} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.changeBankText}>Change Bank Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    marginTop: Platform.OS === "ios" ? Spacing.xxl : Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
  },
  totalCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  totalLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  deductionValue: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: "#EF4444",
  },
  netLabel: {
    fontSize: FontSize.md,
    fontWeight: "700",
    color: Colors.text,
  },
  netValue: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  walletSection: {
    gap: Spacing.md,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  balanceTitle: {
    fontSize: FontSize.sm,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.md,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pendingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.xs,
  },
  pendingTitle: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  pendingAmount: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  settlementText: {
    fontSize: FontSize.xs,
    color: "#F59E0B",
    fontWeight: "500",
  },
  settlementInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settlementInfoText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  payoutsSection: {
    gap: Spacing.sm,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  payoutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  payoutAmount: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  payoutDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  bankSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
  },
  bankTitle: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  bankDetails: {
    gap: Spacing.sm,
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  bankLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  bankValue: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  changeBankButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  changeBankText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.primary,
  },
});

export default EarningsScreen;

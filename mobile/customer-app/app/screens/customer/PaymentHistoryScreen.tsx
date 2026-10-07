import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { Badge, EmptyState } from "../../../components/ui";
import { usePayments } from "../../../hooks/use-api";

const TABS = ["All", "Online", "Cash"];

export default function CustomerPaymentHistoryScreen({ navigation }: any) {
  const { data: paymentsRes, isLoading, refetch } = usePayments({ limit: 50 });
  const [activeTab, setActiveTab] = useState("All");

  const payments = useMemo(() => {
    return Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];
  }, [paymentsRes]);

  const filteredPayments = useMemo(() => {
    if (activeTab === "Online") {
      return payments.filter((p: any) => p.paymentMethod !== "cash");
    }
    if (activeTab === "Cash") {
      return payments.filter((p: any) => p.paymentMethod === "cash");
    }
    return payments;
  }, [payments, activeTab]);

  const totalSpent = useMemo(() => {
    return payments
      .filter((p: any) => p.status === "completed" || p.status === "paid")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const renderPaymentItem = ({ item }: { item: any }) => {
    const isCash = item.paymentMethod === "cash";
    const isCompleted = item.status === "completed" || item.status === "paid";
    const dateStr = item.createdAt;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recent";

    const jobNumber = item.jobId?.jobNumber || (typeof item.jobId === "string" ? item.jobId.slice(-6) : "KD-ORDER");
    const workerName = item.workerId?.name || "Assigned Technician";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.methodIconWrap,
                { backgroundColor: isCash ? Colors.accent + "18" : Colors.primary + "18" },
              ]}
            >
              <Ionicons
                name={isCash ? "cash-outline" : "card-outline"}
                size={20}
                color={isCash ? Colors.accent : Colors.primary}
              />
            </View>
            <View>
              <Text style={styles.jobNumberText}>Job #{jobNumber}</Text>
              <Text style={styles.workerNameText}>{workerName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.amountText}>₹{(item.amount || 0).toLocaleString("en-IN")}</Text>
            <Badge
              label={isCompleted ? "SETTLED" : item.status?.toUpperCase() || "PENDING"}
              variant={isCompleted ? "success" : "warning"}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Payment Method</Text>
            <Text style={styles.metaValue}>
              {isCash ? "Cash on Service" : `${(item.paymentMethod || "Online").toUpperCase()} UPI/NetBanking`}
            </Text>
          </View>
          <View style={[styles.metaCol, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Date & Time</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>
        </View>

        {item.transactionId && (
          <View style={styles.txRow}>
            <Text style={styles.txLabel}>Transaction Reference:</Text>
            <Text style={styles.txValue} numberOfLines={1}>
              {item.transactionId}
            </Text>
          </View>
        )}

        {item.jobId?._id && (
          <TouchableOpacity
            style={styles.viewJobBtn}
            onPress={() => navigation.navigate("JobDetail", { jobId: item.jobId._id })}
            activeOpacity={0.7}
          >
            <Text style={styles.viewJobBtnText}>View Service Invoice & Details</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Lifetime Spent Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Total Payments Settled</Text>
          <Text style={styles.summaryValue}>₹{totalSpent.toLocaleString("en-IN")}</Text>
        </View>
        <View style={styles.summaryIconWrap}>
          <Ionicons name="receipt-outline" size={24} color={Colors.white} />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Payments List */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item: any) => item._id}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="card-outline"
            title="No Payments Recorded"
            description="Your paid service receipts and transaction history will appear here once orders are settled."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  summaryCard: {
    margin: Spacing.base,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.md,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: "#FCE7F3",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.white,
    marginTop: 4,
  },
  summaryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tabBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  jobNumberText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  workerNameText: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  amountText: {
    fontSize: FontSize.base,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  metaValue: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
    backgroundColor: Colors.background,
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  txLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  txValue: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    fontWeight: "600",
    flex: 1,
  },
  viewJobBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewJobBtnText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
});

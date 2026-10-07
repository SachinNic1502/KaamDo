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
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../constants";
import { Badge, EmptyState } from "../../../components/ui";
import { usePayoutHistory } from "../../../hooks/use-api";

const TABS = ["All", "Completed", "Processing"];

export const PayoutHistoryScreen = ({ navigation }: any) => {
  const { data: payouts = [], isLoading, refetch } = usePayoutHistory();
  const [activeTab, setActiveTab] = useState("All");

  const filteredPayouts = useMemo(() => {
    if (activeTab === "Completed") {
      return payouts.filter((p) => p.status === "completed" || p.status === "paid");
    }
    if (activeTab === "Processing") {
      return payouts.filter((p) => p.status !== "completed" && p.status !== "paid");
    }
    return payouts;
  }, [payouts, activeTab]);

  const totalSettled = useMemo(() => {
    return payouts
      .filter((p) => p.status === "completed" || p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payouts]);

  const renderPayoutItem = ({ item }: { item: any }) => {
    const isCompleted = item.status === "completed" || item.status === "paid";
    const isFailed = item.status === "failed";
    const dateStr = item.payoutDate || item.createdAt;
    const formattedDate = dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recent";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.methodBadgeWrap}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isCompleted
                    ? Colors.success + "15"
                    : isFailed
                    ? Colors.error + "15"
                    : Colors.warning + "15",
                },
              ]}
            >
              <Ionicons
                name={
                  item.paymentMethod?.toLowerCase().includes("upi")
                    ? "qr-code-outline"
                    : "business-outline"
                }
                size={20}
                color={
                  isCompleted
                    ? Colors.success
                    : isFailed
                    ? Colors.error
                    : Colors.warning
                }
              />
            </View>
            <View>
              <Text style={styles.methodName}>
                {item.paymentMethod || "Bank Settlement"}
              </Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.amountWrap}>
            <Text style={styles.amountText}>
              ₹{(item.amount || 0).toLocaleString("en-IN")}
            </Text>
            <Badge
              label={item.status?.toUpperCase() || "SUBMITTED"}
              variant={isCompleted ? "success" : isFailed ? "error" : "warning"}
              size="sm"
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Reference / ID</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {item.transactionReference || item._id}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payout History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Total Settled Payouts</Text>
          <Text style={styles.summaryValue}>
            ₹{totalSettled.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.summaryBadge}>
          <Ionicons name="checkmark-done-circle" size={16} color={Colors.white} />
          <Text style={styles.summaryBadgeText}>Verified</Text>
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

      {/* List */}
      <FlatList
        data={filteredPayouts}
        keyExtractor={(item) => item._id}
        renderItem={renderPayoutItem}
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
            icon="wallet-outline"
            title="No Settlements Found"
            description="Your completed and processing withdrawal transactions will appear here."
          />
        }
      />
    </SafeAreaView>
  );
};

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
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  summaryBadgeText: {
    fontSize: FontSize.xxs,
    fontWeight: "700",
    color: Colors.white,
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
  methodBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  methodName: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  amountWrap: {
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
    alignItems: "center",
  },
  metaLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  metaValue: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    fontWeight: "600",
    maxWidth: "65%",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { fetchPromos, PromoCode } from "../../../services/promo";
import { AppHeader, Card, useToast } from "../../../components/ui";

export default function CustomerPromoScreen({ navigation }: any) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchPromos()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) setPromos(res.data);
      })
      .catch(() => {});
  }, []);

  const handleCopy = (code: string) => {
    toast.success("Promo Copied!", `Code "${code}" is ready to paste at checkout.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Offers & Coupons" subtitle="Save on your home services" showBack onBack={() => navigation.goBack()} />

      <FlatList
        data={promos}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.couponCard}>
            <View style={styles.couponLeft}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountValue}>
                  {item.discountType === "percentage"
                    ? `${item.discountValue}% OFF`
                    : `₹${item.discountValue} OFF`}
                </Text>
              </View>
              <Text style={styles.couponCode}>{item.code}</Text>
              <Text style={styles.couponDesc}>{item.description}</Text>
              <Text style={styles.couponMin}>
                Min. booking: ₹{item.minOrderValue}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopy(item.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.copyText}>COPY</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.base,
    borderStyle: "dashed",
    borderColor: Colors.primaryMuted,
  },
  couponLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  discountBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginBottom: 6,
  },
  discountValue: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.primary,
  },
  couponCode: {
    fontSize: FontSize.base,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  couponDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  couponMin: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 4,
  },
  copyBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  copyText: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    color: Colors.primary,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize } from "../../constants";
import { getActivePromos, PromoCode } from "../../services/promo";

export default function PromoScreen({ navigation }: any) {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      const data = await getActivePromos();
      setPromos(data);
    } catch (error) {
      console.warn("Failed to load promos");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    Alert.alert("Code Copied", `${code} copied to clipboard`);
  };

  const renderPromo = ({ item }: { item: PromoCode }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoHeader}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {item.discountType === "percentage" ? `${item.discountValue}% OFF` : `\u20B9${item.discountValue} OFF`}
          </Text>
        </View>
        <View style={styles.promoCodeContainer}>
          <Text style={styles.promoCode}>{item.code}</Text>
          <TouchableOpacity onPress={() => handleCopyCode(item.code)}>
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      {item.minOrder && (
        <Text style={styles.promoDetail}>Min. order: \u20B9{item.minOrder}</Text>
      )}
      {item.maxDiscount && (
        <Text style={styles.promoDetail}>Max discount: \u20B9{item.maxDiscount}</Text>
      )}
      <Text style={styles.promoDetail}>Valid until: {new Date(item.validUntil).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Offers & Promos</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading offers...</Text>
        </View>
      ) : promos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="pricetag-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No active offers</Text>
          <Text style={styles.emptyText}>Check back later for exclusive deals</Text>
        </View>
      ) : (
        <FlatList
          data={promos}
          renderItem={renderPromo}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
  listContent: { padding: Spacing.lg },
  promoCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  promoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  discountBadge: { backgroundColor: Colors.primary + "15", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 8 },
  discountText: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.primary },
  promoCodeContainer: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  promoCode: { fontSize: FontSize.md, fontWeight: "700", color: Colors.text, letterSpacing: 1 },
  promoDetail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text, marginTop: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
});

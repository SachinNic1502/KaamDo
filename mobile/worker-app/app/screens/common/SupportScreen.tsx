import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../../utils/constants";
import { AppHeader, Card, LogoWordmark } from "../../../components/ui";

const PARTNER_FAQS = [
  {
    q: "How and when do I receive my earnings payout?",
    a: "Payouts are automatically transferred every Tuesday to your linked bank account. You can also trigger an On-Demand Cashout anytime from the Earnings tab for immediate transfer.",
  },
  {
    q: "What if the customer enters an incorrect Start OTP?",
    a: "Ask the customer to open their active booking in the KaamDo app to check their 4-digit security code. If the code still fails, tap 'Report Issue' or contact the Partner Desk for immediate manual clearance.",
  },
  {
    q: "How do I expand my service radius?",
    a: "Go to Profile > Skills & Rates, where you can adjust your Base Locality and choose a Dispatch Radius from 5 km up to 50 km. Jobs within your chosen radius will be broadcasted to you.",
  },
  {
    q: "What should I do if a customer asks for extra work?",
    a: "Never start unbilled extra work. Use 'Add Additional Charge' on the active Job screen to itemize extra labor or materials so the customer approves it before invoice generation.",
  },
];

export default function WorkerSupportScreen({ navigation }: any) {
  const handleCall = () => {
    Linking.openURL("tel:+911140845500");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/919876543210?text=Hi%20KaamDo%20Partner%20Desk");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:partners@kaamdo.in");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader
        title="Partner Support Desk"
        subtitle="24x7 Trade Partner Assistance"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Contact Channels */}
        <Text style={styles.sectionTitle}>Priority Partner Channels</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primarySubtle }]}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>Emergency Partner Helpline</Text>
              <Text style={styles.contactSub}>+91 11 4084 5500 (Priority Toll-Free, 24x7)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.accentSubtle }]}>
              <Ionicons name="chatbubbles" size={20} color={Colors.accent} />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>Partner WhatsApp Desk</Text>
              <Text style={styles.contactSub}>Instant document verification & dispute chat</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.primaryLight2 }]}>
              <Ionicons name="mail" size={20} color={Colors.primaryDark} />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>Settlements & Accounts Email</Text>
              <Text style={styles.contactSub}>partners@kaamdo.in (Response within 2h)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Partner FAQs</Text>
        <Card style={styles.card}>
          {PARTNER_FAQS.map((faq, idx) => (
            <React.Fragment key={faq.q}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.faqItem}>
                <Text style={styles.faqQ}>{faq.q}</Text>
                <Text style={styles.faqA}>{faq.a}</Text>
              </View>
            </React.Fragment>
          ))}
        </Card>

        <View style={styles.footerBrandWrap}>
          <LogoWordmark width={116} />
          <Text style={styles.footerNote}>
            KaamDo India • 24x7 Verified Partner Desk
          </Text>
        </View>
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
    paddingBottom: 115,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: 0,
    overflow: "hidden",
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  contactMeta: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactTitle: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  contactSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  faqItem: {
    padding: Spacing.base,
  },
  faqQ: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  faqA: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footerBrandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: 6,
  },
  footerNote: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

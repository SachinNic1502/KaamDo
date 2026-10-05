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
import { Colors, Spacing, FontSize, BorderRadius } from "../../../utils/constants";
import { AppHeader, Card, LogoWordmark } from "../../../components/ui";

export default function CustomerSupportScreen({ navigation }: any) {
  const handleCall = () => {
    Linking.openURL("tel:+911140845500");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/919876543210?text=Hi%20KaamDo%20Support");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@kaamdo.in");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <AppHeader title="Help & Support" subtitle="24x7 Customer Assistance" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Contact Channels */}
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.contactItem} onPress={handleCall} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>National Helpline</Text>
              <Text style={styles.contactSub}>+91 11 4084 5500 (Toll-Free, 7 AM - 11 PM)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>WhatsApp Support</Text>
              <Text style={styles.contactSub}>Instant chat assistance with support agents</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.accentLight }]}>
              <Ionicons name="mail" size={20} color={Colors.accent} />
            </View>
            <View style={styles.contactMeta}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>support@kaamdo.in (Response within 2h)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Frequently Asked Questions</Text>
        <Card style={styles.card}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>When do I pay for my booking?</Text>
            <Text style={styles.faqA}>
              You never pay upfront. Once your technician arrives and finishes the work, inspect it and verify with your Completion OTP before paying online or via cash.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Are the technicians background verified?</Text>
            <Text style={styles.faqA}>
              Yes. All trade professionals on KaamDo undergo Aadhaar identity check, criminal background verification, and skill evaluations before onboarding.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>What if I need to cancel my service?</Text>
            <Text style={styles.faqA}>
              You can cancel for free anytime before the technician starts journey or arrives at your location.
            </Text>
          </View>
        </Card>

        <View style={styles.footerBrandWrap}>
          <LogoWordmark width={116} />
          <Text style={styles.footerNote}>
            KaamDo India • 24x7 Customer Helpdesk
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
    paddingBottom: Spacing.xxxl,
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
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
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
    fontSize: FontSize.xxs,
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
    fontSize: FontSize.xs + 1,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  faqA: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
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

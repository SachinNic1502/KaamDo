import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { Modal, PrimaryButton } from "../ui";
import { OtpBoxInput } from "./OtpBoxInput";

export interface CompletionOtpModalProps {
  visible: boolean;
  onClose: () => void;
  otp: string;
  setOtp: (val: string) => void;
  onVerify: () => void;
  isPending: boolean;
  customerName?: string;
  totalAmount: number;
  demoOtp?: string;
}

export const CompletionOtpModal: React.FC<CompletionOtpModalProps> = ({
  visible,
  onClose,
  otp,
  setOtp,
  onVerify,
  isPending,
  customerName,
  totalAmount,
  demoOtp = "5678",
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Job Completion & Settlement"
    >
      <View style={styles.modalBody}>
        <View style={styles.otpHeaderHero}>
          <View style={styles.otpHeroBadgeComplete}>
            <Ionicons name="checkmark-done-circle" size={28} color={Colors.secondary} />
          </View>
          <Text style={styles.otpHeroTitle}>Work Approved PIN</Text>
          <Text style={styles.otpHeroSub}>
            Enter the 4-digit completion code provided by {customerName ? <Text style={styles.boldText}>{customerName}</Text> : "the customer"} after inspecting and approving your work.
          </Text>
        </View>

        <View style={styles.payoutHighlightCard}>
          <View style={styles.payoutHighlightInfo}>
            <Text style={styles.payoutHighlightLabel}>Earnings to Credit</Text>
            <Text style={styles.payoutHighlightSub}>
              Credited to pending balance instantly
            </Text>
          </View>
          <Text style={styles.payoutHighlightAmt}>
            ₹{totalAmount.toLocaleString("en-IN")}
          </Text>
        </View>

        <OtpBoxInput
          value={otp}
          onChange={setOtp}
          accentColor={Colors.secondary}
          accentBg={Colors.secondaryLight}
        />

        {Boolean(__DEV__ || demoOtp) && (
          <TouchableOpacity
            style={styles.demoFillChip}
            onPress={() => setOtp(String(demoOtp))}
            activeOpacity={0.7}
          >
            <Ionicons name="flash" size={13} color={Colors.secondary} />
            <Text style={styles.demoFillChipText}>
              Quick-fill Demo Code: {demoOtp}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.otpNoticeStripAccent}>
          <Ionicons name="shield-checkmark-outline" size={15} color={Colors.secondaryDark} />
          <Text style={styles.otpNoticeTextAccent}>
            Ensure the customer is fully satisfied and work premises are cleared.
          </Text>
        </View>

        <View style={styles.modalActionsStack}>
          <PrimaryButton
            title="Verify & Settle Job"
            icon="checkmark-circle"
            onPress={onVerify}
            loading={isPending}
            disabled={otp.length < 4}
          />
          <TouchableOpacity
            style={styles.modalSecondaryDismiss}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.modalSecondaryDismissText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBody: {
    paddingTop: Spacing.xs,
  },
  otpHeaderHero: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  otpHeroBadgeComplete: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs + 2,
    ...Shadows.sm,
  },
  otpHeroTitle: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  otpHeroSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: Spacing.xs,
  },
  boldText: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  payoutHighlightCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  payoutHighlightInfo: {
    flex: 1,
  },
  payoutHighlightLabel: {
    fontSize: FontSize.xxs,
    fontWeight: "800",
    color: Colors.secondaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  payoutHighlightSub: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  payoutHighlightAmt: {
    fontSize: FontSize.lg,
    fontWeight: "800",
    color: Colors.secondaryDark,
    marginLeft: Spacing.sm,
  },
  demoFillChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginTop: 2,
    marginBottom: Spacing.xs,
    gap: 5,
  },
  demoFillChipText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.secondaryDark,
  },
  otpNoticeStripAccent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    gap: 8,
  },
  otpNoticeTextAccent: {
    flex: 1,
    fontSize: FontSize.xxs + 1,
    color: Colors.secondaryDark,
    lineHeight: 16,
  },
  modalActionsStack: {
    width: "100%",
    gap: Spacing.xs,
  },
  modalSecondaryDismiss: {
    alignItems: "center",
    paddingVertical: 8,
  },
  modalSecondaryDismissText: {
    fontSize: FontSize.xs + 1,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});

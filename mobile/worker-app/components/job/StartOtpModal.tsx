import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from "../../constants";
import { Modal, PrimaryButton } from "../ui";
import { OtpBoxInput } from "./OtpBoxInput";

export interface StartOtpModalProps {
  visible: boolean;
  onClose: () => void;
  otp: string;
  setOtp: (val: string) => void;
  onVerify: () => void;
  isPending: boolean;
  customerName?: string;
  customerPhone?: string;
  demoOtp?: string;
}

export const StartOtpModal: React.FC<StartOtpModalProps> = ({
  visible,
  onClose,
  otp,
  setOtp,
  onVerify,
  isPending,
  customerName,
  customerPhone,
  demoOtp = "1234",
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="On-Site Arrival Verification"
    >
      <View style={styles.modalBody}>
        <View style={styles.otpHeaderHero}>
          <View style={styles.otpHeroBadgeStart}>
            <Ionicons name="shield-checkmark" size={26} color={Colors.primary} />
          </View>
          <Text style={styles.otpHeroTitle}>Customer Arrival PIN</Text>
          <Text style={styles.otpHeroSub}>
            Ask {customerName ? <Text style={styles.boldText}>{customerName}</Text> : "the customer"} for the 4-digit code shown on their KaamDo screen to officially begin work.
          </Text>
        </View>

        {customerPhone ? (
          <View style={styles.customerContextStrip}>
            <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.customerContextText}>
              Client: {customerName || "Customer"} • +91 {customerPhone}
            </Text>
          </View>
        ) : null}

        <OtpBoxInput
          value={otp}
          onChange={setOtp}
          accentColor={Colors.primary}
          accentBg={Colors.primaryLight}
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

        <View style={styles.otpNoticeStrip}>
          <Ionicons name="time-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.otpNoticeText}>
            The job warranty and service timer activate immediately once verified.
          </Text>
        </View>

        <View style={styles.modalActionsStack}>
          <PrimaryButton
            title="Verify & Start Job"
            icon="play-circle"
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
  otpHeroBadgeStart: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
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
  customerContextStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  customerContextText: {
    fontSize: FontSize.xxs + 1,
    fontWeight: "600",
    color: Colors.primary,
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
  otpNoticeStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    gap: 8,
  },
  otpNoticeText: {
    flex: 1,
    fontSize: FontSize.xxs + 1,
    color: Colors.textSecondary,
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

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "../../constants";
import { Modal, Input, PrimaryButton } from "../ui";

export interface AddChargeModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  setAmount: (val: string) => void;
  reason: string;
  setReason: (val: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const AddChargeModal: React.FC<AddChargeModalProps> = ({
  visible,
  onClose,
  amount,
  setAmount,
  reason,
  setReason,
  onSubmit,
  isPending,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Add Extra Labor Charge"
    >
      <View style={styles.modalBody}>
        <Text style={styles.modalSub}>
          Itemize unforeseen extra labor required. The customer will be prompted to approve or reject this charge.
        </Text>
        <Input
          label="Additional Amount (₹)"
          placeholder="e.g. 350"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <Input
          label="Labor Reason Description"
          placeholder="e.g. High-ceiling ladder work / Heavy wall chiseling"
          value={reason}
          onChangeText={setReason}
        />
        <PrimaryButton
          title="Request Customer Approval"
          onPress={onSubmit}
          loading={isPending}
          style={{ marginTop: Spacing.md }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBody: {
    paddingTop: Spacing.xs,
  },
  modalSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
});

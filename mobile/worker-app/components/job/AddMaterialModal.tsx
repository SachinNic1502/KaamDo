import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, FontSize } from "../../constants";
import { Modal, Input, PrimaryButton } from "../ui";

export interface AddMaterialModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  setName: (val: string) => void;
  qty: string;
  setQty: (val: string) => void;
  unitPrice: string;
  setUnitPrice: (val: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  visible,
  onClose,
  name,
  setName,
  qty,
  setQty,
  unitPrice,
  setUnitPrice,
  onSubmit,
  isPending,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Add Part / Hardware"
    >
      <View style={styles.modalBody}>
        <Text style={styles.modalSub}>
          Itemize replacement parts or materials purchased for this service.
        </Text>
        <Input
          label="Part / Hardware Name"
          placeholder="e.g. 32A MCB, Brass Ball Valve, 5m Wire"
          value={name}
          onChangeText={setName}
        />
        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Quantity"
              placeholder="1"
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <Input
              label="Unit Price (₹)"
              placeholder="e.g. 250"
              value={unitPrice}
              onChangeText={setUnitPrice}
              keyboardType="numeric"
            />
          </View>
        </View>
        <PrimaryButton
          title="Add Part to Invoice"
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

import RazorpayCheckout from "react-native-razorpay";
import { Alert, Linking } from "react-native";
import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "../types";
export type PaymentProvider = "razorpay" | "cashfree";
interface PaymentOptions {
  jobId: string; amount: number; currency?: string; customerName: string;
  customerPhone: string; customerEmail?: string; description?: string; provider?: PaymentProvider;
}
interface Checkout { orderId: string; amount: number; currency: string; keyId: string; sessionId: string; environment: string; }
export async function initiatePayment(options: PaymentOptions): Promise<void> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  const provider = options.provider ?? "razorpay";
  const response = await api.post<ApiResponse<Checkout>>("/api/payments", { action: "create-order", jobId: options.jobId, provider }, token);
  const order = response.data;
  if (!order?.orderId || !Number.isSafeInteger(order.amount) || order.amount <= 0) throw new Error("Invalid payment order");
  let proof = {};
  if (provider === "razorpay") {
    if (!order.keyId) throw new Error("Checkout is not configured");
    const result = await RazorpayCheckout.open({
      description: options.description || "KaamDo Service Payment", currency: order.currency,
      key: order.keyId, amount: order.amount, order_id: order.orderId, name: "KaamDo",
      prefill: { name: options.customerName, contact: options.customerPhone, email: options.customerEmail || "" }, theme: { color: "#2563EB" },
    });
    proof = result;
  } else {
    if (!order.sessionId) throw new Error("Checkout session unavailable");
    const base = process.env.EXPO_PUBLIC_API_URL;
    if (!base) throw new Error("API URL is not configured");
    await Linking.openURL(`${base}/checkout/cashfree#session=${encodeURIComponent(order.sessionId)}&mode=${order.environment}`);
    await new Promise<void>((resolve, reject) => Alert.alert("Cashfree payment", "Complete payment in the browser, return here, then check payment status.", [
      { text: "Later", onPress: () => reject(new Error("Payment confirmation pending. Check payment history before retrying.")) },
      { text: "Check payment", onPress: () => resolve() },
    ], { cancelable: false }));
  }
  const verified = await api.post<ApiResponse<{ status: string }>>("/api/payments", { ...proof, action: "verify", jobId: options.jobId, provider }, token);
  if (verified.data?.status !== "completed") throw new Error("Payment confirmation pending. Check payment history before retrying.");
}
export function formatCurrency(amount: number): string { return `₹${amount.toLocaleString("en-IN")}`; }

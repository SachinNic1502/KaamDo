import RazorpayCheckout from "react-native-razorpay";
import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

interface PaymentOptions {
  jobId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export async function initiatePayment(options: PaymentOptions): Promise<PaymentResult> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");

  const orderRes = await api.post<{ data: { orderId: string; amount: number; currency: string } }>(
    "/api/payments",
    {
      action: "create-order",
      jobId: options.jobId,
      amount: options.amount,
    },
    token
  );

  const orderData = orderRes.data;

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      description: options.description || "KaamDo Service Payment",
      image: "https://via.placeholder.com/100",
      currency: orderData?.currency || "INR",
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: orderData?.amount || options.amount * 100,
      order_id: orderData?.orderId,
      name: "KaamDo",
      prefill: {
        name: options.customerName,
        contact: options.customerPhone,
        email: options.customerEmail || "",
      },
      theme: {
        color: "#2563EB",
      },
    };

    RazorpayCheckout.open(razorpayOptions as any)
      .then(async (result: PaymentResult) => {
        try {
          await api.post(
            "/api/payments",
            {
              action: "verify",
              jobId: options.jobId,
              razorpay_payment_id: result.razorpay_payment_id,
              razorpay_order_id: result.razorpay_order_id,
              razorpay_signature: result.razorpay_signature,
            },
            token
          );
        } catch (err) {
          console.warn("Payment verification failed:", err);
        }
        resolve(result);
      })
      .catch((error: any) => {
        reject(new Error(error.description || "Payment failed"));
      });
  });
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

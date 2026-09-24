import { ApiError } from "../api-error";

export async function deliverOtp(phone: string, otp: string): Promise<void> {
  const endpoint = process.env.OPENWA_SEND_TEXT_URL;
  const key = process.env.OPENWA_API_KEY;
  if (!endpoint || !key) throw new ApiError(503, "WhatsApp OTP delivery is not configured", "OTP_DELIVERY_UNAVAILABLE");
  const digits = phone.replace(/^\+/, "");
  const to = `${digits.length === 10 ? "91" + digits : digits}@c.us`;
  const args = { to, content: `Your KaamDo login code is ${otp}. It expires in 5 minutes. Do not share this code.` };
  try {
    const response = await fetch(endpoint, {
      method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/json", api_key: key, "X-API-Key": key },
      body: JSON.stringify(process.env.OPENWA_API_VERSION === "5" ? { to, text: args.content } : { args }),
    });
    const result = await response.json();
    if (!response.ok || result.success === false || typeof (result.data ?? result) !== "string" || !(result.data ?? result)) throw new Error("Delivery rejected");
  } catch { throw new ApiError(503, "Unable to deliver WhatsApp OTP. Please try again later.", "OTP_DELIVERY_UNAVAILABLE"); }
}

import { verifyJWT } from "./auth";
import { connectDB } from "./db";
import User from "./models/user.model";

export interface AuthUser {
  userId: string;
  role: string;
  phone: string;
}

export async function authenticateToken(token: string): Promise<AuthUser | null> {
  try {
    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload || typeof payload.userId !== "string" ||
      !/^[a-f\d]{24}$/i.test(payload.userId)) return null;

    await connectDB();
    const account = await User.findById(payload.userId)
      .select("_id role phone isActive passwordChangedAt sessionVersion")
      .lean();
    if (!account || !account.isActive ||
      !["customer", "worker", "contractor", "admin"].includes(account.role) ||
      account.role !== payload.role || (account.sessionVersion ?? 0) !== (payload.sessionVersion ?? 0)) return null;

    const issuedAt = (payload as typeof payload & { iat?: number }).iat;
    if (account.passwordChangedAt &&
      (typeof issuedAt !== "number" ||
        issuedAt * 1000 <= new Date(account.passwordChangedAt).getTime())) return null;

    return {
      userId: String(account._id),
      role: account.role,
      phone: account.phone,
    };
  } catch {
    return null;
  }
}


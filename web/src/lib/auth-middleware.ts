import { NextRequest } from "next/server";
import { verifyJWT } from "./auth";
import { errorResponse } from "./api-response";

export interface AuthUser {
  userId: string;
  role: string;
  phone: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("token")?.value;

    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload) return null;

    return {
      userId: payload.userId as string,
      role: payload.role as string,
      phone: payload.phone as string,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(request: NextRequest, roles: string[]) {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

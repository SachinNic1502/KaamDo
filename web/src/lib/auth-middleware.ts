import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, AuthUser } from "./auth-session";
export { authenticateToken } from "./auth-session";
export type { AuthUser } from "./auth-session";
import { errorResponse } from "./api-response";
import { Permission, hasPermission, canPerformAction, canAccessRoute } from "./rbac/permissions";
import { ApiError } from "./api-error";

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization
      ? /^Bearer ([^\s]+)$/i.exec(authorization)?.[1]
      : request.cookies.get("token")?.value;

    return token ? authenticateToken(token) : null;
  } catch { return null; }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new ApiError(401, "Unauthorized", "UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(request: NextRequest, roles: string[]): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "Forbidden", "FORBIDDEN");
  }
  return user;
}

/**
 * Require specific permission
 */
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<NextResponse | null> {
  try {
    const user = await requireAuth(request);

    const knownPermission = Object.values(Permission).find((value) => value === permission);
    if (!knownPermission || !hasPermission(user.role, knownPermission)) {
      return errorResponse("Forbidden: Insufficient permissions", 403);
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

/**
 * Require ability to perform action on resource
 */
export async function requireAction(
  request: NextRequest,
  resource: string,
  action: string
): Promise<NextResponse | null> {
  try {
    const user = await requireAuth(request);

    if (!canPerformAction(user.role, resource, action)) {
      return errorResponse(
        `Forbidden: Cannot perform ${action} on ${resource}`,
        403
      );
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

/**
 * Require admin role
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  try {
    const user = await requireAuth(request);
    if (user.role !== "admin") {
      return errorResponse("Forbidden: Admin access required", 403);
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    return errorResponse("Internal server error", 500);
  }
}

/**
 * Check if user can access specific route
 */
export function checkRouteAccess(role: string, route: string): boolean {
  return canAccessRoute(role, route);
}

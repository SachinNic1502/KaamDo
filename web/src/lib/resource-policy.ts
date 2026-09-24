import type { AuthUser } from "./auth-middleware";
import { ApiError } from "./api-error";

export function resourceScope(user: AuthUser, resource: "jobs" | "projects" | "attendance" | "disputes"): Record<string, string> {
  if (user.role === "admin") return {};
  if (resource === "disputes" && ["customer", "worker", "contractor"].includes(user.role)) {
    return { raisedBy: user.userId };
  }
  if (user.role === "customer") return { customerId: user.userId };
  if (resource === "projects" && user.role === "contractor") return { contractorId: user.userId };
  if ((resource === "jobs" || resource === "attendance") && user.role === "worker") return { workerId: user.userId };
  throw new ApiError(403, "Forbidden", "FORBIDDEN");
}

import { ApiError } from "./api-error";
const transitions: Record<string, string[]> = {
  worker_assigned: ["worker_accepted", "rejected", "cancelled"],
  worker_accepted: ["on_the_way", "cancelled"],
  on_the_way: ["arrived", "cancelled"],
  arrived: ["work_started", "cancelled"],
  work_started: ["in_progress", "completion_requested"],
  in_progress: ["completion_requested"],
  completion_requested: ["completed"],
  searching: ["cancelled"],
};
export function assertJobTransition(from: string, to: string, role: string) {
  const allowed = role === "customer" ? ["cancelled", "completed"] : role === "worker" ? ["worker_accepted", "rejected", "on_the_way", "arrived", "work_started", "in_progress", "completion_requested"] : [];
  if (!allowed.includes(to) || !transitions[from]?.includes(to)) throw new ApiError(409, "This job transition is not allowed", "INVALID_JOB_STATE");
}

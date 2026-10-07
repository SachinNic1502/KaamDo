import { ApiError } from "./api-error";

const transitions: Record<string, string[]> = {
  draft: ["searching", "worker_assigned", "cancelled"],
  searching: ["worker_assigned", "worker_accepted", "cancelled"],
  worker_assigned: ["worker_accepted", "rejected", "cancelled"],
  worker_accepted: ["on_the_way", "cancelled"],
  on_the_way: ["arrived", "cancelled"],
  arrived: ["work_started", "cancelled"],
  work_started: ["in_progress", "completion_requested", "completed"],
  in_progress: ["completion_requested", "completed"],
  completion_requested: ["completed", "rework_requested"],
  rework_requested: ["work_started", "in_progress", "completion_requested"],
  completed: ["payment_pending", "paid", "closed", "disputed"],
  payment_pending: ["paid", "rework_requested", "disputed"],
  paid: ["closed", "disputed"],
  closed: ["disputed"],
  rejected: ["searching", "worker_assigned", "cancelled"],
};

export function assertJobTransition(from: string, to: string, role: string) {
  const allowed =
    role === "customer"
      ? ["cancelled", "completed", "rework_requested", "paid", "closed", "disputed"]
      : role === "worker"
      ? [
          "worker_accepted",
          "rejected",
          "on_the_way",
          "arrived",
          "work_started",
          "in_progress",
          "completion_requested",
          "completed",
          "disputed",
        ]
      : [
          "draft",
          "searching",
          "worker_assigned",
          "worker_accepted",
          "rejected",
          "on_the_way",
          "arrived",
          "work_started",
          "in_progress",
          "waiting_approval",
          "completion_requested",
          "rework_requested",
          "completed",
          "payment_pending",
          "paid",
          "closed",
          "cancelled",
          "disputed",
          "refunded",
        ];

  if (!allowed.includes(to) || !transitions[from]?.includes(to)) {
    throw new ApiError(
      409,
      `Transition from '${from}' to '${to}' is not allowed for role '${role}'`,
      "INVALID_JOB_STATE"
    );
  }
}

export interface StatusColors {
  bg: string
  text: string
}

export const roleColors: Record<string, StatusColors> = {
  customer: { bg: "bg-purple-100", text: "text-purple-800" },
  worker: { bg: "bg-orange-100", text: "text-orange-800" },
  contractor: { bg: "bg-cyan-100", text: "text-cyan-800" },
  admin: { bg: "bg-gray-100", text: "text-gray-800" },
}

export const jobStatusColors: Record<string, StatusColors> = {
  completed: { bg: "bg-green-100", text: "text-green-800" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
  worker_assigned: { bg: "bg-purple-100", text: "text-purple-800" },
  searching: { bg: "bg-yellow-100", text: "text-yellow-800" },
  disputed: { bg: "bg-red-100", text: "text-red-800" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-800" },
  payment_pending: { bg: "bg-orange-100", text: "text-orange-800" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  processing: { bg: "bg-blue-100", text: "text-blue-800" },
  failed: { bg: "bg-red-100", text: "text-red-800" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  eligible: { bg: "bg-purple-100", text: "text-purple-800" },
}

export const paymentStatusColors: Record<string, StatusColors> = {
  completed: { bg: "bg-green-100", text: "text-green-800" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  processing: { bg: "bg-blue-100", text: "text-blue-800" },
  failed: { bg: "bg-red-100", text: "text-red-800" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  eligible: { bg: "bg-purple-100", text: "text-purple-800" },
}

export function getRoleBadgeClass(role: string): string {
  const color = roleColors[role]
  if (!color) return "bg-gray-100 text-gray-800"
  return `${color.bg} ${color.text}`
}

export function getStatusBadgeClass(status: string, type: "job" | "payment" = "job"): string {
  const colors = type === "payment" ? paymentStatusColors : jobStatusColors
  const color = colors[status]
  if (!color) return "bg-gray-100 text-gray-800"
  return `${color.bg} ${color.text}`
}
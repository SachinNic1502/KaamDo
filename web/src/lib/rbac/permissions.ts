/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for each role and provides authorization checks
 */

export enum Permission {
  // User Management
  USER_READ = "user:read",
  USER_WRITE = "user:write",
  USER_DELETE = "user:delete",
  USER_VERIFY = "user:verify",
  
  // Worker Management
  WORKER_READ = "worker:read",
  WORKER_WRITE = "worker:write",
  WORKER_DELETE = "worker:delete",
  WORKER_VERIFY_KYC = "worker:verify_kyc",
  WORKER_APPROVE = "worker:approve",
  
  // Customer Management
  CUSTOMER_READ = "customer:read",
  CUSTOMER_WRITE = "customer:write",
  CUSTOMER_DELETE = "customer:delete",
  
  // Contractor Management
  CONTRACTOR_READ = "contractor:read",
  CONTRACTOR_WRITE = "contractor:write",
  CONTRACTOR_DELETE = "contractor:delete",
  CONTRACTOR_VERIFY = "contractor:verify",
  
  // Job Management
  JOB_READ = "job:read",
  JOB_WRITE = "job:write",
  JOB_DELETE = "job:delete",
  JOB_ASSIGN = "job:assign",
  JOB_COMPLETE = "job:complete",
  JOB_CANCEL = "job:cancel",
  
  // Payment Management
  PAYMENT_READ = "payment:read",
  PAYMENT_WRITE = "payment:write",
  PAYMENT_REFUND = "payment:refund",
  PAYMENT_PROCESS = "payment:process",
  
  // Payout Management
  PAYOUT_READ = "payout:read",
  PAYOUT_WRITE = "payout:write",
  PAYOUT_PROCESS = "payout:process",
  PAYOUT_APPROVE = "payout:approve",
  
  // Dispute Management
  DISPUTE_READ = "dispute:read",
  DISPUTE_WRITE = "dispute:write",
  DISPUTE_RESOLVE = "dispute:resolve",
  
  // Service Management
  SERVICE_READ = "service:read",
  SERVICE_WRITE = "service:write",
  SERVICE_DELETE = "service:delete",
  
  // Category Management
  CATEGORY_READ = "category:read",
  CATEGORY_WRITE = "category:write",
  CATEGORY_DELETE = "category:delete",
  
  // Analytics & Reports
  ANALYTICS_READ = "analytics:read",
  ANALYTICS_EXPORT = "analytics:export",
  REPORTS_READ = "reports:read",
  REPORTS_GENERATE = "reports:generate",
  
  // Settings Management
  SETTINGS_READ = "settings:read",
  SETTINGS_WRITE = "settings:write",
  
  // Attendance Management
  ATTENDANCE_READ = "attendance:read",
  ATTENDANCE_WRITE = "attendance:write",
  ATTENDANCE_APPROVE = "attendance:approve",
  
  // Promotion Management
  PROMOTION_READ = "promotion:read",
  PROMOTION_WRITE = "promotion:write",
  PROMOTION_DELETE = "promotion:delete",
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // Full access to everything
    ...Object.values(Permission),
  ],
  
  contractor: [
    // Contractor-specific permissions
    Permission.USER_READ,
    Permission.WORKER_READ,
    Permission.CUSTOMER_READ,
    Permission.JOB_READ,
    Permission.JOB_WRITE,
    Permission.JOB_COMPLETE,
    Permission.PAYMENT_READ,
    Permission.PAYOUT_READ,
    Permission.DISPUTE_READ,
    Permission.DISPUTE_WRITE,
    Permission.SERVICE_READ,
    Permission.CATEGORY_READ,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
    Permission.PROMOTION_READ,
  ],
  
  worker: [
    // Worker-specific permissions
    Permission.USER_READ,
    Permission.JOB_READ,
    Permission.JOB_WRITE,
    Permission.JOB_COMPLETE,
    Permission.PAYMENT_READ,
    Permission.PAYOUT_READ,
    Permission.DISPUTE_READ,
    Permission.DISPUTE_WRITE,
    Permission.SERVICE_READ,
    Permission.CATEGORY_READ,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
  ],
  
  customer: [
    // Customer-specific permissions
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.JOB_READ,
    Permission.JOB_WRITE,
    Permission.JOB_CANCEL,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_WRITE,
    Permission.DISPUTE_READ,
    Permission.DISPUTE_WRITE,
    Permission.SERVICE_READ,
    Permission.CATEGORY_READ,
    Permission.PROMOTION_READ,
  ],
};

// Resource-action mapping for easy permission checking
export const RESOURCE_ACTIONS: Record<string, Record<string, Permission>> = {
  users: {
    read: Permission.USER_READ,
    write: Permission.USER_WRITE,
    delete: Permission.USER_DELETE,
    verify: Permission.USER_VERIFY,
  },
  workers: {
    read: Permission.WORKER_READ,
    write: Permission.WORKER_WRITE,
    delete: Permission.WORKER_DELETE,
    verify_kyc: Permission.WORKER_VERIFY_KYC,
    approve: Permission.WORKER_APPROVE,
  },
  customers: {
    read: Permission.CUSTOMER_READ,
    write: Permission.CUSTOMER_WRITE,
    delete: Permission.CUSTOMER_DELETE,
  },
  contractors: {
    read: Permission.CONTRACTOR_READ,
    write: Permission.CONTRACTOR_WRITE,
    delete: Permission.CONTRACTOR_DELETE,
    verify: Permission.CONTRACTOR_VERIFY,
  },
  jobs: {
    read: Permission.JOB_READ,
    write: Permission.JOB_WRITE,
    delete: Permission.JOB_DELETE,
    assign: Permission.JOB_ASSIGN,
    complete: Permission.JOB_COMPLETE,
    cancel: Permission.JOB_CANCEL,
  },
  payments: {
    read: Permission.PAYMENT_READ,
    write: Permission.PAYMENT_WRITE,
    refund: Permission.PAYMENT_REFUND,
    process: Permission.PAYMENT_PROCESS,
  },
  payouts: {
    read: Permission.PAYOUT_READ,
    write: Permission.PAYOUT_WRITE,
    process: Permission.PAYOUT_PROCESS,
    approve: Permission.PAYOUT_APPROVE,
  },
  disputes: {
    read: Permission.DISPUTE_READ,
    write: Permission.DISPUTE_WRITE,
    resolve: Permission.DISPUTE_RESOLVE,
  },
  services: {
    read: Permission.SERVICE_READ,
    write: Permission.SERVICE_WRITE,
    delete: Permission.SERVICE_DELETE,
  },
  categories: {
    read: Permission.CATEGORY_READ,
    write: Permission.CATEGORY_WRITE,
    delete: Permission.CATEGORY_DELETE,
  },
  analytics: {
    read: Permission.ANALYTICS_READ,
    export: Permission.ANALYTICS_EXPORT,
  },
  reports: {
    read: Permission.REPORTS_READ,
    generate: Permission.REPORTS_GENERATE,
  },
  settings: {
    read: Permission.SETTINGS_READ,
    write: Permission.SETTINGS_WRITE,
  },
  attendance: {
    read: Permission.ATTENDANCE_READ,
    write: Permission.ATTENDANCE_WRITE,
    approve: Permission.ATTENDANCE_APPROVE,
  },
  promotions: {
    read: Permission.PROMOTION_READ,
    write: Permission.PROMOTION_WRITE,
    delete: Permission.PROMOTION_DELETE,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role can perform a specific action on a resource
 */
export function canPerformAction(role: string, resource: string, action: string): boolean {
  const resourceActions = RESOURCE_ACTIONS[resource];
  if (!resourceActions) return false;
  
  const permission = resourceActions[action];
  if (!permission) return false;
  
  return hasPermission(role, permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has access to a specific route based on their role
 */
export function canAccessRoute(role: string, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/admin": [Permission.ANALYTICS_READ],
    "/admin/users": [Permission.USER_READ],
    "/admin/users/workers": [Permission.WORKER_READ],
    "/admin/users/customers": [Permission.CUSTOMER_READ],
    "/admin/users/contractors": [Permission.CONTRACTOR_READ],
    "/admin/services": [Permission.SERVICE_READ],
    "/admin/services/categories": [Permission.CATEGORY_READ],
    "/admin/services/kyc": [Permission.WORKER_VERIFY_KYC],
    "/admin/jobs": [Permission.JOB_READ],
    "/admin/jobs/projects": [Permission.JOB_READ],
    "/admin/jobs/quotations": [Permission.JOB_READ],
    "/admin/payments": [Permission.PAYMENT_READ],
    "/admin/payments/transactions": [Permission.PAYMENT_READ],
    "/admin/payments/payouts": [Permission.PAYOUT_READ],
    "/admin/payments/commission": [Permission.PAYMENT_READ],
    "/admin/disputes": [Permission.DISPUTE_READ],
    "/admin/promotions": [Permission.PROMOTION_READ],
    "/admin/analytics": [Permission.ANALYTICS_READ],
    "/admin/settings": [Permission.SETTINGS_READ],
    "/admin/attendance": [Permission.ATTENDANCE_READ],
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true; // No specific permissions required
  
  return hasAnyPermission(role, requiredPermissions);
}
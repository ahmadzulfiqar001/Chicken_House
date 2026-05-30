/**
 * Role-Based Access Control (RBAC) Permission System
 * Defines granular permissions for each user role
 */

export type UserRole =
  | "admin"
  | "manager"
  | "rider"
  | "staff"
  | "user";

export type Permission =
  // Booking permissions
  | "bookings:view"
  | "bookings:create"
  | "bookings:update"
  | "bookings:delete"
  // Order permissions
  | "orders:view"
  | "orders:create"
  | "orders:update"
  | "orders:delete"
  // Menu permissions
  | "menu:view"
  | "menu:create"
  | "menu:update"
  | "menu:delete"
  // Inventory permissions
  | "inventory:view"
  | "inventory:create"
  | "inventory:update"
  | "inventory:delete"
  // Finance permissions
  | "finance:view"
  | "finance:create"
  | "finance:update"
  | "finance:delete"
  // HR permissions
  | "hr:view"
  | "hr:create"
  | "hr:update"
  | "hr:delete"
  // User management permissions
  | "users:view"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:manage-roles"
  // Analytics permissions
  | "analytics:view"
  // System permissions
  | "system:settings";

/**
 * Permission matrix defining what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Full access to everything
    "bookings:view", "bookings:create", "bookings:update", "bookings:delete",
    "orders:view", "orders:create", "orders:update", "orders:delete",
    "menu:view", "menu:create", "menu:update", "menu:delete",
    "inventory:view", "inventory:create", "inventory:update", "inventory:delete",
    "finance:view", "finance:create", "finance:update", "finance:delete",
    "hr:view", "hr:create", "hr:update", "hr:delete",
    "users:view", "users:create", "users:update", "users:delete", "users:manage-roles",
    "analytics:view",
    "system:settings",
  ],
  manager: [
    // Can view and edit most things, but cannot delete or manage users
    "bookings:view", "bookings:create", "bookings:update",
    "orders:view", "orders:create", "orders:update",
    "menu:view", "menu:create", "menu:update",
    "inventory:view", "inventory:create", "inventory:update",
    "finance:view",
    "hr:view", "hr:create", "hr:update",
    "users:view",
    "analytics:view",
  ],
  rider: [
    "orders:view", "orders:update",
  ],
  staff: [
    "menu:view",
    "orders:view",
    "orders:update",
    "bookings:view",
  ],
  user: [
    // Customer - can only view menu and manage own orders
    "menu:view",
    "orders:view", // Only own orders (filtered in route)
    "orders:create",
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] ?? [];
};

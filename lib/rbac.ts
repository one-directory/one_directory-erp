import { UserRole } from '@prisma/client';
import { NavigationModule } from '@/components/shell/Sidebar';

export interface RoleInfo {
  role: UserRole;
  label: string;
  badgeClass: string;
  bgLight: string;
  description: string;
}

export const ROLE_INFO_MAP: Record<UserRole, RoleInfo> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'Super Admin',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    bgLight: 'bg-purple-50',
    description: 'Unrestricted enterprise access across all hospitality domains, system settings, and users.',
  },
  PROPERTY_MANAGER: {
    role: 'PROPERTY_MANAGER',
    label: 'Property Manager',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    bgLight: 'bg-teal-50',
    description: 'Manages properties, reservations, CRM pipeline, operations, staff, and guest reviews.',
  },
  FRONT_DESK: {
    role: 'FRONT_DESK',
    label: 'Front Desk / Reception',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    bgLight: 'bg-sky-50',
    description: 'Handles arrivals, departures, guest check-ins, payments recording, and room status.',
  },
  OPERATIONS: {
    role: 'OPERATIONS',
    label: 'Operations & Housekeeping',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    bgLight: 'bg-amber-50',
    description: 'Executes housekeeping tasks, maintenance tickets, and room turnover inspections.',
  },
  ACCOUNTANT: {
    role: 'ACCOUNTANT',
    label: 'Finance & Accounts',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    bgLight: 'bg-emerald-50',
    description: 'Oversees payments, tax invoices, operating expenses, settlements, and financial reporting.',
  },
};

/**
 * Permitted navigation modules for each operational role
 */
export const ROLE_MODULE_PERMISSIONS: Record<UserRole, NavigationModule[]> = {
  ADMIN: [
    'dashboard',
    'reservations',
    'calendar',
    'guests',
    'follow-ups',
    'leads',
    'quotations',
    'communications',
    'properties',
    'unit-types',
    'units',
    'housekeeping',
    'maintenance',
    'staff-tasks',
    'finance',
    'payments',
    'invoices',
    'expenses',
    'owner-settlements',
    'channels',
    'reviews',
    'reports',
    'audit',
    'settings',
  ],
  PROPERTY_MANAGER: [
    'dashboard',
    'reservations',
    'calendar',
    'guests',
    'follow-ups',
    'leads',
    'quotations',
    'communications',
    'properties',
    'unit-types',
    'units',
    'housekeeping',
    'maintenance',
    'staff-tasks',
    'payments',
    'invoices',
    'channels',
    'reviews',
    'reports',
  ],
  FRONT_DESK: [
    'dashboard',
    'reservations',
    'calendar',
    'guests',
    'communications',
    'units',
    'housekeeping',
    'payments',
    'invoices',
  ],
  OPERATIONS: [
    'dashboard',
    'units',
    'housekeeping',
    'maintenance',
    'staff-tasks',
  ],
  ACCOUNTANT: [
    'dashboard',
    'finance',
    'payments',
    'invoices',
    'expenses',
    'owner-settlements',
    'reports',
  ],
};

/**
 * Granular action permissions per role
 */
export type ActionPermission =
  | 'manage_users'
  | 'manage_settings'
  | 'manage_properties'
  | 'create_reservations'
  | 'cancel_reservations'
  | 'manage_crm'
  | 'record_payments'
  | 'manage_expenses'
  | 'approve_settlements'
  | 'assign_operations'
  | 'view_audit_logs';

export const ROLE_ACTION_PERMISSIONS: Record<UserRole, ActionPermission[]> = {
  ADMIN: [
    'manage_users',
    'manage_settings',
    'manage_properties',
    'create_reservations',
    'cancel_reservations',
    'manage_crm',
    'record_payments',
    'manage_expenses',
    'approve_settlements',
    'assign_operations',
    'view_audit_logs',
  ],
  PROPERTY_MANAGER: [
    'manage_properties',
    'create_reservations',
    'cancel_reservations',
    'manage_crm',
    'record_payments',
    'assign_operations',
  ],
  FRONT_DESK: [
    'create_reservations',
    'record_payments',
  ],
  OPERATIONS: [
    'assign_operations',
  ],
  ACCOUNTANT: [
    'record_payments',
    'manage_expenses',
    'approve_settlements',
  ],
};

/**
 * Checks if a given role has access to a navigation module
 */
export function hasModuleAccess(role: UserRole | undefined, module: NavigationModule): boolean {
  if (!role) return false;
  const allowed = ROLE_MODULE_PERMISSIONS[role];
  return allowed ? allowed.includes(module) : false;
}

/**
 * Checks if a given role has permission to execute an action
 */
export function canPerformAction(role: UserRole | undefined, action: ActionPermission): boolean {
  if (!role) return false;
  const allowed = ROLE_ACTION_PERMISSIONS[role];
  return allowed ? allowed.includes(action) : false;
}

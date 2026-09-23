'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '@/context/ERPContext';
import { useAuth } from '@/context/AuthContext';
import { ERPUser, StaffRole } from '@/types/erp';
import { UserRole } from '@prisma/client';
import {
  ROLE_INFO_MAP,
  ROLE_MODULE_PERMISSIONS,
  ROLE_ACTION_PERMISSIONS,
  RoleInfo,
} from '@/lib/rbac';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Lock,
  RefreshCw,
} from 'lucide-react';

const ROLE_OPTIONS: { role: StaffRole; label: string; description: string }[] = [
  {
    role: 'ADMIN',
    label: 'Super Admin',
    description: 'Full enterprise control: user management, global settings, finance, and system operations.',
  },
  {
    role: 'PROPERTY_MANAGER',
    label: 'Property Manager',
    description: 'Manages properties, units, rates, bookings, CRM pipeline, and operational workflows.',
  },
  {
    role: 'FRONT_DESK',
    label: 'Front Desk / Reception',
    description: 'Handles arrivals, departures, guest check-ins, payments recording, and room status.',
  },
  {
    role: 'OPERATIONS',
    label: 'Operations & Housekeeping',
    description: 'Executes housekeeping tasks, maintenance tickets, and room turnover inspections.',
  },
  {
    role: 'ACCOUNTANT',
    label: 'Finance & Accounts',
    description: 'Oversees payments, GST invoices, operational expenses, and owner settlements.',
  },
];

export function StaffManagementTab() {
  const {
    users,
    isLoadingUsers,
    properties,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    showToast,
  } = useERP();
  const { user: currentUser } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUser | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<ERPUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<ERPUser | null>(null);
  const [isRbacMatrixOpen, setIsRbacMatrixOpen] = useState(false);

  // Form States - Add User
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PROPERTY_MANAGER' as StaffRole,
    department: 'Property Operations',
    phone: '',
    allProperties: true,
    selectedProperties: [] as string[],
  });
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Form States - Edit User
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'PROPERTY_MANAGER' as StaffRole,
    department: '',
    phone: '',
    isActive: true,
    allProperties: true,
    selectedProperties: [] as string[],
    newPassword: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Form States - Reset Password
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.includes(searchQuery));
      if (!matchSearch) return false;

      // Role Filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Status Filter
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      // Property Filter
      if (propertyFilter !== 'ALL') {
        const hasAllAccess = !u.propertyIds || u.propertyIds.length === 0;
        if (!hasAllAccess && !u.propertyIds.includes(propertyFilter)) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, statusFilter, propertyFilter]);

  // Summary Metrics
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      managers: users.filter((u) => u.role === 'PROPERTY_MANAGER').length,
      operations: users.filter((u) => u.role === 'OPERATIONS' || u.role === 'FRONT_DESK').length,
      finance: users.filter((u) => u.role === 'ACCOUNTANT').length,
    };
  }, [users]);

  // Handlers
  const handleOpenEdit = (u: ERPUser) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      role: u.role,
      department: u.department || '',
      phone: u.phone || '',
      isActive: u.isActive,
      allProperties: !u.propertyIds || u.propertyIds.length === 0,
      selectedProperties: u.propertyIds || [],
      newPassword: '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      showToast('Validation Error', 'Name, Email, and Password are required', 'warning');
      return;
    }

    setIsSubmittingAdd(true);
    const success = await createUser({
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      password: addForm.password,
      role: addForm.role,
      department: addForm.department.trim() || undefined,
      phone: addForm.phone.trim() || undefined,
      propertyIds: addForm.allProperties ? [] : addForm.selectedProperties,
    });
    setIsSubmittingAdd(false);

    if (success) {
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        email: '',
        password: '',
        role: 'PROPERTY_MANAGER',
        department: 'Property Operations',
        phone: '',
        allProperties: true,
        selectedProperties: [],
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.name.trim()) {
      showToast('Validation Error', 'Full Name is required', 'warning');
      return;
    }

    setIsSubmittingEdit(true);
    const updates: Partial<ERPUser> & { password?: string } = {
      name: editForm.name.trim(),
      role: editForm.role,
      department: editForm.department.trim() || null,
      phone: editForm.phone.trim() || null,
      isActive: editForm.isActive,
      propertyIds: editForm.allProperties ? [] : editForm.selectedProperties,
    };

    if (editForm.newPassword.trim()) {
      updates.password = editForm.newPassword.trim();
    }

    const success = await updateUser(editingUser.id, updates);
    setIsSubmittingEdit(false);

    if (success) {
      setEditingUser(null);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPasswordUser) return;
    if (!newPasswordValue.trim() || newPasswordValue.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters', 'warning');
      return;
    }

    setIsSubmittingPassword(true);
    const success = await updateUser(resettingPasswordUser.id, {
      password: newPasswordValue.trim(),
    });
    setIsSubmittingPassword(false);

    if (success) {
      showToast('Password Reset', `Password for ${resettingPasswordUser.name} updated.`, 'success');
      setResettingPasswordUser(null);
      setNewPasswordValue('');
    }
  };

  const handleDeleteConfirm = async (permanent: boolean) => {
    if (!deletingUser) return;
    await deleteUser(deletingUser.id, permanent);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI Stats Bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {stats.active} Active accounts
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
            <span>Super Admins</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.admins}</p>
          <span className="text-[11px] text-slate-400">Full System Access</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-teal-600 text-xs font-semibold">
            <span>Property Managers</span>
            <Building2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.managers}</p>
          <span className="text-[11px] text-slate-400">Inventory & Operations</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-sky-600 text-xs font-semibold">
            <span>Front Desk & Ops</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.operations}</p>
          <span className="text-[11px] text-slate-400">Check-in & Housekeeping</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-semibold">
            <span>Finance & Accounts</span>
            <Lock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.finance}</p>
          <span className="text-[11px] text-slate-400">Invoices & Settlements</span>
        </div>
      </div>

      {/* ── 2. Filter & Action Bar ──────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Super Admin</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="FRONT_DESK">Front Desk</option>
            <option value="OPERATIONS">Operations & Housekeeping</option>
            <option value="ACCOUNTANT">Finance & Accounts</option>
          </select>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Property Access</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated</option>
          </select>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => fetchUsers()}
            title="Refresh Users"
            className="text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRbacMatrixOpen(true)}
            className="text-xs flex items-center gap-1.5 border-slate-200"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Role Permissions</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Staff Table or Empty State ───────────────────────────────── */}
      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-teal-600" />}
          title="No Team Members Registered"
          description="Your team directory is currently empty. Add administrators, property managers, front-desk staff, or accountants to assign granular operational access."
          actionLabel="+ Add First Team Member"
          onAction={() => setIsAddModalOpen(true)}
          className="bg-white py-14 shadow-2xs"
        />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800">No staff members match the filters</h4>
          <p className="text-xs text-slate-500">
            Try adjusting your search query, role filter, or property access selection.
          </p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
              setPropertyFilter('ALL');
              setStatusFilter('ALL');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Role & Permissions</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Properties</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const roleMeta: RoleInfo = ROLE_INFO_MAP[u.role as UserRole] || {
                    role: u.role as UserRole,
                    label: u.role,
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    bgLight: 'bg-slate-50',
                    description: '',
                  };

                  // Resolve assigned properties
                  const assignedProps =
                    !u.propertyIds || u.propertyIds.length === 0
                      ? 'All Properties (Enterprise Access)'
                      : properties
                          .filter((p) => u.propertyIds.includes(p.id))
                          .map((p) => p.name)
                          .join(', ') || `${u.propertyIds.length} properties`;

                  const isCurrentUser = currentUser?.email === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'PROPERTY_MANAGER'
                                ? 'bg-teal-100 text-teal-700'
                                : u.role === 'FRONT_DESK'
                                ? 'bg-sky-100 text-sky-700'
                                : u.role === 'OPERATIONS'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {u.email}
                              </span>
                              {u.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {u.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${roleMeta.badgeClass}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">
                          {u.department || 'General Hospitality'}
                        </span>
                      </td>

                      {/* Assigned Properties */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span
                            className={`truncate ${
                              !u.propertyIds || u.propertyIds.length === 0
                                ? 'text-teal-700 font-semibold'
                                : 'text-slate-600'
                            }`}
                            title={assignedProps}
                          >
                            {assignedProps}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(u.id, u.isActive)}
                          className="flex items-center gap-1.5 group cursor-pointer"
                          title="Click to toggle active status"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <Badge variant={u.isActive ? 'success' : 'neutral'} size="xs">
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResettingPasswordUser(u);
                              setNewPasswordValue('');
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete or Deactivate"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. Add Team Member Modal ────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Team Member"
        subtitle="Invite a new staff member and assign their role-based operational permissions"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Hegde"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="ramesh@onedirectory.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Login Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Assigned Role & Access Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <label
                  key={opt.role}
                  className={`p-2.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    addForm.role === opt.role
                      ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{opt.label}</span>
                    <input
                      type="radio"
                      name="role"
                      checked={addForm.role === opt.role}
                      onChange={() => setAddForm({ ...addForm, role: opt.role })}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.description}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              placeholder="e.g. Front Office, Housekeeping, Accounts, CRM"
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Property Access Mapping */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Property Access Scope</span>
                <p className="text-[11px] text-slate-500">
                  Allow this staff member to view and manage specific resorts or homestays
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-teal-800">
                <input
                  type="checkbox"
                  checked={addForm.allProperties}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      allProperties: e.target.checked,
                      selectedProperties: e.target.checked ? [] : addForm.selectedProperties,
                    })
                  }
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                All Properties
              </label>
            </div>

            {!addForm.allProperties && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 max-h-36 overflow-y-auto">
                {properties.map((p) => {
                  const isChecked = addForm.selectedProperties.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                        isChecked
                          ? 'border-teal-400 bg-teal-50/60 font-semibold text-teal-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...addForm.selectedProperties, p.id]
                            : addForm.selectedProperties.filter((id) => id !== p.id);
                          setAddForm({ ...addForm, selectedProperties: next });
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="truncate">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmittingAdd}>
              {isSubmittingAdd ? 'Saving User...' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── 5. Edit Team Member Modal ───────────────────────────────────── */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit Profile: ${editingUser.name}`}
          subtitle={`Account Email: ${editingUser.email}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Assignment</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as StaffRole })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Optional Password Reset */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reset Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Leave blank to preserve current password"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800">Account Active</span>
                <p className="text-[11px] text-slate-500">
                  Inactive staff cannot log into the ERP system
                </p>
              </div>
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>

            {/* Property Access */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Assigned Properties</span>
                  <p className="text-[11px] text-slate-500">
                    Control which properties this staff member can access
                  </p>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-teal-800">
                  <input
                    type="checkbox"
                    checked={editForm.allProperties}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        allProperties: e.target.checked,
                        selectedProperties: e.target.checked ? [] : editForm.selectedProperties,
                      })
                    }
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  All Properties
                </label>
              </div>

              {!editForm.allProperties && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 max-h-36 overflow-y-auto">
                  {properties.map((p) => {
                    const isChecked = editForm.selectedProperties.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                          isChecked
                            ? 'border-teal-400 bg-teal-50/60 font-semibold text-teal-900'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...editForm.selectedProperties, p.id]
                              : editForm.selectedProperties.filter((id) => id !== p.id);
                            setEditForm({ ...editForm, selectedProperties: next });
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? 'Saving...' : 'Update Staff Member'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 6. Reset Password Quick Modal ──────────────────────────────── */}
      {resettingPasswordUser && (
        <Modal
          isOpen={true}
          onClose={() => setResettingPasswordUser(null)}
          title={`Reset Password: ${resettingPasswordUser.name}`}
          subtitle={`Set a new temporary or permanent password for ${resettingPasswordUser.email}`}
          maxWidth="sm"
        >
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPasswordValue}
                onChange={(e) => setNewPasswordValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResettingPasswordUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingPassword || newPasswordValue.length < 6}
              >
                {isSubmittingPassword ? 'Updating...' : 'Set Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── 7. Delete / Deactivate Confirmation Modal ───────────────────── */}
      {deletingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          title={`Remove or Deactivate Staff Member`}
          subtitle={`${deletingUser.name} (${deletingUser.email})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Choose account action:</p>
                <p className="text-[11px] mt-0.5 text-amber-700">
                  <strong>Deactivation</strong> preserves all past reservation, housekeeping, and audit log history.
                  <strong> Permanent Deletion</strong> will completely delete this user record.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteConfirm(false)}
                className="text-amber-700 hover:bg-amber-50"
              >
                Deactivate Account
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDeleteConfirm(true)}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── 8. RBAC Permissions Matrix Modal ───────────────────────────── */}
      <Modal
        isOpen={isRbacMatrixOpen}
        onClose={() => setIsRbacMatrixOpen(false)}
        title="Role-Based Access Control (RBAC) Matrix"
        subtitle="Enterprise navigation permissions and authorized action privileges across roles"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Allowed Modules</th>
                  <th className="py-2.5 px-3">Key Privileges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(ROLE_INFO_MAP) as UserRole[]).map((roleKey) => {
                  const meta = ROLE_INFO_MAP[roleKey];
                  const modules = ROLE_MODULE_PERMISSIONS[roleKey] || [];
                  const actions = ROLE_ACTION_PERMISSIONS[roleKey] || [];

                  return (
                    <tr key={roleKey} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] border ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{meta.description}</p>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-wrap gap-1">
                          {modules.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top">
                        <div className="flex flex-wrap gap-1">
                          {actions.map((a) => (
                            <span
                              key={a}
                              className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] border border-teal-200/60"
                            >
                              {a.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsRbacMatrixOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

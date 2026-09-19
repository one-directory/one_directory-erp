'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Settings, Users, Building2, Bell, Shield, Sliders, Check } from 'lucide-react';

export function SettingsView() {
  const { showToast } = useERP();
  const [activeTab, setActiveTab] = useState('org');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System & ERP Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Company profile, staff role-based access controls, tax settings, and booking policies
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'org', label: 'Organization' },
          { id: 'users', label: 'Users & Roles' },
          { id: 'booking', label: 'Booking & Tax Policies' },
          { id: 'notifications', label: 'Notification Rules' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Organization Tab */}
      {activeTab === 'org' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900">Organization Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                defaultValue="One Directory Hospitality Pvt. Ltd."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Master GSTIN</label>
                <input
                  type="text"
                  defaultValue="29AAFCO8812K1ZQ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Currency</label>
                <input
                  type="text"
                  defaultValue="INR (₹) - Indian Rupee"
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head Office Address</label>
              <textarea
                rows={2}
                defaultValue="4th Floor, Coastal Commercial Complex, Court Road, Udupi, Karnataka - 576101"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none text-slate-800"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => showToast('Settings saved', 'Organization settings updated successfully')}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Primary Property Access</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Admin User', role: 'Operations Head / Superadmin', prop: 'All Properties', status: 'Active' },
                { name: 'Arun V', role: 'Senior Sales Lead', prop: 'Vistara & Silver Sands', status: 'Active' },
                { name: 'Neha Sharma', role: 'VIP Relations & CRM', prop: 'Ivory by Shore & Delta Inn', status: 'Active' },
                { name: 'Praveen Nair', role: 'Operations Supervisor', prop: 'Gayatri Nest & Sattva', status: 'Active' },
                { name: 'Mary Fernandes', role: 'Executive Housekeeper', prop: 'Silver Sands Beach Resort', status: 'Active' },
              ].map((u, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-teal-800">{u.role}</td>
                  <td className="py-3.5 px-4 text-slate-600">{u.prop}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" size="xs">
                      {u.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Policies */}
      {activeTab === 'booking' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-xl text-xs">
          <h3 className="text-sm font-bold text-slate-900">Automated Operational Rules</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">Auto-trigger Housekeeping on Check-out</p>
                <p className="text-slate-500 text-[11px]">Marks room Dirty and dispatches task immediately</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">Hold Unit on Maintenance Ticket</p>
                <p className="text-slate-500 text-[11px]">Prevents double-booking during active repairs</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded" />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-800">Default Accommodation GST Rate</p>
                <p className="text-slate-500 text-[11px]">Applied to all quotations and invoices</p>
              </div>
              <span className="font-bold text-teal-800">12% GST</span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Rules */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 max-w-xl text-xs">
          <h3 className="text-sm font-bold text-slate-900">Alert Rules & Urgency Thresholds</h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span>Overdue Follow-up alert after 2 hours</span>
              <Badge variant="success" size="xs">Enabled</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span>High priority maintenance ticket notification</span>
              <Badge variant="success" size="xs">Enabled</Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span>New confirmed booking notification</span>
              <Badge variant="success" size="xs">Enabled</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Search, Star, Phone, Mail, Calendar } from 'lucide-react';

export function GuestsView() {
  const { guests, openDrawer, openGlobalModal } = useERP();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuests = guests.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Guest Directory & CRM</h1>
            <Badge variant="purple" size="xs">
              {guests.length} Profiles
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete guest profiles, lifetime spend, preferences, and unified lifecycle timelines
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openGlobalModal('new-guest')}
        >
          + Register Guest
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Guests Table */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No guest profiles found"
          description="Register your first guest or adjust your search filter to view profiles."
          actionLabel="+ Register Guest"
          onAction={() => openGlobalModal('new-guest')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Guest Name</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Total Stays</th>
              <th className="py-3 px-4">Last Stay</th>
              <th className="py-3 px-4">Lifetime Spend</th>
              <th className="py-3 px-4">Preferences & Tags</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGuests.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {g.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{g.name}</span>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-mono text-slate-700">{g.phone}</p>
                  <p className="text-[11px] text-slate-400">{g.email}</p>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{g.totalStays} Stays</td>
                <td className="py-3.5 px-4 text-slate-500">{g.lastStayDate || 'New Guest'}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular">
                  ₹{g.totalSpend.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {g.preferences.slice(0, 2).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={g.status} size="xs">
                    {g.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => openDrawer('guest', g.id)}
                  >
                    View Timeline
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

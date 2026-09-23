'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Search } from 'lucide-react';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header Masthead */}
      <div className="bg-white p-5 border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A32] tracking-tight">Guest Directory & CRM</h1>
            <Badge variant="purple" size="xs">
              {guests.length} Profiles
            </Badge>
          </div>
          <p className="text-xs text-[#6B7A87] mt-1">
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
      <div className="bg-white p-4 border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-[#9AAAB6] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F7] border border-[#D8D2C8] rounded-[2px] text-[#1E2A32] placeholder-[#9AAAB6] focus:outline-none focus:border-[#2E6E8E]"
          />
        </div>
      </div>

      {/* Guests Table */}
      {filteredGuests.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-[#9AAAB6]" />}
          title="No guest profiles found"
          description="Register your first guest or adjust your search filter to view profiles."
          actionLabel="+ Register Guest"
          onAction={() => openGlobalModal('new-guest')}
        />
      ) : (
        <div className="bg-white border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF9F7] border-b border-[#E2DDD6] text-[#6B7A87] font-semibold uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-[#F0EDE6]">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-[#F8F6F1] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1E2A32] flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[2px] bg-[#EBF3F8] text-[#2E6E8E] border border-[#BCD5E5] flex items-center justify-center font-bold text-xs shrink-0">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{g.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-[#3D4E5C]">{g.phone}</p>
                    <p className="text-[11px] text-[#6B7A87]">{g.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#3D4E5C]">{g.totalStays} Stays</td>
                  <td className="py-3.5 px-4 text-[#6B7A87]">{g.lastStayDate || 'New Guest'}</td>
                  <td className="py-3.5 px-4 font-bold text-[#1E2A32] font-tabular">
                    ₹{g.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {g.preferences.slice(0, 2).map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-[#F0EDE6] border border-[#D8D2C8] text-[#3D4E5C] px-1.5 py-0.5 rounded-[2px]"
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

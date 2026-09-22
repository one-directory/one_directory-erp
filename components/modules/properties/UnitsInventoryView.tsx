'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { UnitStatus } from '@/types/erp';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { BedDouble, Filter, Search, CheckCircle2 } from 'lucide-react';

export function UnitsInventoryView() {
  const { units, selectedPropertyId, updateUnitStatus } = useERP();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = units.filter((u) => {
    if (selectedPropertyId !== 'all' && u.propertyId !== selectedPropertyId) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.number.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.propertyName.toLowerCase().includes(q) ||
        u.unitTypeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Unit Inventory Management</h1>
            <Badge variant="info" size="xs">
              {filtered.length} Units
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time physical accommodation status, housekeeping state, and maintenance holds
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search unit number, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses (8 States)</option>
            <option value="Available">Available (Ready)</option>
            <option value="Occupied">Occupied</option>
            <option value="Dirty">Dirty (Departure)</option>
            <option value="Cleaning">Cleaning in Progress</option>
            <option value="Inspection">Awaiting Inspection</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Blocked">Blocked</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Grid of Units with Direct Interactive Status Toggles */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="w-6 h-6" />}
          title="No rooms or units found"
          description="Units registered under properties will display their real-time statuses and room turnover controls here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((unit) => (
            <div
              key={unit.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-black text-slate-900 tracking-tight font-mono">
                      {unit.number}
                    </span>
                    <p className="text-[11px] font-semibold text-teal-700">{unit.propertyName}</p>
                  </div>
                  <Badge status={unit.status} size="xs" dot>
                    {unit.status}
                  </Badge>
                </div>

                <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                  <p className="font-medium text-slate-800 line-clamp-1">{unit.unitTypeName}</p>
                  <p className="text-slate-400 text-[11px]">{unit.floor}</p>
                  {unit.currentGuestName && (
                    <p className="text-[11px] text-teal-800 font-semibold bg-teal-50 p-1 rounded mt-1">
                      Guest: {unit.currentGuestName}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Status Selector */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Change:</span>
                <select
                  value={unit.status}
                  onChange={(e) => updateUnitStatus(unit.id, e.target.value as UnitStatus)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Dirty">Dirty</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

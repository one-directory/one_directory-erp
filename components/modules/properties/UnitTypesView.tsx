'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { BedDouble, Users, Check } from 'lucide-react';

export function UnitTypesView() {
  const { unitTypes, selectedPropertyId } = useERP();

  const filtered = unitTypes.filter(
    (ut) => selectedPropertyId === 'all' || ut.propertyId === selectedPropertyId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Unit Types & Categories</h1>
        <p className="text-xs text-slate-500 mt-1">
          Master room categories, capacities, bed specifications, base tariffs, and room amenities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ut) => (
          <div
            key={ut.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">
                    {ut.propertyName}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{ut.name}</h3>
                </div>
                <Badge variant="success" size="xs">
                  {ut.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Capacity</span>
                  <span className="font-bold text-slate-800">{ut.capacity} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Units</span>
                  <span className="font-bold text-slate-800">{ut.numberOfUnits}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Base Tariff</span>
                  <span className="font-bold text-teal-800 font-tabular">
                    ₹{ut.baseRate.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2 font-medium">Bedding: {ut.bedConfiguration}</p>

              <div className="flex flex-wrap gap-1 mt-2.5">
                {ut.amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

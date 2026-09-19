'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Building2, MapPin, BedDouble, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface PropertiesListViewProps {
  onSelectProperty: (propertyId: string) => void;
}

export function PropertiesListView({ onSelectProperty }: PropertiesListViewProps) {
  const { properties, setSelectedPropertyId } = useERP();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Hospitality Properties</h1>
            <Badge variant="success" size="xs">
              {properties.length} Active Portfolio
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Resorts, homestays, luxury villas, and camps managed by One Directory
          </p>
        </div>
      </div>

      {/* Grid of 7 Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectProperty(p.id)}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-teal-500 transition-all cursor-pointer p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.location}</span>
                  </p>
                </div>
                <Badge variant="neutral" size="xs">
                  {p.type}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-2">{p.description}</p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-50 rounded-xl text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Units</p>
                  <p className="text-sm font-bold text-slate-800">{p.totalUnits}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Occupancy</p>
                  <p className="text-sm font-bold text-teal-700">{p.occupancyRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">MTD Rev</p>
                  <p className="text-sm font-bold text-slate-800 font-tabular">
                    ₹{(p.revenueThisMonth / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Today: <strong>{p.todayArrivals} arr</strong> / {p.todayDepartures} dep
              </span>
              <span className="font-semibold text-teal-600 flex items-center gap-1">
                Open Details <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

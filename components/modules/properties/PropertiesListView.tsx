'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  MapPin,
  BedDouble,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AddPropertyModal } from './AddPropertyModal';
import { useAuth } from '@/context/AuthContext';
import { canPerformAction } from '@/lib/rbac';

interface PropertiesListViewProps {
  onSelectProperty: (propertyId: string) => void;
}

export function PropertiesListView({ onSelectProperty }: PropertiesListViewProps) {
  const { properties, removeProperty } = useERP();
  const { user } = useAuth();
  const canManage = canPerformAction(user?.role, 'manage_properties');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const confirmDelete = properties.find((p) => p.id === confirmDeleteId);

  const handleDelete = () => {
    if (!confirmDeleteId) return;
    removeProperty(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
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
          {canManage && (
            <Button
              id="add-property-btn"
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          )}
        </div>

        {/* Empty state */}
        {properties.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">No properties yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Property" to register your first hospitality property.</p>
            </div>
            {canManage && (
              <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            )}
          </div>
        )}

        {/* Grid of Properties */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-teal-400 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Delete button (top-right, only if permitted) */}
              {canManage && (
                <button
                  id={`delete-property-${p.id}`}
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                  className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-300 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Remove property"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Card body — clickable to open detail */}
              <div
                className="p-5 flex flex-col flex-1 cursor-pointer"
                onClick={() => onSelectProperty(p.id)}
              >
                <div className="flex items-start justify-between gap-2 pr-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.location}</span>
                    </p>
                  </div>
                  <Badge variant="neutral" size="xs" className="shrink-0 mt-0.5">
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
              <div
                className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs cursor-pointer"
                onClick={() => onSelectProperty(p.id)}
              >
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

      {/* Add Property Modal */}
      <AddPropertyModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
            {/* Icon */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Remove Property?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {/* Property name */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-600 font-medium">You are about to remove:</p>
              <p className="font-bold text-rose-700 text-sm mt-0.5">{confirmDelete.name}</p>
              <p className="text-xs text-rose-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {confirmDelete.location}
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Removing this property will not delete reservations or guest records associated with it, but it will be removed from your active portfolio list.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-${confirmDeleteId}`}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  MapPin,
  ArrowUpRight,
  Plus,
  Trash2,
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
      <div className="space-y-6 animate-fade-in">
        {/* Header Masthead */}
        <div className="bg-white p-5 border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A32] tracking-tight">Hospitality Properties</h1>
              <Badge variant="success" size="xs">
                {properties.length} Active Portfolio
              </Badge>
            </div>
            <p className="text-xs text-[#6B7A87] mt-1">
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
          <div className="bg-white border border-dashed border-[#D8D2C8] p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 bg-[#F0EDE6] border border-[#D8D2C8] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#6B7A87]" />
            </div>
            <div>
              <p className="font-semibold text-[#1E2A32]">No properties yet</p>
              <p className="text-xs text-[#6B7A87] mt-1">Click "Add Property" to register your first hospitality property.</p>
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
              className="group bg-white border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#2E6E8E]/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Delete button (top-right, only if permitted) */}
              {canManage && (
                <button
                  id={`delete-property-${p.id}`}
                  onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                  className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-white/90 border border-[#E2DDD6] text-[#9AAAB6] hover:bg-[#F5EAEA] hover:text-[#8B3A3A] hover:border-[#DDB8B8] transition-all opacity-0 group-hover:opacity-100 rounded-[2px]"
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
                    <h3 className="text-base font-bold text-[#1E2A32] group-hover:text-[#2E6E8E] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#6B7A87] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9AAAB6] shrink-0" />
                      <span>{p.location}</span>
                    </p>
                  </div>
                  <Badge variant="neutral" size="xs" className="shrink-0 mt-0.5">
                    {p.type}
                  </Badge>
                </div>

                <p className="text-xs text-[#6B7A87] mt-3 line-clamp-2">{p.description}</p>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-[#FAF9F7] border border-[#E2DDD6] text-center">
                  <div>
                    <p className="text-[10px] text-[#6B7A87] uppercase font-semibold">Units</p>
                    <p className="text-sm font-bold text-[#1E2A32]">{p.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7A87] uppercase font-semibold">Occupancy</p>
                    <p className="text-sm font-bold text-[#2E6E8E]">{p.occupancyRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B7A87] uppercase font-semibold">MTD Rev</p>
                    <p className="text-sm font-bold text-[#1E2A32] font-tabular">
                      ₹{(p.revenueThisMonth / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 border-t border-[#E2DDD6] bg-[#FAF9F7] flex items-center justify-between text-xs cursor-pointer"
                onClick={() => onSelectProperty(p.id)}
              >
                <span className="text-[#6B7A87]">
                  Today: <strong className="text-[#1E2A32]">{p.todayArrivals} arr</strong> / {p.todayDepartures} dep
                </span>
                <span className="font-semibold text-[#2E6E8E] flex items-center gap-1">
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
          <div className="absolute inset-0 bg-[#1E2A32]/45 backdrop-blur-[1px]" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 bg-white border border-[#E2DDD6] shadow-[0_16px_48px_rgba(0,0,0,0.16)] w-full max-w-sm p-6 flex flex-col gap-5 animate-fade-in-up">
            {/* Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5EAEA] border border-[#DDB8B8] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#8B3A3A]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E2A32] text-sm">Remove Property?</h3>
                <p className="text-xs text-[#6B7A87] mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            {/* Property name */}
            <div className="bg-[#FAF9F7] border border-[#E2DDD6] px-4 py-3">
              <p className="text-xs text-[#8B3A3A] font-medium">You are about to remove:</p>
              <p className="font-bold text-[#1E2A32] text-sm mt-0.5">{confirmDelete.name}</p>
              <p className="text-xs text-[#6B7A87] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#9AAAB6]" /> {confirmDelete.location}
              </p>
            </div>

            <p className="text-xs text-[#6B7A87] leading-relaxed">
              Removing this property will not delete reservations or guest records associated with it, but it will be removed from your active portfolio list.
            </p>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                id={`confirm-delete-${confirmDeleteId}`}
                variant="danger"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

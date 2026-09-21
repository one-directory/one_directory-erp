'use client';

import React, { useState, useEffect } from 'react';
import { UnitStatus, UnitType } from '@/types/erp';
import { useERP } from '@/context/ERPContext';
import {
  X,
  DoorClosed,
  Layers,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  unitTypes: UnitType[];
}

const UNIT_STATUSES: UnitStatus[] = [
  'Available',
  'Dirty',
  'Cleaning',
  'Inspection',
  'Maintenance',
  'Blocked',
  'Out of Service',
];

const COMMON_FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  'Penthouse',
  'Basement',
  'Cottage Zone',
  'Beachfront Row',
];

export function AddUnitModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  unitTypes,
}: AddUnitModalProps) {
  const { addUnit } = useERP();

  const defaultTypeId = unitTypes.length > 0 ? unitTypes[0].id : '';

  const [form, setForm] = useState({
    number: '',
    name: '',
    unitTypeId: defaultTypeId,
    floor: '1st Floor',
    status: 'Available' as UnitStatus,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  // Synchronize unitTypeId when unitTypes prop loads or modal opens
  useEffect(() => {
    if (unitTypes.length > 0 && !form.unitTypeId) {
      setForm((prev) => ({ ...prev, unitTypeId: unitTypes[0].id }));
    }
  }, [unitTypes, form.unitTypeId]);

  const set = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.number.trim()) e.number = 'Unit / Room number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const selectedType = unitTypes.find((t) => t.id === form.unitTypeId);
    const unitTypeName = selectedType ? selectedType.name : 'Standard Room';

    addUnit({
      propertyId,
      propertyName,
      unitTypeId: form.unitTypeId,
      unitTypeName,
      number: form.number.trim(),
      name: form.name.trim() || `${unitTypeName} ${form.number.trim()}`,
      floor: form.floor.trim() || '1st Floor',
      status: form.status,
    });

    handleClose();
  };

  const handleClose = () => {
    setForm({
      number: '',
      name: '',
      unitTypeId: unitTypes[0]?.id || '',
      floor: '1st Floor',
      status: 'Available',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const inputClass = (field: keyof typeof form) =>
    `w-full px-3 py-2.5 text-sm rounded-xl border bg-white transition-colors outline-none focus:ring-2 focus:ring-teal-500/30 ${
      errors[field]
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-slate-200 focus:border-teal-500'
    } text-slate-900 placeholder:text-slate-400`;

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-50/60 via-white to-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-xs shadow-teal-500/20 text-white">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Unit</h2>
              <p className="text-xs text-slate-500">
                Adding to <span className="font-semibold text-teal-700">{propertyName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Unit Number & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Unit / Room Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.number}
                  onChange={(e) => set('number', e.target.value)}
                  placeholder="e.g. 101, Villa 4, B-2"
                  className={inputClass('number')}
                  autoFocus
                />
              </div>
              {errors.number && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.number}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Unit Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Deluxe Room 101"
                className={inputClass('name')}
              />
              <p className="text-[10px] text-slate-400 mt-1">Optional. Auto-named if blank.</p>
            </div>
          </div>

          {/* Unit Type Selection */}
          <div>
            <label className={labelClass}>
              Unit Type / Category <span className="text-rose-500">*</span>
            </label>
            {unitTypes.length > 0 ? (
              <div className="relative">
                <select
                  value={form.unitTypeId}
                  onChange={(e) => set('unitTypeId', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
                >
                  {unitTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} — ₹{type.baseRate.toLocaleString()}/night ({type.capacity} guests)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                No unit types defined for this property yet. A standard category will be assigned.
              </div>
            )}
          </div>

          {/* Floor / Zone */}
          <div>
            <label className={labelClass}>Floor or Zone</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.floor}
                onChange={(e) => set('floor', e.target.value)}
                placeholder="e.g. 1st Floor, Ground Floor"
                className={inputClass('floor')}
              />
            </div>
            {/* Quick floor chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_FLOORS.slice(0, 5).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => set('floor', f)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    form.floor === f
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className={labelClass}>Initial Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UNIT_STATUSES.map((status) => {
                const isSelected = form.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => set('status', status)}
                    className={`px-3 py-2 text-xs rounded-xl font-medium border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/80 text-teal-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{status}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <DoorClosed className="w-4 h-4" />
            Add Unit
          </Button>
        </div>
      </div>
    </div>
  );
}

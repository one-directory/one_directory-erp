'use client';

import React, { useState } from 'react';
import { PropertyType } from '@/types/erp';
import { useERP } from '@/context/ERPContext';
import {
  X,
  Building2,
  MapPin,
  Phone,
  User,
  Mail,
  Hash,
  AlignLeft,
  Tag,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Hotel',
  'Resort',
  'Beach Resort',
  'Homestay',
  'Villa',
  'Apartments',
  'Camp / Cottages',
  'Riverside Stay',
  'Resort / Stay',
];

const PROPERTY_STATUSES = ['Active', 'Under Renovation', 'Seasonal Pause'] as const;

const AMENITY_PRESETS = [
  'WiFi', 'Swimming Pool', 'AC', 'Parking', 'Restaurant',
  'Gym', 'Spa', 'Bar', 'Laundry', 'Room Service',
  'Airport Transfer', 'Pet Friendly', 'Mountain View', 'Sea View',
  'Bonfire Area', 'Trekking', 'Cycling', 'Kayaking',
];

export function AddPropertyModal({ isOpen, onClose }: AddPropertyModalProps) {
  const { addProperty } = useERP();

  const [form, setForm] = useState({
    name: '',
    type: 'Hotel' as PropertyType,
    location: '',
    contact: '',
    totalUnits: '',
    status: 'Active' as 'Active' | 'Under Renovation' | 'Seasonal Pause',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    description: '',
    amenities: [] as string[],
    customAmenity: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const set = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    const val = form.customAmenity.trim();
    if (!val || form.amenities.includes(val)) return;
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, val], customAmenity: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) e.name = 'Property name is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.ownerName.trim()) e.ownerName = 'Owner name is required.';
    if (form.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail))
      e.ownerEmail = 'Invalid email address.';
    if (form.totalUnits && isNaN(Number(form.totalUnits)))
      e.totalUnits = 'Must be a number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addProperty({
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim(),
      contact: form.contact.trim(),
      totalUnits: form.totalUnits ? parseInt(form.totalUnits) : 0,
      status: form.status,
      ownerName: form.ownerName.trim(),
      ownerEmail: form.ownerEmail.trim(),
      ownerPhone: form.ownerPhone.trim(),
      description: form.description.trim(),
      amenities: form.amenities,
    });
    handleClose();
  };

  const handleClose = () => {
    setForm({
      name: '', type: 'Hotel', location: '', contact: '', totalUnits: '',
      status: 'Active', ownerName: '', ownerEmail: '', ownerPhone: '',
      description: '', amenities: [], customAmenity: '',
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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Property</h2>
              <p className="text-xs text-slate-500">Fill in the details to register a new property</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Row 1: Name + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Property Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  className={`${inputClass('name')} pl-9`}
                  placeholder="e.g. Heritage Haveli & Suites"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className={labelClass}>Property Type</label>
              <select
                className={inputClass('type')}
                value={form.type}
                onChange={(e) => set('type', e.target.value as PropertyType)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Location + Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Location <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  className={`${inputClass('location')} pl-9`}
                  placeholder="e.g. Jaipur, Rajasthan"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </div>
              {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className={labelClass}>Property Contact</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  className={`${inputClass('contact')} pl-9`}
                  placeholder="+91 98000 00000"
                  value={form.contact}
                  onChange={(e) => set('contact', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Total Units + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Units / Rooms</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  className={`${inputClass('totalUnits')} pl-9`}
                  placeholder="e.g. 24"
                  value={form.totalUnits}
                  onChange={(e) => set('totalUnits', e.target.value)}
                />
              </div>
              {errors.totalUnits && <p className="text-xs text-rose-500 mt-1">{errors.totalUnits}</p>}
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass('status')}
                value={form.status}
                onChange={(e) => set('status', e.target.value as typeof form.status)}
              >
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Owner / Manager Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  Owner Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    className={`${inputClass('ownerName')} pl-9`}
                    placeholder="Full name"
                    value={form.ownerName}
                    onChange={(e) => set('ownerName', e.target.value)}
                  />
                </div>
                {errors.ownerName && <p className="text-xs text-rose-500 mt-1">{errors.ownerName}</p>}
              </div>
              <div>
                <label className={labelClass}>Owner Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    className={`${inputClass('ownerEmail')} pl-9`}
                    placeholder="owner@email.com"
                    value={form.ownerEmail}
                    onChange={(e) => set('ownerEmail', e.target.value)}
                  />
                </div>
                {errors.ownerEmail && <p className="text-xs text-rose-500 mt-1">{errors.ownerEmail}</p>}
              </div>
              <div>
                <label className={labelClass}>Owner Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    className={`${inputClass('ownerPhone')} pl-9`}
                    placeholder="+91 98000 00000"
                    value={form.ownerPhone}
                    onChange={(e) => set('ownerPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <textarea
                rows={3}
                className={`${inputClass('description')} pl-9 resize-none`}
                placeholder="Brief description of the property, its setting and highlights..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className={labelClass}>Amenities</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {AMENITY_PRESETS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    form.amenities.includes(a)
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
                  }`}
                >
                  {form.amenities.includes(a) && <CheckCircle2 className="w-3 h-3" />}
                  {a}
                </button>
              ))}
            </div>
            {/* Custom amenity input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white placeholder:text-slate-400"
                  placeholder="Add custom amenity..."
                  value={form.customAmenity}
                  onChange={(e) => set('customAmenity', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                />
              </div>
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.amenities.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {form.amenities.length} amenities selected
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-400">
            <span className="text-rose-400">*</span> Required fields
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} className="gap-2">
              <Building2 className="w-3.5 h-3.5" />
              Add Property
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

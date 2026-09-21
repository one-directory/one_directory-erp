'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { OTAChannel } from '@/types/erp';
import { X, Sparkles, Calendar, User, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const OTA_THEMES: Record<
  OTAChannel,
  { name: string; badgeClass: string; borderClass: string; bgClass: string; logoText: string; defaultCommission: number }
> = {
  Airbnb: {
    name: 'Airbnb',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-rose-400 ring-rose-200',
    bgClass: 'bg-rose-50/50',
    logoText: 'ABNB',
    defaultCommission: 15,
  },
  'Booking.com': {
    name: 'Booking.com',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClass: 'border-blue-400 ring-blue-200',
    bgClass: 'bg-blue-50/50',
    logoText: 'BDC',
    defaultCommission: 18,
  },
  Agoda: {
    name: 'Agoda',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-amber-400 ring-amber-200',
    bgClass: 'bg-amber-50/50',
    logoText: 'AGD',
    defaultCommission: 17,
  },
  MakeMyTrip: {
    name: 'MakeMyTrip',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-emerald-400 ring-emerald-200',
    bgClass: 'bg-emerald-50/50',
    logoText: 'MMT',
    defaultCommission: 20,
  },
};

const SAMPLE_GUEST_NAMES = [
  { name: 'Siddharth Sen', email: 'siddharth.sen@gmail.com', phone: '+91 98201 44810' },
  { name: 'Pooja Hegde', email: 'pooja.hegde@outlook.com', phone: '+91 98450 33219' },
  { name: 'Marc Vandevelde', email: 'marc.v@brusselsmail.be', phone: '+32 470 12 34 56' },
  { name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98110 54321' },
];

export function SimulateBookingModal() {
  const {
    properties,
    unitTypes,
    units,
    closeGlobalModal,
    simulateIncomingOtaBooking,
  } = useERP();

  const [channel, setChannel] = useState<OTAChannel>('MakeMyTrip');
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || 'prop-1');
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string>(unitTypes[0]?.id || 'ut-1');
  const [guestIndex, setGuestIndex] = useState(0);
  const [nights, setNights] = useState(2);
  const [guestsCount, setGuestsCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available room types for selected property
  const propUnitTypes = unitTypes.filter((ut) => ut.propertyId === propertyId);
  const currentUnitType = propUnitTypes.find((ut) => ut.id === selectedUnitTypeId) || propUnitTypes[0] || unitTypes[0];
  const selectedProperty = properties.find((p) => p.id === propertyId) || properties[0];

  // Pricing calculations
  const baseRate = currentUnitType?.baseRate || 4500;
  const theme = OTA_THEMES[channel];
  const markupMultiplier = 1 + (theme.defaultCommission === 15 ? 0.10 : theme.defaultCommission === 18 ? 0.15 : theme.defaultCommission === 17 ? 0.12 : 0.14);
  const channelNightlyRate = Math.round(baseRate * markupMultiplier);
  const roomCharge = channelNightlyRate * nights;
  const tax = Math.round(roomCharge * 0.12);
  const totalAmount = roomCharge + tax;
  const commissionAmount = Math.round(roomCharge * (theme.defaultCommission / 100));
  const netPayout = totalAmount - commissionAmount;

  const currentGuest = SAMPLE_GUEST_NAMES[guestIndex];

  const handleSimulate = async () => {
    setIsSubmitting(true);
    try {
      await simulateIncomingOtaBooking({
        channel,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        unitTypeId: currentUnitType.id,
        unitTypeName: currentUnitType.name,
        guestName: currentGuest.name,
        guestEmail: currentGuest.email,
        guestPhone: currentGuest.phone,
        nights,
        guestsCount,
        baseRate,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">OTA Instant Booking Simulator</h3>
              <p className="text-xs text-slate-500">Inject incoming webhook reservation & verify real-time 2-way sync</p>
            </div>
          </div>
          <button
            onClick={closeGlobalModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Distribution Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'] as OTAChannel[]).map((c) => {
                const t = OTA_THEMES[c];
                const isSelected = channel === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${t.borderClass} ${t.bgClass} ring-2 shadow-xs`
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${t.badgeClass}`}>
                        {t.logoText}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </div>
                    <p className="font-bold text-xs text-slate-900 leading-tight">{t.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.defaultCommission}% Comm.</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property & Room Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Property</label>
              <div className="relative">
                <select
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value);
                    const matchingTypes = unitTypes.filter((ut) => ut.propertyId === e.target.value);
                    if (matchingTypes[0]) setSelectedUnitTypeId(matchingTypes[0].id);
                  }}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Room / Unit Type</label>
              <select
                value={currentUnitType?.id}
                onChange={(e) => setSelectedUnitTypeId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              >
                {propUnitTypes.map((ut) => (
                  <option key={ut.id} value={ut.id}>
                    {ut.name} (Base ₹{ut.baseRate.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Details & Length of stay */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Simulated Guest</label>
              <select
                value={guestIndex}
                onChange={(e) => setGuestIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              >
                {SAMPLE_GUEST_NAMES.map((g, idx) => (
                  <option key={idx} value={idx}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nights</label>
              <input
                type="number"
                min="1"
                max="14"
                value={nights}
                onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Guests Count</label>
              <input
                type="number"
                min="1"
                max="6"
                value={guestsCount}
                onChange={(e) => setGuestsCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Live Financial Breakdown Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>{channel} Nightly Rate (with channel markup):</span>
              <span className="font-semibold text-slate-700">₹{channelNightlyRate.toLocaleString('en-IN')} / night</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Gross Total ({nights} nights + 12% GST):</span>
              <span className="font-semibold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-rose-600">
              <span>{channel} Commission ({theme.defaultCommission}%):</span>
              <span className="font-semibold">-₹{commissionAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="font-bold text-slate-900">Net Payable to Hotel:</span>
              <span className="text-sm font-extrabold text-teal-700">₹{netPayout.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Automated Stop-Sell Notice */}
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-2.5 text-xs text-teal-800">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Automatic Two-Way Parity Protection:</p>
              <p className="text-teal-700 text-[11px] mt-0.5">
                Ingesting this booking will assign an available room and immediately trigger outbound calendar blocks on the other 3 OTAs to prevent double-bookings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={closeGlobalModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSimulate}
            disabled={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Simulating Ingestion...' : `Inject ${channel} Booking`}
          </Button>
        </div>
      </div>
    </div>
  );
}

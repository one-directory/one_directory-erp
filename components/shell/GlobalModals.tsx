'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Check,
  Calendar,
  User,
  Building2,
  CreditCard,
  PhoneCall,
  Sparkles,
  Wrench,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function GlobalModals() {
  const {
    activeModal,
    closeGlobalModal,
    properties,
    units,
    guests,
    unitTypes,
    addReservation,
    addLead,
    addFollowUp,
    completeFollowUp,
    addQuotation,
    recordPayment,
    addExpense,
    addMaintenanceTicket,
    addHousekeepingTask,
    addGuest,
  } = useERP();

  // Multi-step reservation wizard local state
  const [resStep, setResStep] = useState(1);
  const [resGuestName, setResGuestName] = useState('Rahul Sharma');
  const [resGuestPhone, setResGuestPhone] = useState('+91 98450 12345');
  const [resGuestEmail, setResGuestEmail] = useState('rahul.sharma@gmail.com');
  const [resPropertyId, setResPropertyId] = useState(properties[0]?.id || 'prop-1');
  const [resCheckIn, setResCheckIn] = useState('2026-09-20');
  const [resCheckOut, setResCheckOut] = useState('2026-09-22');
  const [resAdults, setResAdults] = useState(2);
  const [resChildren, setResChildren] = useState(0);
  const [resUnitId, setResUnitId] = useState('');
  const [resRate, setResRate] = useState(10000);
  const [resDiscount, setResDiscount] = useState(500);
  const [resTax, setResTax] = useState(1140);
  const [resPaidAmount, setResPaidAmount] = useState(5000);
  const [resPaymentMethod, setResPaymentMethod] = useState<'Cash' | 'UPI' | 'Credit Card' | 'Bank Transfer'>('UPI');
  const [resSpecialNotes, setResSpecialNotes] = useState('Quiet room requested with early check-in if possible');

  // Complete follow-up state
  const [fuOutcome, setFuOutcome] = useState('Interested');
  const [fuDuration, setFuDuration] = useState('3m 15s');
  const [fuNotes, setFuNotes] = useState('Guest requested best available sea-view rate');
  const [fuNextAction, setFuNextAction] = useState('Create booking');
  const [fuNextDate, setFuNextDate] = useState('2026-09-20');
  const [fuNextTime, setFuNextTime] = useState('11:00 AM');

  // Simple modal states
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadProp, setLeadProp] = useState(properties[0]?.id || '');
  const [leadCheckIn, setLeadCheckIn] = useState('2026-09-25');
  const [leadCheckOut, setLeadCheckOut] = useState('2026-09-27');
  const [leadEstValue, setLeadEstValue] = useState(15000);
  const [leadNotes, setLeadNotes] = useState('');

  // Payment modal state
  const [payResId, setPayResId] = useState('');
  const [payAmount, setPayAmount] = useState(5000);
  const [payMethod, setPayMethod] = useState<'UPI' | 'Credit Card' | 'Cash' | 'Bank Transfer'>('UPI');
  const [payRef, setPayRef] = useState('');

  // Maintenance modal state
  const [maintProp, setMaintProp] = useState(properties[0]?.id || '');
  const [maintUnit, setMaintUnit] = useState('');
  const [maintIssue, setMaintIssue] = useState('');
  const [maintPriority, setMaintPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('High');

  // Housekeeping modal state
  const [hkProp, setHkProp] = useState(properties[0]?.id || '');
  const [hkUnit, setHkUnit] = useState('');
  const [hkType, setHkType] = useState<any>('Checkout Cleaning');

  // Expense modal state
  const [expProp, setExpProp] = useState(properties[0]?.id || '');
  const [expCategory, setExpCategory] = useState<any>('Supplies');
  const [expVendor, setExpVendor] = useState('');
  const [expAmount, setExpAmount] = useState(3500);
  const [expDesc, setExpDesc] = useState('');

  // Guest modal state
  const [gName, setGName] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gVip, setGVip] = useState(false);
  const [gPref, setGPref] = useState('');

  if (!activeModal) return null;

  // 1. Multi-Step New Reservation
  if (activeModal.type === 'new-reservation') {
    const selectedProp = properties.find((p) => p.id === resPropertyId) || properties[0];
    const availableUnits = units.filter(
      (u) => u.propertyId === selectedProp.id && (u.status === 'Available' || u.status === 'Dirty')
    );
    const chosenUnit = units.find((u) => u.id === resUnitId) || availableUnits[0];

    const totalCalculated = resRate - resDiscount + resTax;

    const handleConfirmReservation = () => {
      addReservation({
        guestName: resGuestName,
        guestPhone: resGuestPhone,
        guestEmail: resGuestEmail,
        propertyId: selectedProp.id,
        propertyName: selectedProp.name,
        unitId: chosenUnit?.id,
        unitNumber: chosenUnit?.number,
        unitTypeName: chosenUnit?.unitTypeName || 'Standard Room',
        checkIn: resCheckIn,
        checkOut: resCheckOut,
        nights: 2,
        guestsCount: resAdults + resChildren,
        rate: resRate,
        discount: resDiscount,
        tax: resTax,
        total: totalCalculated,
        paid: resPaidAmount,
        specialRequests: resSpecialNotes,
      });
      setResStep(1);
    };

    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Create New Reservation"
        subtitle={`Step ${resStep} of 8: ${
          resStep === 1
            ? 'Guest Information'
            : resStep === 2
            ? 'Select Property'
            : resStep === 3
            ? 'Stay Dates'
            : resStep === 4
            ? 'Guest Count'
            : resStep === 5
            ? 'Room Selection'
            : resStep === 6
            ? 'Pricing & Taxes'
            : resStep === 7
            ? 'Payment Record'
            : 'Summary & Confirmation'
        }`}
        maxWidth="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {resStep > 1 && (
                <Button variant="secondary" size="sm" onClick={() => setResStep((s) => s - 1)}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
                Cancel
              </Button>
              {resStep < 8 ? (
                <Button variant="primary" size="sm" onClick={() => setResStep((s) => s + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="success" size="sm" onClick={handleConfirmReservation}>
                  Confirm Booking
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div
              key={s}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                s === resStep
                  ? 'bg-teal-600 text-white'
                  : s < resStep
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s < resStep ? '✓' : s}
            </div>
          ))}
        </div>

        {/* Step 1: Guest */}
        {resStep === 1 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guest Full Name
              </label>
              <input
                type="text"
                value={resGuestName}
                onChange={(e) => setResGuestName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={resGuestPhone}
                  onChange={(e) => setResGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="+91 98450 12345"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resGuestEmail}
                  onChange={(e) => setResGuestEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="guest@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Property */}
        {resStep === 2 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Accommodation Property
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => setResPropertyId(prop.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    resPropertyId === prop.id
                      ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{prop.name}</h4>
                    <p className="text-xs text-slate-500">
                      {prop.location} • {prop.type}
                    </p>
                  </div>
                  <span className="text-xs text-teal-700 font-semibold">{prop.occupancyRate}% Occ</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {resStep === 3 && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={resCheckIn}
                onChange={(e) => setResCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={resCheckOut}
                onChange={(e) => setResCheckOut(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: Guests */}
        {resStep === 4 && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adults (Ages 12+)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={resAdults}
                onChange={(e) => setResAdults(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Children (Ages 2-11)
              </label>
              <input
                type="number"
                min={0}
                max={6}
                value={resChildren}
                onChange={(e) => setResChildren(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Room */}
        {resStep === 5 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Available Units ({selectedProp.name})
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableUnits.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
                  No clean units immediately available; you may select from all units below.
                </p>
              ) : (
                availableUnits.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setResUnitId(u.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      (resUnitId || availableUnits[0]?.id) === u.id
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {u.number} - {u.unitTypeName}
                      </h4>
                      <p className="text-xs text-slate-500">{u.floor}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {u.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 6: Pricing */}
        {resStep === 6 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Rate (₹)
                </label>
                <input
                  type="number"
                  value={resRate}
                  onChange={(e) => setResRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  value={resDiscount}
                  onChange={(e) => setResDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax 12% GST (₹)
                </label>
                <input
                  type="number"
                  value={resTax}
                  onChange={(e) => setResTax(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Total Booking Amount:</span>
              <span className="text-lg font-bold text-teal-700 font-tabular">
                ₹{totalCalculated.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}

        {/* Step 7: Payment */}
        {resStep === 7 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance / Collected Amount (₹)
                </label>
                <input
                  type="number"
                  value={resPaidAmount}
                  onChange={(e) => setResPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={resPaymentMethod}
                  onChange={(e) => setResPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash at Front Desk</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Remaining balance: ₹{(totalCalculated - resPaidAmount).toLocaleString('en-IN')} (to be collected on check-in)
            </p>
          </div>
        )}

        {/* Step 8: Summary */}
        {resStep === 8 && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <h4 className="font-bold text-sm text-slate-900 mb-2">Reservation Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <p>
                <span className="text-slate-500">Guest:</span> <strong>{resGuestName}</strong>
              </p>
              <p>
                <span className="text-slate-500">Phone:</span> <strong>{resGuestPhone}</strong>
              </p>
              <p>
                <span className="text-slate-500">Property:</span> <strong>{selectedProp.name}</strong>
              </p>
              <p>
                <span className="text-slate-500">Unit:</span> <strong>{chosenUnit?.number || 'Selected Room'}</strong>
              </p>
              <p>
                <span className="text-slate-500">Dates:</span> <strong>{resCheckIn} → {resCheckOut}</strong>
              </p>
              <p>
                <span className="text-slate-500">Guests:</span> <strong>{resAdults} Adults, {resChildren} Kids</strong>
              </p>
              <p>
                <span className="text-slate-500">Total Price:</span> <strong>₹{totalCalculated.toLocaleString('en-IN')}</strong>
              </p>
              <p>
                <span className="text-slate-500">Paid Now:</span> <strong>₹{resPaidAmount.toLocaleString('en-IN')} ({resPaymentMethod})</strong>
              </p>
            </div>
          </div>
        )}
      </Modal>
    );
  }

  // 2. Complete Follow-Up Dialog
  if (activeModal.type === 'complete-followup') {
    const targetFu = activeModal.data;
    if (!targetFu) return null;

    const handleSaveFollowupOutcome = () => {
      completeFollowUp(
        targetFu.id,
        fuOutcome,
        fuDuration,
        fuNotes,
        fuNextAction,
        fuNextDate,
        fuNextTime
      );
    };

    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Complete Follow-up Call"
        subtitle={`Guest: ${targetFu.guestName} • ${targetFu.propertyName}`}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleSaveFollowupOutcome}>
              Save Call Outcome
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Call Outcome
            </label>
            <select
              value={fuOutcome}
              onChange={(e) => setFuOutcome(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Call Later">Call Later</option>
              <option value="No Response">No Response</option>
              <option value="Price Objection">Price Objection</option>
              <option value="Dates Unavailable">Dates Unavailable</option>
              <option value="Booking Confirmed">Booking Confirmed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Call Duration
              </label>
              <input
                type="text"
                value={fuDuration}
                onChange={(e) => setFuDuration(e.target.value)}
                placeholder="e.g. 3m 24s"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Next Action
              </label>
              <select
                value={fuNextAction}
                onChange={(e) => setFuNextAction(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="No further action">No further action</option>
                <option value="Create next follow-up">Create next follow-up</option>
                <option value="Send quotation">Send quotation</option>
                <option value="Create booking">Create booking</option>
              </select>
            </div>
          </div>

          {fuNextAction === 'Create next follow-up' && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={fuNextDate}
                  onChange={(e) => setFuNextDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-teal-900 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="text"
                  value={fuNextTime}
                  onChange={(e) => setFuNextTime(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Call & Outcome Notes
            </label>
            <textarea
              rows={3}
              value={fuNotes}
              onChange={(e) => setFuNotes(e.target.value)}
              placeholder="Enter discussion notes, specific room desires or discount discussions..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    );
  }

  // 3. New Lead Modal
  if (activeModal.type === 'new-lead') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Create New Lead"
        subtitle="Capture new guest enquiry into CRM pipeline"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addLead({
                  guestName: leadName || 'Inquiring Guest',
                  guestPhone: leadPhone || '+91 98000 00000',
                  propertyId: leadProp || properties[0].id,
                  checkIn: leadCheckIn,
                  checkOut: leadCheckOut,
                  estimatedValue: leadEstValue,
                  notes: leadNotes,
                });
              }}
            >
              Add Lead
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guest Name
            </label>
            <input
              type="text"
              placeholder="e.g. Manish Agarwal"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+91 98310 99011"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interested Property
            </label>
            <select
              value={leadProp}
              onChange={(e) => setLeadProp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Check-in
              </label>
              <input
                type="date"
                value={leadCheckIn}
                onChange={(e) => setLeadCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Value (₹)
              </label>
              <input
                type="number"
                value={leadEstValue}
                onChange={(e) => setLeadEstValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Notes / Requests
            </label>
            <textarea
              rows={2}
              value={leadNotes}
              onChange={(e) => setLeadNotes(e.target.value)}
              placeholder="Guest inquired via phone regarding sea-view cottage..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    );
  }

  // 4. Record Payment Modal
  if (activeModal.type === 'record-payment') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Record Payment"
        subtitle="Log guest transaction and update booking ledger"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                recordPayment({
                  amount: payAmount,
                  method: payMethod,
                  referenceNumber: payRef || `UPI-${Math.floor(100000 + Math.random() * 900000)}`,
                });
              }}
            >
              Record Payment
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-teal-700 font-tabular"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash at Reception</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Reference / UTR Number
            </label>
            <input
              type="text"
              placeholder="e.g. UPI/3301984210/HDFC"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    );
  }

  // 5. Maintenance Ticket Modal
  if (activeModal.type === 'maintenance-ticket') {
    const propUnits = units.filter((u) => u.propertyId === (maintProp || properties[0].id));
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Log Maintenance Ticket"
        subtitle="Unit will automatically be marked as Maintenance"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                addMaintenanceTicket({
                  propertyId: maintProp,
                  unitId: maintUnit || propUnits[0]?.id,
                  issue: maintIssue || 'Equipment issue',
                  priority: maintPriority,
                });
              }}
            >
              Create Ticket
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property
            </label>
            <select
              value={maintProp}
              onChange={(e) => setMaintProp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit / Room
            </label>
            <select
              value={maintUnit}
              onChange={(e) => setMaintUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {propUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number} - {u.unitTypeName} ({u.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reported Issue
            </label>
            <input
              type="text"
              placeholder="e.g. AC not cooling, bathroom mixer leaking..."
              value={maintIssue}
              onChange={(e) => setMaintIssue(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={maintPriority}
              onChange={(e) => setMaintPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Modal>
    );
  }

  // 6. Housekeeping Task Modal
  if (activeModal.type === 'housekeeping-task') {
    const propUnits = units.filter((u) => u.propertyId === (hkProp || properties[0].id));
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Schedule Housekeeping Task"
        subtitle="Assign cleaning or inspection task to duty staff"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addHousekeepingTask({
                  propertyId: hkProp,
                  unitId: hkUnit || propUnits[0]?.id,
                  taskType: hkType,
                });
              }}
            >
              Schedule Task
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property
            </label>
            <select
              value={hkProp}
              onChange={(e) => setHkProp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unit / Room
            </label>
            <select
              value={hkUnit}
              onChange={(e) => setHkUnit(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {propUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.number} - {u.unitTypeName} ({u.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Type
            </label>
            <select
              value={hkType}
              onChange={(e) => setHkType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="Checkout Cleaning">Checkout Cleaning</option>
              <option value="Regular Cleaning">Regular Cleaning</option>
              <option value="Deep Cleaning">Deep Cleaning</option>
              <option value="Linen Change">Linen Change</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
        </div>
      </Modal>
    );
  }

  // 7. Add Expense Modal
  if (activeModal.type === 'add-expense') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Record Operating Expense"
        subtitle="Log operational overhead or vendor bill"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addExpense({
                  propertyId: expProp,
                  category: expCategory,
                  vendor: expVendor || 'Local Vendor',
                  amount: expAmount,
                  description: expDesc || 'Operational expense',
                });
              }}
            >
              Add Expense
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property
            </label>
            <select
              value={expProp}
              onChange={(e) => setExpProp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
                <option value="Internet">Internet</option>
                <option value="Laundry">Laundry</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Supplies">Supplies</option>
                <option value="Food">Food</option>
                <option value="Staff">Staff</option>
                <option value="OTA Commission">OTA Commission</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Payee
            </label>
            <input
              type="text"
              placeholder="e.g. MESCOM Udupi Division"
              value={expVendor}
              onChange={(e) => setExpVendor(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly commercial electricity billing"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    );
  }

  // 8. New Guest Modal
  if (activeModal.type === 'new-guest') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Register New Guest Profile"
        subtitle="Create guest CRM record with preferences"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addGuest({
                  name: gName || 'Guest Name',
                  phone: gPhone || '+91 98000 00000',
                  email: gEmail || 'guest@example.com',
                  vip: gVip,
                  preferences: gPref ? [gPref] : [],
                });
              }}
            >
              Create Profile
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Vikramaditya Oberoi"
              value={gName}
              onChange={(e) => setGName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98110 55210"
                value={gPhone}
                onChange={(e) => setGPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="guest@domain.com"
                value={gEmail}
                onChange={(e) => setGEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guest Preferences / Special Requests
            </label>
            <input
              type="text"
              placeholder="e.g. Vegetarian meal, high floor, quiet wing"
              value={gPref}
              onChange={(e) => setGPref(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="vipCheckbox"
              checked={gVip}
              onChange={(e) => setGVip(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <label htmlFor="vipCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Mark as VIP Guest
            </label>
          </div>
        </div>
      </Modal>
    );
  }

  // 9. New Follow-up Modal
  if (activeModal.type === 'new-followup') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Schedule Guest Follow-up"
        subtitle="Add call, WhatsApp or email reminder"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addFollowUp({
                  guestName: leadName || 'Guest',
                  guestPhone: leadPhone || '+91 98450 12345',
                  propertyId: leadProp || properties[0].id,
                  purpose: leadNotes || 'Booking inquiry follow-up',
                  scheduledDate: '2026-09-19',
                  scheduledTime: '02:00 PM',
                });
              }}
            >
              Schedule Follow-up
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guest Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+91 98450 12345"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Purpose / Agenda
            </label>
            <input
              type="text"
              placeholder="e.g. Confirm booking after quotation review"
              value={leadNotes}
              onChange={(e) => setLeadNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    );
  }

  // 10. New Quotation Modal
  if (activeModal.type === 'new-quotation') {
    return (
      <Modal
        isOpen={true}
        onClose={closeGlobalModal}
        title="Generate New Quotation"
        subtitle="Create official branded stay quotation for guest"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={closeGlobalModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                addQuotation({
                  guestName: leadName || 'Rahul Sharma',
                  guestPhone: leadPhone || '+91 98450 12345',
                  propertyId: leadProp || properties[0].id,
                  checkIn: leadCheckIn,
                  checkOut: leadCheckOut,
                  roomCharge: leadEstValue || 12000,
                  discount: 1000,
                  tax: 1560,
                  roomTypeName: 'Superior Suite',
                });
              }}
            >
              Generate Quotation
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Guest Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Property
            </label>
            <select
              value={leadProp}
              onChange={(e) => setLeadProp(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={leadCheckIn}
                onChange={(e) => setLeadCheckIn(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Charge (₹)
              </label>
              <input
                type="number"
                value={leadEstValue}
                onChange={(e) => setLeadEstValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
}

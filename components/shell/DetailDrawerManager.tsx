'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Phone,
  MessageSquare,
  CheckCircle,
  Calendar,
  CreditCard,
  Building2,
  User,
  Clock,
  FileText,
  Sparkles,
  Wrench,
  Printer,
  ArrowRight,
  Send,
  Star,
  ShieldAlert,
} from 'lucide-react';

export function DetailDrawerManager() {
  const {
    activeDrawer,
    closeDrawer,
    guests,
    leads,
    followUps,
    reservations,
    quotations,
    payments,
    housekeepingTasks,
    maintenanceTickets,
    invoices,
    properties,
    checkInGuest,
    checkOutGuest,
    completeHousekeepingTask,
    inspectHousekeepingTask,
    resolveMaintenanceTicket,
    convertQuotationToBooking,
    openGlobalModal,
    showToast,
  } = useERP();

  if (!activeDrawer) return null;

  const { type, id } = activeDrawer;

  // 1. Guest Detail Drawer with Unified Timeline
  if (type === 'guest') {
    const guest = guests.find((g) => g.id === id);
    if (!guest) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={guest.name}
        subtitle={`${guest.phone} • ${guest.email}`}
        badge={<Badge status={guest.status}>{guest.status}</Badge>}
        width="xl"
      >
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Stays</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{guest.totalStays}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Spend</p>
              <p className="text-lg font-bold text-teal-700 mt-0.5 font-tabular">
                ₹{guest.totalSpend.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Last Stay</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {guest.lastStayDate || 'First Visit'}
              </p>
            </div>
          </div>

          {/* Preferences */}
          {guest.preferences.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Guest Preferences & Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {guest.preferences.map((pref, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-100 font-medium"
                  >
                    ★ {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* MOST IMPORTANT: Unified Guest Lifecycle Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Unified Guest Lifecycle Journey
              </h4>
              <span className="text-[11px] text-teal-700 font-semibold">End-to-End ERP History</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                <span className="text-[10px] font-bold text-teal-700 uppercase">19 Sep • 10:15 AM</span>
                <p className="text-xs font-semibold text-slate-900">Phone Enquiry Received</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guest called inquiring for sea-view cottage at Vistara Beach Resort. Inbound call by Arun (4m 10s).
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                <span className="text-[10px] font-bold text-teal-700 uppercase">19 Sep • 04:30 PM</span>
                <p className="text-xs font-semibold text-slate-900">Official Quotation Sent</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quotation OD-Q-2026-0021 generated for ₹14,560 (2 Nights, Cliff View Cottage). Sent via WhatsApp.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                <span className="text-[10px] font-bold text-teal-700 uppercase">20 Sep • 11:30 AM</span>
                <p className="text-xs font-semibold text-slate-900">Follow-up Call & Negotiation</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Guest confirmed dates. Applied ₹1,000 loyalty repeat discount.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">20 Sep • 11:45 AM</span>
                <p className="text-xs font-semibold text-slate-900">Booking Confirmed & Advance Paid</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reservation OD-BKG-2026-00982 confirmed. Advance payment of ₹5,000 recorded via UPI.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-sky-100" />
                <span className="text-[10px] font-bold text-sky-700 uppercase">25 Sep • 01:00 PM</span>
                <p className="text-xs font-semibold text-slate-900">Guest Check-in</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Front desk check-in at Vistara Cliff Cottage CVC-01. Keys handed over with welcome drink.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-amber-100" />
                <span className="text-[10px] font-bold text-amber-700 uppercase">27 Sep • 11:00 AM</span>
                <p className="text-xs font-semibold text-slate-900">Check-out & Housekeeping Trigger</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Balance settled. Unit marked Dirty and checkout sanitization task dispatched immediately.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                <span className="text-[10px] font-bold text-purple-700 uppercase">28 Sep</span>
                <p className="text-xs font-semibold text-slate-900">Review Received (5.0 ★ Google)</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  "Incredible stay! The cliff top views over Om Beach are mesmerizing. Arun and the team were very polite."
                </p>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    );
  }

  // 2. Lead Detail Drawer
  if (type === 'lead') {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={lead.leadNumber}
        subtitle={`${lead.guestName} • ${lead.propertyName}`}
        badge={<Badge status={lead.status}>{lead.status}</Badge>}
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Phone className="w-3.5 h-3.5 text-teal-600" />}
                onClick={() => showToast('Simulating call...', `Dialing ${lead.guestPhone}`)}
              >
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => showToast('Simulating WhatsApp...', `Opening WhatsApp chat with ${lead.guestPhone}`)}
              >
                WhatsApp
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openGlobalModal('new-quotation', lead)}
              >
                Create Quotation
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openGlobalModal('new-reservation', lead)}
              >
                Convert to Booking
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Guest Name:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{lead.guestName}</p>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{lead.guestPhone}</p>
            </div>
            <div>
              <span className="text-slate-500">Estimated Value:</span>
              <p className="font-bold text-teal-700 mt-0.5 font-tabular">
                ₹{lead.estimatedValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Source:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{lead.source}</p>
            </div>
            <div>
              <span className="text-slate-500">Dates:</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {lead.checkIn} → {lead.checkOut}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Assigned To:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{lead.assignedTo}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Inquiry Notes
            </h4>
            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
              {lead.notes}
            </p>
          </div>
        </div>
      </Drawer>
    );
  }

  // 3. Follow-up Detail Drawer
  if (type === 'followup') {
    const fu = followUps.find((f) => f.id === id);
    if (!fu) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={`Follow-up: ${fu.guestName}`}
        subtitle={`${fu.propertyName} • Scheduled ${fu.scheduledDate} at ${fu.scheduledTime}`}
        badge={<Badge status={fu.status}>{fu.status}</Badge>}
        width="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Phone className="w-3.5 h-3.5 text-teal-600" />}
                onClick={() => showToast('Simulating call...', `Calling ${fu.guestPhone}`)}
              >
                Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => showToast('Simulating WhatsApp...', `Sending WhatsApp to ${fu.guestPhone}`)}
              >
                WhatsApp
              </Button>
            </div>
            {fu.status !== 'Completed' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  closeDrawer();
                  openGlobalModal('complete-followup', fu);
                }}
              >
                Complete Follow-up
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div>
              <span className="text-slate-500">Purpose:</span>
              <p className="font-semibold text-slate-900 mt-0.5">{fu.purpose}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-500">Channel:</span>
                <p className="font-semibold text-slate-800">{fu.type}</p>
              </div>
              <div>
                <span className="text-slate-500">Assigned Staff:</span>
                <p className="font-semibold text-slate-800">{fu.assignedTo}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              Internal Notes
            </h4>
            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
              {fu.notes}
            </p>
          </div>

          {fu.completedAt && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800">Completed on: {fu.completedAt}</span>
              <p className="text-emerald-700 mt-1">Outcome: {fu.callOutcome}</p>
            </div>
          )}
        </div>
      </Drawer>
    );
  }

  // 4. Reservation Detail Drawer
  if (type === 'reservation') {
    const res = reservations.find((r) => r.id === id);
    if (!res) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={res.bookingId}
        subtitle={`${res.guestName} • ${res.propertyName} (${res.unitNumber})`}
        badge={<Badge status={res.status}>{res.status}</Badge>}
        width="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => showToast('Simulating Invoice Print', `Printed invoice for ${res.bookingId}`)}
              >
                Print Invoice
              </Button>
              {res.balance > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openGlobalModal('record-payment', res)}
                >
                  Record Payment
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {res.status === 'Confirmed' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    checkInGuest(res.id);
                  }}
                >
                  Check In Guest
                </Button>
              )}
              {(res.status === 'Checked In' || res.status === 'In House') && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    checkOutGuest(res.id);
                  }}
                >
                  Check Out Guest
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Financial Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Financial Summary
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Rate ({res.nights} Nights)</span>
                <span className="font-tabular">₹{res.rate.toLocaleString('en-IN')}</span>
              </div>
              {res.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount Applied</span>
                  <span className="font-tabular">-₹{res.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>GST (12% Accommodation Tax)</span>
                <span className="font-tabular">₹{res.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount:</span>
                <span className="text-teal-800 font-tabular">₹{res.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700">
                <span>Amount Paid:</span>
                <span className="font-tabular">₹{res.paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-rose-700">
                <span>Outstanding Balance:</span>
                <span className="font-tabular">₹{res.balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400">Stay Dates</span>
              <p className="font-semibold text-slate-900 mt-1">
                {res.checkIn} → {res.checkOut} ({res.nights} Nights)
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400">Room Unit</span>
              <p className="font-semibold text-slate-900 mt-1">
                {res.unitNumber} - {res.unitTypeName}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400">Booking Channel / Source</span>
              <p className="font-semibold text-slate-900 mt-1">{res.source}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400">Guests</span>
              <p className="font-semibold text-slate-900 mt-1">{res.guestsCount} Pax</p>
            </div>
          </div>

          {/* Special Requests */}
          {res.specialRequests && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Special Requests / Staff Notes
              </h4>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                {res.specialRequests}
              </p>
            </div>
          )}
        </div>
      </Drawer>
    );
  }

  // 5. Quotation Drawer
  if (type === 'quotation') {
    const q = quotations.find((quote) => quote.id === id);
    if (!q) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={q.quotationNumber}
        subtitle={`Quotation for ${q.guestName} • ${q.propertyName}`}
        badge={<Badge status={q.status}>{q.status}</Badge>}
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              icon={<Send className="w-3.5 h-3.5 text-teal-600" />}
              onClick={() => showToast('Quotation Dispatched', `Sent ${q.quotationNumber} via WhatsApp & Email`)}
            >
              Send Quote
            </Button>
            {q.status !== 'Accepted' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  convertQuotationToBooking(q.id);
                  closeDrawer();
                }}
              >
                Convert to Booking
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
            {/* Branded Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base tracking-wider">ONE DIRECTORY</h3>
                <p className="text-[11px] text-teal-600 font-semibold">Hospitality Management</p>
                <p className="text-xs text-slate-500 mt-1">{q.propertyName}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-800">{q.quotationNumber}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Valid until: {q.validUntil}</p>
              </div>
            </div>

            {/* Guest & Stay Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Guest:</span>
                <p className="font-semibold text-slate-800">{q.guestName}</p>
                <p className="text-slate-500">{q.guestPhone}</p>
              </div>
              <div>
                <span className="text-slate-400">Room & Dates:</span>
                <p className="font-semibold text-slate-800">{q.roomTypeName}</p>
                <p className="text-slate-500">{q.checkIn} to {q.checkOut} ({q.nights} Nights, {q.guestsCount} Pax)</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 flex justify-between">
                <span>Description</span>
                <span>Amount (₹)</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Room Accommodation ({q.nights} Nights)</span>
                  <span className="font-tabular">₹{q.roomCharge.toLocaleString('en-IN')}</span>
                </div>
                {q.extraGuestCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Extra Guest Charges</span>
                    <span className="font-tabular">₹{q.extraGuestCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {q.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Promotional Discount</span>
                    <span className="font-tabular">-₹{q.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (GST 12%)</span>
                  <span className="font-tabular">₹{q.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Grand Total:</span>
                  <span className="text-teal-700 font-tabular">₹{q.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {q.notes && (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-md">
                Note: {q.notes}
              </p>
            )}
          </div>
        </div>
      </Drawer>
    );
  }

  // 6. Maintenance Drawer
  if (type === 'maintenance') {
    const t = maintenanceTickets.find((tick) => tick.id === id);
    if (!t) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={t.ticketNumber}
        subtitle={`${t.propertyName} • Unit ${t.unitNumber}`}
        badge={<Badge status={t.status}>{t.status}</Badge>}
        width="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            {t.status !== 'Resolved' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  resolveMaintenanceTicket(t.id);
                  closeDrawer();
                }}
              >
                Resolve & Release Unit
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-slate-400">Issue:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{t.issue}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div>
                <span className="text-slate-400">Priority:</span>
                <p className="font-semibold text-rose-700">{t.priority}</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned To:</span>
                <p className="font-semibold text-slate-800">{t.assignedTo}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {t.description}
            </p>
          </div>

          {t.resolutionNotes && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-800">Resolution:</span>
              <p className="text-emerald-700 mt-1">{t.resolutionNotes}</p>
            </div>
          )}
        </div>
      </Drawer>
    );
  }

  // 7. Housekeeping Drawer
  if (type === 'housekeeping') {
    const hk = housekeepingTasks.find((item) => item.id === id);
    if (!hk) return null;

    return (
      <Drawer
        isOpen={true}
        onClose={closeDrawer}
        title={`${hk.taskType} (${hk.unitNumber})`}
        subtitle={`${hk.propertyName} • Assigned to ${hk.assignedTo}`}
        badge={<Badge status={hk.status}>{hk.status}</Badge>}
        width="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            {hk.status === 'Pending' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  completeHousekeepingTask(hk.id);
                  closeDrawer();
                }}
              >
                Mark Completed
              </Button>
            )}
            {hk.status === 'Cleaning' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  completeHousekeepingTask(hk.id);
                  closeDrawer();
                }}
              >
                Complete Cleaning
              </Button>
            )}
            {hk.status === 'Inspection' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  inspectHousekeepingTask(hk.id);
                  closeDrawer();
                }}
              >
                Approve & Mark Unit Available
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">Scheduled:</span>
                <p className="font-semibold text-slate-800">{hk.scheduledTime}</p>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span>
                <p className="font-semibold text-amber-800">{hk.priority}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Staff Instructions</h4>
            <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
              {hk.notes || 'Perform standard room turnover sanitization and restocking.'}
            </p>
          </div>
        </div>
      </Drawer>
    );
  }

  return null;
}

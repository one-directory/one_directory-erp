'use client';

import React, { useRef } from 'react';
import { Reservation, Invoice, Property } from '@/types/erp';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Printer,
  Download,
  X,
  Building2,
  Calendar,
  User,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  QrCode,
} from 'lucide-react';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
  invoice?: Invoice | null;
  property?: Property | null;
}

export function PrintableInvoiceModal({
  isOpen,
  onClose,
  reservation,
  invoice,
  property,
}: PrintableInvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Resolve booking data from either reservation or invoice
  const bookingId = reservation?.bookingId || invoice?.bookingId || 'OD-RES-88219';
  const invoiceNumber = invoice?.invoiceNumber || `INV-${bookingId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const guestName = reservation?.guestName || invoice?.guestName || 'Valued Guest';
  const guestPhone = reservation?.guestPhone || '+91 98000 00000';
  const guestEmail = reservation?.guestEmail || 'guest@example.com';
  const propertyName = reservation?.propertyName || invoice?.propertyName || property?.name || 'One Directory Boutique Resort';
  const propertyLocation = property?.location || 'India';
  const unitNumber = reservation?.unitNumber || '101';
  const unitTypeName = reservation?.unitTypeName || 'Deluxe Room';
  const checkIn = reservation?.checkIn || invoice?.invoiceDate || '2026-09-23';
  const checkOut = reservation?.checkOut || '2026-09-25';
  const nights = reservation?.nights || 2;
  const guestsCount = reservation?.guestsCount || 2;
  const source = reservation?.source || 'Website';

  const rate = reservation?.rate || invoice?.subtotal || 10000;
  const discount = reservation?.discount || invoice?.discount || 0;
  const tax = reservation?.tax || invoice?.tax || Math.round((rate - discount) * 0.12);
  const total = reservation?.total || invoice?.total || rate - discount + tax;
  const paid = reservation?.paid ?? (invoice?.status === 'Paid' ? total : 0);
  const balance = reservation?.balance ?? (total - paid);
  const status = reservation?.status || invoice?.status || 'Confirmed';

  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;
  const baseTariff = total - tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-folio,
          #printable-invoice-folio * {
            visibility: visible;
          }
          #printable-invoice-folio {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[95vh]">
        {/* Top Floating Control Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-lg">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Guest Folio & Tax Invoice Preview</h3>
              <p className="text-xs text-slate-400">{invoiceNumber} • {guestName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
            >
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-slate-50 flex justify-center">
          <div
            id="printable-invoice-folio"
            ref={printRef}
            className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-xl shadow-xs border border-slate-200 text-slate-900 space-y-6 text-xs"
          >
            {/* Header with Branding & GSTIN */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center font-black text-sm">
                    OD
                  </div>
                  <span className="text-base font-black tracking-tight text-slate-900 uppercase">
                    ONE DIRECTORY
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-teal-700 tracking-wider uppercase">
                  Hospitality ERP & Stays
                </p>
                <div className="mt-3 text-slate-600 text-[11px] leading-relaxed">
                  <p className="font-bold text-slate-800">{propertyName}</p>
                  <p>{propertyLocation}</p>
                  <p>GSTIN: <span className="font-mono font-semibold text-slate-800">29AAFCO8812K1ZQ</span></p>
                  <p>SAC Code: <span className="font-mono">996311</span> (Hotel Accommodation)</p>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  TAX INVOICE / GUEST FOLIO
                </span>
                <p className="font-mono text-sm font-bold text-slate-900 mt-2">{invoiceNumber}</p>
                <p className="text-slate-500 text-[11px]">
                  Date: <span className="font-medium text-slate-700">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Booking Ref: <span className="font-mono font-bold text-teal-700">{bookingId}</span>
                </p>
                <div className="pt-1">
                  <Badge variant={source === 'Website' ? 'info' : 'purple'} size="xs">
                    Source: {source}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Guest & Reservation Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Billed To (Guest Details)</p>
                <p className="text-sm font-bold text-slate-900">{guestName}</p>
                <p className="text-slate-600 font-mono text-[11px]">{guestPhone}</p>
                <p className="text-slate-600 text-[11px]">{guestEmail}</p>
                <p className="text-slate-500 text-[10px] pt-1">Nationality: Indian • Purpose: Leisure</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Stay & Accommodation</p>
                <p className="font-bold text-slate-900">
                  Unit {unitNumber} • <span className="text-teal-700">{unitTypeName}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHECK-IN</span>
                    <span className="font-semibold text-slate-800">{checkIn} (12:00 PM)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHECK-OUT</span>
                    <span className="font-semibold text-slate-800">{checkOut} (11:00 AM)</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] pt-1">
                  Duration: {nights} {nights === 1 ? 'Night' : 'Nights'} • {guestsCount} Guests
                </p>
              </div>
            </div>

            {/* Itemized Charges Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Nights</th>
                    <th className="py-2.5 px-4 text-right">Tariff / Night</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{unitTypeName} (Unit {unitNumber})</p>
                      <p className="text-[11px] text-slate-500">Accommodation tariff for {nights} nights</p>
                    </td>
                    <td className="py-3 px-4 text-center">{nights}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{(baseTariff / nights).toFixed(0)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      ₹{baseTariff.toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {discount > 0 && (
                    <tr className="text-emerald-700 bg-emerald-50/30">
                      <td className="py-2 px-4 italic">Promotional / Member Discount</td>
                      <td className="py-2 px-4 text-center">-</td>
                      <td className="py-2 px-4 text-right">-</td>
                      <td className="py-2 px-4 text-right font-mono font-bold">
                        -₹{discount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-2 px-4 text-slate-600">Central GST (CGST @ 6%)</td>
                    <td className="py-2 px-4 text-center">6%</td>
                    <td className="py-2 px-4 text-right">-</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-700">
                      ₹{cgst.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">State GST (SGST @ 6%)</td>
                    <td className="py-2 px-4 text-center">6%</td>
                    <td className="py-2 px-4 text-right">-</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-700">
                      ₹{sgst.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Summary Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant={balance <= 0 ? 'success' : 'warning'} size="sm">
                    {balance <= 0 ? '✓ Paid in Full' : `₹${balance.toLocaleString('en-IN')} Balance Due`}
                  </Badge>
                  <span className="text-[11px] text-slate-500">
                    Status: <span className="font-semibold text-slate-800">{status}</span>
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-6 text-xs text-slate-600">
                    <span>Total Amount (Incl. GST):</span>
                    <span className="font-bold text-base text-slate-900 font-mono">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-6 text-[11px] text-slate-500">
                    <span>Amount Received:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      ₹{paid.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies, Signatures, and Verification */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div className="space-y-1 text-[10px] text-slate-500">
                <p className="font-bold text-slate-700 uppercase">Guest Note & Policies:</p>
                <p>1. Valid government photo ID is mandatory at the time of check-in.</p>
                <p>2. Standard check-out is 11:00 AM. Late check-out is subject to room availability.</p>
                <p>3. This is an electronically generated tax invoice authenticated by One Directory ERP.</p>
              </div>

              <div className="sm:text-right space-y-3">
                <div className="inline-block border-b border-slate-400 w-48 pb-1">
                  <p className="font-serif italic text-slate-700 text-xs">One Directory Authorized</p>
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Authorized Hotel Signatory & Stamp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

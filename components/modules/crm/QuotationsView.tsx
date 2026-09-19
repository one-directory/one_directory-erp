'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Plus, Eye, Send, CheckCircle2, Download } from 'lucide-react';

export function QuotationsView() {
  const { quotations, selectedPropertyId, openDrawer, openGlobalModal, convertQuotationToBooking, showToast } =
    useERP();

  const filteredQuotes = quotations.filter(
    (q) => selectedPropertyId === 'all' || q.propertyId === selectedPropertyId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Quotations</h1>
            <Badge variant="success" size="xs">
              {filteredQuotes.length} Total
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formal pricing proposals, room options, and booking agreements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openGlobalModal('new-quotation')}
        >
          + Generate Quotation
        </Button>
      </div>

      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No quotations generated"
          description="Create and dispatch quotation proposals with automatic tax calculations."
          actionLabel="+ Generate Quotation"
          onAction={() => openGlobalModal('new-quotation')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Quotation ID</th>
                <th className="py-3 px-4">Guest & Phone</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{q.quotationNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{q.guestName}</p>
                    <p className="text-[11px] text-slate-500">{q.guestPhone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800">{q.propertyName}</p>
                    <p className="text-[11px] text-slate-500">{q.roomTypeName}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {q.checkIn} → {q.checkOut} ({q.nights}N)
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular">
                    ₹{q.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{q.validUntil}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={q.status} size="xs">
                      {q.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => openDrawer('quotation', q.id)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<Send className="w-3 h-3 text-teal-600" />}
                      onClick={() => showToast('Quotation Dispatched', `Sent ${q.quotationNumber} to ${q.guestPhone}`)}
                    >
                      Send
                    </Button>
                    {q.status !== 'Accepted' && (
                      <Button
                        variant="success"
                        size="xs"
                        onClick={() => convertQuotationToBooking(q.id)}
                      >
                        Convert to Booking
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle,
  CreditCard,
  LogOut,
} from 'lucide-react';

export function ReservationsListView() {
  const {
    reservations,
    selectedPropertyId,
    openDrawer,
    openGlobalModal,
    checkInGuest,
    checkOutGuest,
  } = useERP();

  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservations = reservations.filter((r) => {
    if (selectedPropertyId !== 'all' && r.propertyId !== selectedPropertyId) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.bookingId.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.unitNumber.toLowerCase().includes(q) ||
        r.propertyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reservations Master</h1>
            <Badge variant="info" size="xs">
              {filteredReservations.length} Bookings
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete booking log across direct and OTA channels with real-time check-in controls
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openGlobalModal('new-reservation')}
        >
          + New Reservation
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search booking ID, guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="In House">In House</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Channels / Sources</option>
            <option value="Website">Direct Website</option>
            <option value="Phone">Phone</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Booking.com">Booking.com</option>
            <option value="MakeMyTrip">MakeMyTrip</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Agoda">Agoda</option>
          </select>
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      {filteredReservations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-6 h-6" />}
          title="No reservations match the filters"
          description="Try broadening your search or creating a new reservation."
          actionLabel="+ New Reservation"
          onAction={() => openGlobalModal('new-reservation')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Guest & Contact</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Booking ID */}
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {res.bookingId}
                    </td>

                    {/* Guest */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{res.guestName}</p>
                      <p className="text-[11px] text-slate-500">{res.guestPhone}</p>
                    </td>

                    {/* Property & Room */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{res.propertyName}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{res.unitNumber}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      <p>
                        {res.checkIn} → {res.checkOut}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {res.nights} Nights • {res.guestsCount} Pax
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[11px] text-slate-700">
                        {res.source}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-slate-900 font-tabular">
                      ₹{res.total.toLocaleString('en-IN')}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 font-tabular font-semibold">
                      {res.balance > 0 ? (
                        <span className="text-rose-600">₹{res.balance.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">Paid (₹0)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge status={res.status} size="xs">
                        {res.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => openDrawer('reservation', res.id)}
                      >
                        View
                      </Button>
                      {res.status === 'Confirmed' && (
                        <Button
                          variant="success"
                          size="xs"
                          onClick={() => checkInGuest(res.id)}
                        >
                          Check In
                        </Button>
                      )}
                      {(res.status === 'Checked In' || res.status === 'In House') && (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => checkOutGuest(res.id)}
                        >
                          Check Out
                        </Button>
                      )}
                      {res.balance > 0 && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openGlobalModal('record-payment', res)}
                        >
                          Collect
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

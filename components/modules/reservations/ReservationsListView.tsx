'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Calendar,
  Search,
  Plus,
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Masthead */}
      <div className="bg-white p-5 border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A32] tracking-tight">Reservations Master</h1>
            <Badge variant="info" size="xs">
              {filteredReservations.length} Bookings
            </Badge>
          </div>
          <p className="text-xs text-[#6B7A87] mt-1">
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
      <div className="bg-white p-4 border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-[#9AAAB6] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search booking ID, guest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F7] border border-[#D8D2C8] rounded-[2px] text-[#1E2A32] placeholder-[#9AAAB6] focus:outline-none focus:border-[#2E6E8E]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF9F7] border border-[#D8D2C8] rounded-[2px] px-2.5 py-1.5 text-xs font-medium text-[#3D4E5C] focus:outline-none focus:border-[#2E6E8E]"
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
            className="bg-[#FAF9F7] border border-[#D8D2C8] rounded-[2px] px-2.5 py-1.5 text-xs font-medium text-[#3D4E5C] focus:outline-none focus:border-[#2E6E8E]"
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
          icon={<Calendar className="w-6 h-6 text-[#9AAAB6]" />}
          title="No reservations match the filters"
          description="Try broadening your search or creating a new reservation."
          actionLabel="+ New Reservation"
          onAction={() => openGlobalModal('new-reservation')}
        />
      ) : (
        <div className="bg-white border border-[#E2DDD6] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF9F7] border-b border-[#E2DDD6] text-[#6B7A87] font-semibold uppercase text-[10px] tracking-wider">
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
              <tbody className="divide-y divide-[#F0EDE6]">
                {filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-[#F8F6F1] transition-colors">
                    {/* Booking ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#2E6E8E]">
                      {res.bookingId}
                    </td>

                    {/* Guest */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1E2A32]">{res.guestName}</p>
                      <p className="text-[11px] text-[#6B7A87] font-mono">{res.guestPhone}</p>
                    </td>

                    {/* Property & Room */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-[#3D4E5C]">{res.propertyName}</p>
                      <p className="text-[11px] text-[#6B7A87] font-semibold">{res.unitNumber}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 whitespace-nowrap text-[#3D4E5C]">
                      <p>
                        {res.checkIn} → {res.checkOut}
                      </p>
                      <span className="text-[10px] text-[#9AAAB6] font-medium">
                        {res.nights} Nights • {res.guestsCount} Pax
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-[2px] bg-[#F0EDE6] border border-[#D8D2C8] font-semibold text-[10px] uppercase text-[#3D4E5C]">
                        {res.source}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-[#1E2A32] font-tabular">
                      ₹{res.total.toLocaleString('en-IN')}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 font-tabular font-semibold">
                      {res.balance > 0 ? (
                        <span className="text-[#8B3A3A]">₹{res.balance.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#2A6B55]">Paid (₹0)</span>
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

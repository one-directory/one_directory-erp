'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  BedDouble,
  Sparkles,
  Wrench,
  Star,
  ChevronLeft,
  Calendar,
  CreditCard,
} from 'lucide-react';

interface PropertyDetailViewProps {
  propertyId: string;
  onBack: () => void;
}

export function PropertyDetailView({ propertyId, onBack }: PropertyDetailViewProps) {
  const {
    properties,
    units,
    unitTypes,
    reservations,
    housekeepingTasks,
    maintenanceTickets,
    reviews,
    updateUnitStatus,
    openDrawer,
  } = useERP();

  const [activeTab, setActiveTab] = useState('units');

  const property = properties.find((p) => p.id === propertyId) || properties[2]; // defaults to Ivory by Shore
  const propUnits = units.filter((u) => u.propertyId === property.id);
  const propUnitTypes = unitTypes.filter((ut) => ut.propertyId === property.id);
  const propReservations = reservations.filter((r) => r.propertyId === property.id);
  const propHousekeeping = housekeepingTasks.filter((hk) => hk.propertyId === property.id);
  const propMaintenance = maintenanceTickets.filter((mt) => mt.propertyId === property.id);
  const propReviews = reviews.filter((rev) => rev.propertyId === property.id);

  const availableUnitsCount = propUnits.filter((u) => u.status === 'Available').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation & Property Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Properties</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {property.name}
              </h1>
              <Badge variant="neutral" size="xs">
                {property.type}
              </Badge>
              <Badge variant="success" size="xs">
                {property.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{property.location}</span>
              <span>•</span>
              <span>Contact: {property.contact}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Owner</span>
            <span className="text-sm font-bold text-slate-800">{property.ownerName}</span>
          </div>
        </div>

        {/* 5 KPI Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Occupancy</p>
            <p className="text-lg font-bold text-teal-700 mt-0.5">{property.occupancyRate}%</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Today Arrivals</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{property.todayArrivals}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Today Departures</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{property.todayDepartures}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Available Units</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {availableUnitsCount} / {property.totalUnits}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">MTD Revenue</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
              ₹{property.revenueThisMonth.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* TABS (Overview, Units, Unit Types, Reservations, Housekeeping, Maintenance, Revenue, Reviews) */}
      <Tabs
        tabs={[
          { id: 'units', label: `Units (${propUnits.length})` },
          { id: 'unit-types', label: `Unit Types (${propUnitTypes.length})` },
          { id: 'reservations', label: `Bookings (${propReservations.length})` },
          { id: 'housekeeping', label: `Housekeeping (${propHousekeeping.length})` },
          { id: 'maintenance', label: `Maintenance (${propMaintenance.length})` },
          { id: 'reviews', label: `Reviews (${propReviews.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: UNITS STATUS GRID (Section 9 exact specification) */}
      {activeTab === 'units' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Unit Inventory & Live Status</h3>
            <p className="text-xs text-slate-500">
              Interactive room board with instant status modification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{unit.unitTypeName}</h4>
                    <span className="text-xs font-mono font-bold text-teal-800">{unit.number}</span>
                  </div>
                  <Badge status={unit.status} size="xs" dot>
                    {unit.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                  <p>Floor: {unit.floor}</p>
                  {unit.currentGuestName && (
                    <p className="font-semibold text-slate-800">
                      Guest: {unit.currentGuestName} (Out: {unit.currentCheckOut})
                    </p>
                  )}
                </div>

                {/* Status Changer */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Update:</span>
                  <select
                    value={unit.status}
                    onChange={(e) => updateUnitStatus(unit.id, e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Dirty">Dirty</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UNIT TYPES */}
      {activeTab === 'unit-types' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Room Categories & Base Tariffs</h3>
          <div className="space-y-3">
            {propUnitTypes.map((ut) => (
              <div
                key={ut.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ut.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capacity: {ut.capacity} Guests • {ut.bedConfiguration} • {ut.numberOfUnits} Units
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ut.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Rate</span>
                  <p className="text-base font-bold text-teal-800 font-tabular">
                    ₹{ut.baseRate.toLocaleString('en-IN')} / night
                  </p>
                  <Badge variant="success" size="xs" className="mt-1">
                    {ut.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESERVATIONS */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Bookings for {property.name}</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Booking ID</th>
                <th className="pb-2">Guest</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2">Dates</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propReservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-2.5 font-mono font-bold text-teal-800">{r.bookingId}</td>
                  <td className="py-2.5 font-semibold text-slate-900">{r.guestName}</td>
                  <td className="py-2.5 text-slate-700">{r.unitNumber}</td>
                  <td className="py-2.5 text-slate-600">{r.checkIn} → {r.checkOut}</td>
                  <td className="py-2.5 font-bold font-tabular">₹{r.total.toLocaleString('en-IN')}</td>
                  <td className="py-2.5">
                    <Badge status={r.status} size="xs">
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: HOUSEKEEPING */}
      {activeTab === 'housekeeping' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Housekeeping Task Board</h3>
          <div className="space-y-2">
            {propHousekeeping.map((hk) => (
              <div
                key={hk.id}
                onClick={() => openDrawer('housekeeping', hk.id)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">
                    {hk.unitNumber} - {hk.taskType}
                  </h4>
                  <p className="text-slate-500">Assigned: {hk.assignedTo} • {hk.scheduledTime}</p>
                </div>
                <Badge status={hk.status} size="xs">
                  {hk.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Maintenance Tickets</h3>
          <div className="space-y-2">
            {propMaintenance.map((mt) => (
              <div
                key={mt.id}
                onClick={() => openDrawer('maintenance', mt.id)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">
                    {mt.ticketNumber}: {mt.issue} ({mt.unitNumber})
                  </h4>
                  <p className="text-slate-500">{mt.description}</p>
                </div>
                <Badge status={mt.status} size="xs">
                  {mt.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Guest Reviews</h3>
          <div className="space-y-3">
            {propReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.guestName}</span>
                    <span className="text-amber-600 font-bold">★ {rev.rating}</span>
                  </div>
                  <Badge variant="neutral" size="xs">
                    {rev.platform}
                  </Badge>
                </div>
                <p className="text-slate-700 italic">"{rev.comment}"</p>
                {rev.responseText && (
                  <div className="p-2.5 bg-teal-50/70 rounded-lg border border-teal-100 text-[11px] text-teal-900">
                    <strong>Response:</strong> {rev.responseText}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

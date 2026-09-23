'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatYMD(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isoToDate(iso: string): Date {
  // parse YYYY-MM-DD safely without TZ shift
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function ReservationCalendarView() {
  const {
    units,
    reservations,
    selectedPropertyId,
    openDrawer,
    openGlobalModal,
  } = useERP();

  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedUnitType, setSelectedUnitType] = useState('all');
  // weekOffset = 0 means current week, -1 = last week, +1 = next week
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute the 11-day window centered on today + weekOffset * 7
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const days = useMemo(() => {
    const anchor = addDays(today, weekOffset * 7);
    const todayStr = formatYMD(today);
    return Array.from({ length: 11 }, (_, i) => {
      const d = addDays(anchor, i - 3); // -3 to +7 from anchor
      const fullDate = formatYMD(d);
      return {
        day: String(d.getDate()),
        weekday: WEEKDAYS[d.getDay()],
        fullDate,
        isToday: fullDate === todayStr,
      };
    });
  }, [today, weekOffset]);

  const monthLabel = useMemo(() => {
    const anchor = addDays(today, weekOffset * 7);
    return anchor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, [today, weekOffset]);

  // Filter units by selected property and unit type
  const filteredUnits = units.filter((u) => {
    if (selectedPropertyId !== 'all' && u.propertyId !== selectedPropertyId) return false;
    if (selectedUnitType !== 'all' && u.unitTypeName !== selectedUnitType) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reservation Calendar</h1>
            <Badge variant="success" size="xs">
              {monthLabel}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gantt chart room inventory grid with live occupancy bars and status coloring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day / Week / Month View */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {(['day', 'week', 'month'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  calendarView === view
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
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
      </div>

      {/* Legend & Month Navigator */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <span>{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2 py-0.5 text-[11px] rounded bg-teal-50 text-teal-700 font-semibold hover:bg-teal-100 cursor-pointer"
              >
                Today
              </button>
            )}
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 flex-wrap text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500" />
            <span>In-House / Checked In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400" />
            <span>Cleaning / Inspection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-300" />
            <span>Blocked</span>
          </div>
        </div>
      </div>

      {/* GANTT MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header Row: Dates */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="py-3 px-4 text-left font-bold text-xs uppercase tracking-wider w-64 border-r border-slate-200 sticky left-0 bg-slate-50 z-10">
                  Room Unit &amp; Type
                </th>
                {days.map((d) => (
                  <th
                    key={d.fullDate}
                    className={`py-2 px-1 text-center font-medium min-w-16 border-r border-slate-200 text-xs ${
                      d.isToday ? 'bg-teal-50/80 font-bold text-teal-900 ring-1 ring-teal-300' : ''
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      {d.weekday}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{d.day}</span>
                    {d.isToday && (
                      <span className="block text-[9px] text-teal-700 font-bold leading-none mt-0.5">
                        TODAY
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix Body: Rows = Units */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    No units found. Add properties and units to see the occupancy grid.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => {
                  // Find any reservation on this unit
                  const unitReservations = reservations.filter((r) => r.unitId === unit.id);

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/40 transition-colors h-14">
                      {/* Unit Info Column (Sticky Left) */}
                      <td className="py-2.5 px-4 font-medium border-r border-slate-200 sticky left-0 bg-white shadow-2xs z-10">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{unit.number}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {unit.unitTypeName}
                            </span>
                            <span className="text-[10px] text-teal-700 font-semibold">
                              {unit.propertyName}
                            </span>
                          </div>
                          <Badge status={unit.status} size="xs">
                            {unit.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Date Grid Cells */}
                      {days.map((d) => {
                        // Check if any reservation overlaps with this date
                        const activeRes = unitReservations.find(
                          (r) => r.checkIn <= d.fullDate && r.checkOut >= d.fullDate
                        );

                        const isCheckInDay = activeRes && activeRes.checkIn === d.fullDate;

                        // Unit maintenance or blocked check
                        const isMaintenance = unit.status === 'Maintenance';
                        const isBlocked = unit.status === 'Blocked';

                        return (
                          <td
                            key={d.fullDate}
                            className={`p-1 border-r border-slate-100 text-center relative ${
                              d.isToday ? 'bg-teal-50/20' : ''
                            }`}
                          >
                            {activeRes ? (
                              <div
                                onClick={() => openDrawer('reservation', activeRes.id)}
                                className={`h-9 rounded-lg p-1 text-left cursor-pointer transition-all shadow-2xs flex flex-col justify-center ${
                                  activeRes.status === 'In House' || activeRes.status === 'Checked In'
                                    ? 'bg-sky-500 hover:bg-sky-600 text-white'
                                    : activeRes.status === 'Confirmed'
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-slate-600 text-white'
                                }`}
                              >
                                <span className="text-[10px] font-bold truncate leading-tight block">
                                  {isCheckInDay ? `▶ ${activeRes.guestName}` : activeRes.guestName}
                                </span>
                                <span className="text-[9px] opacity-80 leading-none">
                                  {activeRes.nights}N • {activeRes.source}
                                </span>
                              </div>
                            ) : isMaintenance ? (
                              <div className="h-9 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-semibold flex items-center justify-center">
                                Maint.
                              </div>
                            ) : isBlocked ? (
                              <div className="h-9 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center">
                                Blocked
                              </div>
                            ) : (
                              <div
                                onClick={() => openGlobalModal('new-reservation')}
                                className="h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 hover:opacity-100 text-slate-400 cursor-pointer text-xs"
                              >
                                +
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

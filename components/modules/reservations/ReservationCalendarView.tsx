'use client';

import React, { useState, useMemo } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
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

  // Compute the date range label for the header
  const dateRangeLabel = useMemo(() => {
    if (days.length === 0) return '';
    const first = isoToDate(days[0].fullDate);
    const last = isoToDate(days[days.length - 1].fullDate);
    const firstLabel = first.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    const lastLabel = last.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    return `${firstLabel} – ${lastLabel}`;
  }, [days]);

  // Filter units by selected property and unit type
  const filteredUnits = units.filter((u) => {
    if (selectedPropertyId !== 'all' && u.propertyId !== selectedPropertyId) return false;
    if (selectedUnitType !== 'all' && u.unitTypeName !== selectedUnitType) return false;
    return true;
  });

  // Status color map — muted, professional, no vivid colors
  const getResBarClass = (status: string) => {
    switch (status) {
      case 'In House':
      case 'Checked In':
        return 'bg-[#2A6B55] hover:bg-[#235A47] text-white'; // deep green
      case 'Confirmed':
        return 'bg-[#2E6E8E] hover:bg-[#275E7A] text-white'; // slate-blue
      default:
        return 'bg-[#4A5A68] hover:bg-[#3D4D5A] text-white'; // dark neutral
    }
  };

  return (
    <div className="space-y-0 animate-fade-in">

      {/* ── PAGE HEADER — masthead style ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b-2 border-[#1E2A32]">
        <div>
          {/* Module path — small tracked label */}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AAAB6] mb-1">
            Reservations &nbsp;/&nbsp; Calendar Matrix
          </p>
          {/* Display title — strong, editorial */}
          <h1 className="text-[22px] font-bold text-[#1E2A32] tracking-tight leading-none">
            Reservation Calendar
          </h1>
          <p className="text-xs text-[#9AAAB6] mt-1.5 font-medium">
            {monthLabel} &mdash; Room inventory Gantt with live occupancy
          </p>
        </div>

        {/* Controls right-aligned */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle — segmented control */}
          <div className="flex items-center border border-[#CEC9C1] overflow-hidden">
            {(['day', 'week', 'month'] as const).map((view, idx) => (
              <button
                key={view}
                onClick={() => setCalendarView(view)}
                className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide capitalize transition-colors ${idx > 0 ? 'border-l border-[#CEC9C1]' : ''
                  } ${calendarView === view
                    ? 'bg-[#1C2B35] text-white'
                    : 'bg-white text-[#6B7A87] hover:bg-[#F0EDE6] hover:text-[#1E2A32]'
                  }`}
              >
                {view}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openGlobalModal('new-reservation')}
          >
            <Plus className="w-3.5 h-3.5" />
            New Reservation
          </Button>
        </div>
      </div>

      {/* ── CALENDAR CONTROLS BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
        {/* Date navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1.5 text-[#6B7A87] hover:text-[#1E2A32] hover:bg-[#E8E3DA] transition-colors cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2 py-0.5 text-[11px] bg-[#EBF3F8] text-[#2E6E8E] font-semibold hover:bg-[#D9EAF3] cursor-pointer"
              >
                Today
              </button>
            )}
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1.5 text-[#6B7A87] hover:text-[#1E2A32] hover:bg-[#E8E3DA] transition-colors cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-[#1E2A32] tracking-tight">
            {monthLabel}
          </span>
          <span className="text-xs text-[#9AAAB6] font-medium">
            {dateRangeLabel}
          </span>
        </div>

        {/* Status Legend — flat, horizontal */}
        <div className="flex items-center gap-5 text-[11px] text-[#6B7A87] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 inline-block bg-[#2E6E8E] shrink-0" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 inline-block bg-[#2A6B55] shrink-0" />
            <span>In-House</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 inline-block bg-[#7A6030] shrink-0" />
            <span>Cleaning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 inline-block bg-[#8B3A3A] shrink-0" />
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 inline-block bg-[#6A7580] shrink-0" />
            <span>Blocked</span>
          </div>
        </div>
      </div>

      {/* ── GANTT MATRIX TABLE — ledger aesthetic ── */}
      <div className="bg-white border border-[#E2DDD6] shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">

            {/* Date header row */}
            <thead>
              <tr className="border-b-2 border-[#1E2A32]">
                {/* Unit label column header */}
                <th className="py-2.5 px-4 text-left w-64 border-r border-[#E2DDD6] sticky left-0 bg-white z-10">
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9AAAB6]">
                    Unit &amp; Type
                  </span>
                </th>
                {days.map((d) => (
                  <th
                    key={d.fullDate}
                    className={`py-2.5 px-1 text-center min-w-[68px] border-r border-[#E2DDD6] ${d.isToday ? 'bg-[#EBF3F8]' : 'bg-white'
                      }`}
                  >
                    <span className={`text-[9px] block uppercase tracking-wider font-semibold ${d.isToday ? 'text-[#2E6E8E]' : 'text-[#9AAAB6]'
                      }`}>
                      {d.weekday}
                    </span>
                    <span className={`text-sm font-bold block leading-tight ${d.isToday ? 'text-[#2E6E8E]' : 'text-[#1E2A32]'
                      }`}>
                      {d.day}
                    </span>
                    {d.isToday && (
                      <span className="block text-[8px] text-[#2E6E8E] font-bold uppercase tracking-widest leading-none mt-0.5">
                        today
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Matrix body */}
            <tbody>
              {filteredUnits.length === 0 ? (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="py-12 text-center text-[#9AAAB6] text-sm"
                  >
                    No units found. Add properties and units to see the occupancy grid.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit, rowIdx) => {
                  const unitReservations = reservations.filter((r) => r.unitId === unit.id);

                  return (
                    <tr
                      key={unit.id}
                      className={`border-b border-[#F0EDE6] h-[52px] transition-colors hover:bg-[#F8F6F1] ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCFA]'
                        }`}
                    >
                      {/* Unit label — sticky left */}
                      <td className={`py-2.5 px-4 border-r border-[#E2DDD6] sticky left-0 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCFA]'
                        }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="block font-bold text-[13px] text-[#1E2A32] leading-tight truncate">
                              {unit.number}
                            </span>
                            <span className="block text-[11px] text-[#9AAAB6] font-medium truncate">
                              {unit.unitTypeName}
                            </span>
                          </div>
                          <Badge status={unit.status} size="xs">
                            {unit.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Date cells */}
                      {days.map((d) => {
                        const activeRes = unitReservations.find(
                          (r) => r.checkIn <= d.fullDate && r.checkOut >= d.fullDate
                        );
                        const isCheckInDay = activeRes && activeRes.checkIn === d.fullDate;
                        const isMaintenance = unit.status === 'Maintenance';
                        const isBlocked = unit.status === 'Blocked';

                        return (
                          <td
                            key={d.fullDate}
                            className={`p-1 border-r border-[#F0EDE6] text-center relative align-middle ${d.isToday ? 'bg-[#EBF3F8]/30' : ''
                              }`}
                          >
                            {activeRes ? (
                              // Reservation bar — flat rectangle, full semantics
                              <div
                                onClick={() => openDrawer('reservation', activeRes.id)}
                                className={`h-9 px-2 text-left cursor-pointer transition-colors flex flex-col justify-center ${getResBarClass(activeRes.status)}`}
                                title={`${activeRes.guestName} · ${activeRes.status}`}
                              >
                                <span className="text-[10px] font-bold truncate leading-tight block">
                                  {isCheckInDay ? '› ' : ''}{activeRes.guestName}
                                </span>
                                <span className="text-[9px] opacity-70 leading-none">
                                  {activeRes.nights}N · {activeRes.source}
                                </span>
                              </div>
                            ) : isMaintenance ? (
                              // Maintenance — flat muted red fill
                              <div className="h-9 bg-[#F5EAEA] border-l-2 border-[#8B3A3A] flex items-center justify-center">
                                <span className="text-[9px] font-bold uppercase tracking-wide text-[#8B3A3A]">
                                  Maint.
                                </span>
                              </div>
                            ) : isBlocked ? (
                              // Blocked — hatch pattern feel with flat muted bg
                              <div className="h-9 bg-[#F0EDE6] flex items-center justify-center">
                                <span className="text-[9px] font-bold uppercase tracking-wide text-[#9AAAB6]">
                                  Blocked
                                </span>
                              </div>
                            ) : (
                              // Empty — hover to add
                              <div
                                onClick={() => openGlobalModal('new-reservation')}
                                className="h-9 flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-[#EBF3F8] cursor-pointer transition-all"
                              >
                                <Plus className="w-3 h-3 text-[#2E6E8E]" />
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

        {/* Footer row with summary counts */}
        {filteredUnits.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9AAAB6] border-t border-[#E2DDD6]">
            <p className="font-medium">No units match the current filter.</p>
            <p className="text-xs mt-1">Adjust the property or unit type selection above.</p>
          </div>
        )}
      </div>

      {/* Unit count footer */}
      <div className="pt-3 flex items-center justify-between">
        <p className="text-[11px] text-[#9AAAB6] font-medium">
          Showing {filteredUnits.length} unit{filteredUnits.length !== 1 ? 's' : ''}
        </p>
        <p className="text-[11px] text-[#9AAAB6]">
          Click any reservation bar to view details &nbsp;·&nbsp; Click empty cell to create
        </p>
      </div>
    </div>
  );
}

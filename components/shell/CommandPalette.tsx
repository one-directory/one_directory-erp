'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Calendar,
  PhoneCall,
  Building2,
  FileText,
  Plus,
  ArrowRight,
  X,
  CreditCard,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useERP } from '@/context/ERPContext';
import { NavigationModule } from './Sidebar';
import { Badge } from '@/components/ui/Badge';

interface CommandPaletteProps {
  onNavigate: (module: NavigationModule) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    guests,
    leads,
    reservations,
    properties,
    units,
    quotations,
    openDrawer,
    openGlobalModal,
  } = useERP();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  // Filter cross-entity results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedGuests = guests.filter(
      (g) => g.name.toLowerCase().includes(q) || g.phone.includes(q) || g.email.toLowerCase().includes(q)
    );

    const matchedLeads = leads.filter(
      (l) =>
        l.leadNumber.toLowerCase().includes(q) ||
        l.guestName.toLowerCase().includes(q) ||
        l.propertyName.toLowerCase().includes(q)
    );

    const matchedReservations = reservations.filter(
      (r) =>
        r.bookingId.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.unitNumber.toLowerCase().includes(q) ||
        r.propertyName.toLowerCase().includes(q)
    );

    const matchedProperties = properties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
    );

    const matchedUnits = units.filter(
      (u) =>
        u.number.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.propertyName.toLowerCase().includes(q)
    );

    const matchedQuotations = quotations.filter(
      (qt) =>
        qt.quotationNumber.toLowerCase().includes(q) ||
        qt.guestName.toLowerCase().includes(q) ||
        qt.propertyName.toLowerCase().includes(q)
    );

    return {
      guests: matchedGuests,
      leads: matchedLeads,
      reservations: matchedReservations,
      properties: matchedProperties,
      units: matchedUnits,
      quotations: matchedQuotations,
    };
  }, [query, guests, leads, reservations, properties, units, quotations]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectDrawer = (type: any, id: string) => {
    setIsCommandPaletteOpen(false);
    openDrawer(type, id);
  };

  const handleCommandAction = (action: () => void) => {
    setIsCommandPaletteOpen(false);
    action();
  };

  const hasAnyResults =
    results &&
    (results.guests.length > 0 ||
      results.leads.length > 0 ||
      results.reservations.length > 0 ||
      results.properties.length > 0 ||
      results.units.length > 0 ||
      results.quotations.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a name, booking ID, room number, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Suggestions */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {!query ? (
            /* Default Shortcuts & Quick Actions */
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <button
                    onClick={() => handleCommandAction(() => openGlobalModal('new-reservation'))}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-teal-600" />
                    <span>+ New Reservation</span>
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => openGlobalModal('new-lead'))}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span>+ New Lead</span>
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => openGlobalModal('new-followup'))}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors text-left"
                  >
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>+ New Follow-up</span>
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => openGlobalModal('record-payment'))}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-teal-50 hover:text-teal-800 text-slate-700 transition-colors text-left"
                  >
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Jump to Section
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <button
                    onClick={() => handleCommandAction(() => onNavigate('follow-ups'))}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-slate-500" />
                      <span>Follow-up Center</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => onNavigate('calendar'))}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Reservation Calendar</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => onNavigate('properties'))}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>Properties & Units</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleCommandAction(() => onNavigate('housekeeping'))}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-slate-500" />
                      <span>Housekeeping Tasks</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="p-8 text-center text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Guests */}
              {results.guests.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Guests ({results.guests.length})
                  </p>
                  {results.guests.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSelectDrawer('guest', g.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/70 text-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-semibold">{g.name}</p>
                          <p className="text-[11px] text-slate-500">{g.phone} • {g.email}</p>
                        </div>
                      </div>
                      <Badge status={g.status} size="xs">
                        {g.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Reservations */}
              {results.reservations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Bookings ({results.reservations.length})
                  </p>
                  {results.reservations.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectDrawer('reservation', r.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/70 text-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            {r.bookingId} - {r.guestName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {r.propertyName} • {r.unitNumber} ({r.checkIn} to {r.checkOut})
                          </p>
                        </div>
                      </div>
                      <Badge status={r.status} size="xs">
                        {r.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Leads */}
              {results.leads.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Leads ({results.leads.length})
                  </p>
                  {results.leads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleSelectDrawer('lead', l.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/70 text-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            {l.leadNumber} - {l.guestName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {l.propertyName} • Est. ₹{l.estimatedValue.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Badge status={l.status} size="xs">
                        {l.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Quotations */}
              {results.quotations.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Quotations ({results.quotations.length})
                  </p>
                  {results.quotations.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSelectDrawer('quotation', q.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/70 text-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-semibold">
                            {q.quotationNumber} - {q.guestName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {q.propertyName} • Total ₹{q.total.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Badge status={q.status} size="xs">
                        {q.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* Properties & Units */}
              {results.properties.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                    Properties ({results.properties.length})
                  </p>
                  {results.properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        handleCommandAction(() => {
                          onNavigate('properties');
                        })
                      }
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/70 text-slate-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {p.location} • {p.type} • {p.totalUnits} Units
                          </p>
                        </div>
                      </div>
                      <Badge variant="neutral" size="xs">
                        {p.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search guests, bookings, rooms, or run commands</span>
          <span>Navigation enabled</span>
        </div>
      </div>
    </div>
  );
}

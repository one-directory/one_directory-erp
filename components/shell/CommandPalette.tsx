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
import { useAuth } from '@/context/AuthContext';
import { hasModuleAccess, canPerformAction } from '@/lib/rbac';
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

  const { user } = useAuth();
  const role = user?.role;

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  // Filter cross-entity results with RBAC protection
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const matchedReservations = hasModuleAccess(role, 'reservations')
      ? reservations.filter(
        (r) =>
          r.bookingId.toLowerCase().includes(q) ||
          r.guestName.toLowerCase().includes(q) ||
          r.unitNumber.toLowerCase().includes(q) ||
          r.propertyName.toLowerCase().includes(q)
      )
      : [];

    const matchedProperties = hasModuleAccess(role, 'properties')
      ? properties.filter(
        (p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
      )
      : [];

    const matchedUnits = hasModuleAccess(role, 'units')
      ? units.filter(
        (u) =>
          u.number.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.propertyName.toLowerCase().includes(q)
      )
      : [];

    const matchedQuotations = hasModuleAccess(role, 'quotations')
      ? quotations.filter(
        (qt) =>
          qt.quotationNumber.toLowerCase().includes(q) ||
          qt.guestName.toLowerCase().includes(q) ||
          qt.propertyName.toLowerCase().includes(q)
      )
      : [];

    return {
      reservations: matchedReservations,
      properties: matchedProperties,
      units: matchedUnits,
      quotations: matchedQuotations,
    };
  }, [query, reservations, properties, units, quotations, role]);

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
    (results.reservations.length > 0 ||
      results.properties.length > 0 ||
      results.units.length > 0 ||
      results.quotations.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E2A32]/45 transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Dialog — squared, professional */}
      <div className="relative w-full max-w-2xl bg-white border border-[#E2DDD6] shadow-[0_16px_48px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col z-10 animate-fade-in-up">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b-2 border-[#1E2A32] bg-[#F8F6F1]">
          <Search className="w-4 h-4 text-[#2E6E8E] shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a name, booking ID, room number, or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-[#1E2A32] placeholder-[#9AAAB6] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#9AAAB6] hover:text-[#3D4E5C] mr-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9AAAB6] bg-white border border-[#D8D2C8]">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Suggestions */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {!query ? (
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em] px-2 mb-2">
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                  {canPerformAction(role, 'create_reservations') && (
                    <button
                      onClick={() => handleCommandAction(() => openGlobalModal('new-reservation'))}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#EBF3F8] hover:text-[#1E2A32] text-[#3D4E5C] transition-colors text-left"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                      <span>New Reservation</span>
                    </button>
                  )}
                  {canPerformAction(role, 'manage_crm') && (
                    <button
                      onClick={() => handleCommandAction(() => openGlobalModal('new-followup'))}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#EBF3F8] hover:text-[#1E2A32] text-[#3D4E5C] transition-colors text-left"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                      <span>New Follow-up</span>
                    </button>
                  )}
                  {canPerformAction(role, 'record_payments') && (
                    <button
                      onClick={() => handleCommandAction(() => openGlobalModal('record-payment'))}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#EBF3F8] hover:text-[#1E2A32] text-[#3D4E5C] transition-colors text-left"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-[#F0EDE6] pt-3">
                <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em] px-2 mb-2">
                  Jump to Section
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                  {hasModuleAccess(role, 'follow-ups') && (
                    <button
                      onClick={() => handleCommandAction(() => onNavigate('follow-ups'))}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#F0EDE6] text-[#3D4E5C] hover:text-[#1E2A32] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-[#9AAAB6]" />
                        <span>Follow-up Center</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#9AAAB6]" />
                    </button>
                  )}
                  {hasModuleAccess(role, 'calendar') && (
                    <button
                      onClick={() => handleCommandAction(() => onNavigate('calendar'))}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#F0EDE6] text-[#3D4E5C] hover:text-[#1E2A32] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#9AAAB6]" />
                        <span>Reservation Calendar</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#9AAAB6]" />
                    </button>
                  )}
                  {hasModuleAccess(role, 'properties') && (
                    <button
                      onClick={() => handleCommandAction(() => onNavigate('properties'))}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#F0EDE6] text-[#3D4E5C] hover:text-[#1E2A32] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#9AAAB6]" />
                        <span>Properties &amp; Units</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#9AAAB6]" />
                    </button>
                  )}
                  {hasModuleAccess(role, 'housekeeping') && (
                    <button
                      onClick={() => handleCommandAction(() => onNavigate('housekeeping'))}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#F0EDE6] text-[#3D4E5C] hover:text-[#1E2A32] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#9AAAB6]" />
                        <span>Housekeeping Tasks</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#9AAAB6]" />
                    </button>
                  )}
                  {hasModuleAccess(role, 'finance') && (
                    <button
                      onClick={() => handleCommandAction(() => onNavigate('finance'))}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#F0EDE6] text-[#3D4E5C] hover:text-[#1E2A32] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-[#9AAAB6]" />
                        <span>Financial Overview</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#9AAAB6]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : !hasAnyResults ? (
            <div className="p-8 text-center text-[#9AAAB6] text-xs">
              No matching records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Reservations */}
              {results.reservations.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em] px-2 mb-1">
                    Bookings ({results.reservations.length})
                  </p>
                  {results.reservations.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectDrawer('reservation', r.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#EBF3F8] text-[#1E2A32] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                        <div>
                          <p className="font-semibold text-xs">
                            {r.bookingId} &ndash; {r.guestName}
                          </p>
                          <p className="text-[10px] text-[#9AAAB6]">
                            {r.propertyName} &middot; {r.unitNumber} ({r.checkIn} to {r.checkOut})
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

              {/* Quotations */}
              {results.quotations.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em] px-2 mb-1">
                    Quotations ({results.quotations.length})
                  </p>
                  {results.quotations.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSelectDrawer('quotation', q.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#EBF3F8] text-[#1E2A32] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                        <div>
                          <p className="font-semibold text-xs">
                            {q.quotationNumber} &ndash; {q.guestName}
                          </p>
                          <p className="text-[10px] text-[#9AAAB6]">
                            {q.propertyName} &middot; Total ₹{q.total.toLocaleString('en-IN')}
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
                  <p className="text-[9px] font-bold text-[#9AAAB6] uppercase tracking-[0.12em] px-2 mb-1">
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
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#EBF3F8] text-[#1E2A32] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                        <div>
                          <p className="font-semibold text-xs">{p.name}</p>
                          <p className="text-[10px] text-[#9AAAB6]">
                            {p.location} &middot; {p.type} &middot; {p.totalUnits} Units
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
        <div className="px-4 py-2.5 border-t border-[#E2DDD6] bg-[#F8F6F1] flex items-center justify-between text-[10px] text-[#9AAAB6] font-medium">
          <span className="uppercase tracking-wide">Search bookings, guests, rooms</span>
          <span>⌘K to open</span>
        </div>
      </div>
    </div>
  );
}

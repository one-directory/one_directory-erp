'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Property,
  UnitType,
  Unit,
  Guest,
  Lead,
  LeadStatus,
  FollowUp,
  CallLog,
  Quotation,
  Reservation,
  Payment,
  Invoice,
  HousekeepingTask,
  MaintenanceTicket,
  StaffTask,
  Expense,
  OwnerSettlement,
  Review,
  AuditLog,
  Notification,
  UnitStatus,
  OTAChannel,
  ChannelConnection,
  ChannelSyncEvent,
  ChannelRateRule,
} from '@/types/erp';
import {
  INITIAL_CHANNEL_CONNECTIONS,
  INITIAL_CHANNEL_SYNC_EVENTS,
  INITIAL_CHANNEL_RATE_RULES,
} from '@/data/mockData';

export type DrawerType =
  | 'guest'
  | 'lead'
  | 'followup'
  | 'reservation'
  | 'quotation'
  | 'payment'
  | 'housekeeping'
  | 'maintenance'
  | 'invoice';

export type GlobalModalType =
  | 'new-reservation'
  | 'new-guest'
  | 'new-lead'
  | 'new-followup'
  | 'new-quotation'
  | 'record-payment'
  | 'add-expense'
  | 'maintenance-ticket'
  | 'housekeeping-task'
  | 'complete-followup'
  | 'simulate-ota-booking';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ERPContextType {
  // State
  properties: Property[];
  selectedPropertyId: string;
  unitTypes: UnitType[];
  units: Unit[];
  guests: Guest[];
  leads: Lead[];
  followUps: FollowUp[];
  callLogs: CallLog[];
  quotations: Quotation[];
  reservations: Reservation[];
  payments: Payment[];
  invoices: Invoice[];
  housekeepingTasks: HousekeepingTask[];
  maintenanceTickets: MaintenanceTicket[];
  staffTasks: StaffTask[];
  expenses: Expense[];
  ownerSettlements: OwnerSettlement[];
  reviews: Review[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  toasts: ToastMessage[];

  // Channel Manager & OTA Simulator
  channelConnections: ChannelConnection[];
  channelSyncEvents: ChannelSyncEvent[];
  channelRateRules: ChannelRateRule[];
  isSyncingChannels: boolean;
  triggerGlobalChannelSync: () => Promise<void>;
  simulateIncomingOtaBooking: (params: {
    channel: OTAChannel;
    propertyId?: string;
    propertyName?: string;
    unitTypeId?: string;
    unitTypeName?: string;
    unitNumber?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    guestsCount?: number;
    baseRate?: number;
  }) => Promise<Reservation>;
  simulateOtaCancellation: (reservationId: string) => void;
  updateChannelSettings: (channelId: string, updates: Partial<ChannelConnection>) => void;
  updateChannelRateMarkup: (channel: OTAChannel, markupPercentage: number) => void;

  // Shell controls
  selectedProperty: Property | null;
  setSelectedPropertyId: (id: string) => void;
  activeDrawer: { type: DrawerType; id: string } | null;
  openDrawer: (type: DrawerType, id: string) => void;
  closeDrawer: () => void;
  activeModal: { type: GlobalModalType; data?: any } | null;
  openGlobalModal: (type: GlobalModalType, data?: any) => void;
  closeGlobalModal: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Domain Actions
  completeFollowUp: (
    followUpId: string,
    outcome: string,
    duration: string,
    notes: string,
    nextAction: string,
    nextDate?: string,
    nextTime?: string
  ) => void;
  rescheduleFollowUp: (followUpId: string, newDate: string, newTime: string) => void;
  addFollowUp: (data: Partial<FollowUp>) => void;
  addLead: (data: Partial<Lead>) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addQuotation: (data: Partial<Quotation>) => void;
  convertQuotationToBooking: (quotationId: string) => void;
  addReservation: (data: Partial<Reservation>) => void;
  checkInGuest: (reservationId: string) => void;
  checkOutGuest: (reservationId: string) => void;
  cancelReservation: (reservationId: string) => void;
  recordPayment: (data: Partial<Payment>) => void;
  updateUnitStatus: (unitId: string, status: UnitStatus) => void;
  startHousekeepingTask: (taskId: string) => void;
  completeHousekeepingTask: (taskId: string) => void;
  inspectHousekeepingTask: (taskId: string) => void;
  addHousekeepingTask: (data: Partial<HousekeepingTask>) => void;
  addMaintenanceTicket: (data: Partial<MaintenanceTicket>) => void;
  resolveMaintenanceTicket: (ticketId: string, notes?: string) => void;
  addExpense: (data: Partial<Expense>) => void;
  addGuest: (data: Partial<Guest>) => void;
  replyToReview: (reviewId: string, replyText: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addProperty: (data: Partial<Property>) => void;
  removeProperty: (propertyId: string) => void;
  addUnit: (data: Partial<Unit> & { propertyId: string; propertyName: string }) => void;
  removeUnit: (unitId: string) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  // Primary state — starts empty; hydrated from DB on mount
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ownerSettlements, setOwnerSettlements] = useState<OwnerSettlement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Channel Manager & OTA Simulator state (UI-only simulation — not persisted to DB)
  const [channelConnections, setChannelConnections] = useState<ChannelConnection[]>(INITIAL_CHANNEL_CONNECTIONS);
  const [channelSyncEvents, setChannelSyncEvents] = useState<ChannelSyncEvent[]>(INITIAL_CHANNEL_SYNC_EVENTS);
  const [channelRateRules, setChannelRateRules] = useState<ChannelRateRule[]>(INITIAL_CHANNEL_RATE_RULES);
  const [isSyncingChannels, setIsSyncingChannels] = useState(false);

  // Shell controls state
  const [activeDrawer, setActiveDrawer] = useState<{ type: DrawerType; id: string } | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: GlobalModalType; data?: any } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hydrate all primary state from PostgreSQL on mount
  useEffect(() => {
    let isMounted = true;

    const normalizeReservationStatus = (s: string) =>
      s === 'Checked_In' ? 'Checked In'
      : s === 'In_House' ? 'In House'
      : s === 'Checked_Out' ? 'Checked Out'
      : s === 'No_Show' ? 'No Show'
      : s;

    (async () => {
      try {
        // ── 1. Properties + Units ───────────────────────────────────────────
        const resProp = await fetch('/api/properties?includeUnits=true');
        if (resProp.ok) {
          const json = await resProp.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            const dbProps: Property[] = json.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              location: p.location,
              contact: p.contact,
              totalUnits: p.totalUnits,
              occupancyRate: p.occupancyRate || 0,
              todayArrivals: p.todayArrivals || 0,
              todayDepartures: p.todayDepartures || 0,
              revenueThisMonth: p.revenueThisMonth || 0,
              status: p.status,
              ownerName: p.ownerName,
              ownerEmail: p.ownerEmail,
              ownerPhone: p.ownerPhone,
              description: p.description || '',
              amenities: p.amenities || [],
            }));
            setProperties(dbProps);

            const dbUnits: Unit[] = [];
            json.data.forEach((p: any) => {
              if (Array.isArray(p.units)) {
                p.units.forEach((u: any) => {
                  dbUnits.push({
                    id: u.id,
                    propertyId: u.propertyId,
                    propertyName: u.propertyName || p.name,
                    unitTypeId: u.unitTypeId || '',
                    unitTypeName: u.unitTypeName || 'Standard Room',
                    number: u.number,
                    name: u.name,
                    floor: u.floor || 'Ground Floor',
                    status: u.status,
                    currentReservationId: u.currentReservationId ?? undefined,
                    currentGuestName: u.currentGuestName ?? undefined,
                    currentCheckOut: u.currentCheckOut ?? undefined,
                  });
                });
              }
            });
            if (dbUnits.length > 0) setUnits(dbUnits);
          }
        }

        // ── 2. Reservations ────────────────────────────────────────────────
        const resBookings = await fetch('/api/reservations');
        if (resBookings.ok) {
          const bkgJson = await resBookings.json();
          if (bkgJson.success && Array.isArray(bkgJson.data) && isMounted) {
            const dbReservations: Reservation[] = bkgJson.data.map((r: any) => ({
              id: r.id,
              bookingId: r.bookingId,
              guestId: r.guestId,
              guestName: r.guestName,
              guestPhone: r.guestPhone,
              guestEmail: r.guestEmail,
              propertyId: r.propertyId,
              propertyName: r.propertyName,
              unitId: r.unitId,
              unitNumber: r.unitNumber,
              unitTypeName: r.unitTypeName,
              checkIn: r.checkIn,
              checkOut: r.checkOut,
              nights: r.nights,
              guestsCount: r.guestsCount,
              source: r.source,
              rate: r.rate,
              discount: r.discount,
              tax: r.tax,
              total: r.total,
              paid: r.paid,
              balance: r.balance,
              status: normalizeReservationStatus(r.status),
              specialRequests: r.specialRequests || '',
              createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              quotationId: r.quotationId ?? undefined,
              leadId: r.leadId ?? undefined,
            }));
            if (isMounted) setReservations(dbReservations);
          }
        }

        // ── 3. Guests ──────────────────────────────────────────────────────
        const resGuests = await fetch('/api/guests');
        if (resGuests.ok) {
          const gJson = await resGuests.json();
          if (gJson.success && Array.isArray(gJson.data) && isMounted) {
            const dbGuests: Guest[] = gJson.data.map((g: any) => ({
              id: g.id,
              name: g.name,
              phone: g.phone,
              email: g.email,
              idProofNumber: g.idProofNumber ?? undefined,
              vip: g.vip ?? false,
              totalStays: g.totalStays ?? 0,
              lastStayDate: g.lastStayDate ?? undefined,
              totalSpend: g.totalSpend ?? 0,
              preferences: g.preferences ?? [],
              status:
                g.status === 'First_time' ? 'First-time'
                : g.status === 'Blacklisted' ? 'Blacklisted'
                : g.status === 'VIP' ? 'VIP'
                : 'Regular',
              createdAt: g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            }));
            setGuests(dbGuests);
          }
        }

        // ── 4. Payments ────────────────────────────────────────────────────
        const resPayments = await fetch('/api/payments');
        if (resPayments.ok) {
          const pJson = await resPayments.json();
          if (pJson.success && Array.isArray(pJson.data) && isMounted) {
            const dbPayments: Payment[] = pJson.data.map((p: any) => ({
              id: p.id,
              paymentId: p.paymentId,
              reservationId: p.reservationId,
              bookingId: p.bookingId,
              guestName: p.guestName,
              propertyId: p.propertyId,
              propertyName: p.propertyName,
              amount: p.amount,
              method: p.method === 'Credit_Card' ? 'Credit Card'
                : p.method === 'Debit_Card' ? 'Debit Card'
                : p.method === 'Bank_Transfer' ? 'Bank Transfer'
                : p.method === 'Payment_Gateway' ? 'Payment Gateway'
                : p.method,
              date: p.date,
              time: p.time,
              status: p.status,
              referenceNumber: p.referenceNumber ?? undefined,
              collectedBy: p.collectedBy ?? undefined,
              notes: p.notes ?? undefined,
            }));
            setPayments(dbPayments);
          }
        }

        // ── 5. Housekeeping Tasks ──────────────────────────────────────────
        const resHk = await fetch('/api/housekeeping');
        if (resHk.ok) {
          const hkJson = await resHk.json();
          if (hkJson.success && Array.isArray(hkJson.data) && isMounted) {
            const dbHk: HousekeepingTask[] = hkJson.data.map((t: any) => ({
              id: t.id,
              propertyId: t.propertyId,
              propertyName: t.propertyName,
              unitId: t.unitId,
              unitNumber: t.unitNumber,
              taskType: t.taskType === 'Checkout_Cleaning' ? 'Checkout Cleaning'
                : t.taskType === 'Regular_Cleaning' ? 'Regular Cleaning'
                : t.taskType === 'Deep_Cleaning' ? 'Deep Cleaning'
                : t.taskType === 'Linen_Change' ? 'Linen Change'
                : t.taskType === 'Pest_Control' ? 'Pest Control'
                : t.taskType,
              assignedTo: t.assignedTo,
              scheduledTime: t.scheduledTime,
              status: t.status,
              priority: t.priority,
              notes: t.notes ?? '',
              updatedAt: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : undefined,
            }));
            setHousekeepingTasks(dbHk);
          }
        }

        // ── 6. Maintenance Tickets ─────────────────────────────────────────
        const resMaint = await fetch('/api/maintenance');
        if (resMaint.ok) {
          const mJson = await resMaint.json();
          if (mJson.success && Array.isArray(mJson.data) && isMounted) {
            const dbMaint: MaintenanceTicket[] = mJson.data.map((t: any) => ({
              id: t.id,
              ticketNumber: t.ticketNumber,
              propertyId: t.propertyId,
              propertyName: t.propertyName,
              unitId: t.unitId,
              unitNumber: t.unitNumber,
              issue: t.issue,
              description: t.description ?? '',
              priority: t.priority,
              assignedTo: t.assignedTo,
              status: t.status,
              createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
              estimatedCost: t.estimatedCost ?? 0,
              actualCost: t.actualCost ?? undefined,
              resolutionNotes: t.resolutionNotes ?? undefined,
            }));
            setMaintenanceTickets(dbMaint);
          }
        }
      } catch (e) {
        console.warn('DB hydration error — running in offline mode:', e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openDrawer = (type: DrawerType, id: string) => {
    setActiveDrawer({ type, id });
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
  };

  const openGlobalModal = (type: GlobalModalType, data?: any) => {
    setActiveModal({ type, data });
  };

  const closeGlobalModal = () => {
    setActiveModal(null);
  };

  const selectedProperty = useMemo(() => {
    if (selectedPropertyId === 'all') return null;
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Log Audit trail helper
  const addAuditLog = (action: string, module: string, recordId: string, details: string, before?: string, after?: string) => {
    const now = new Date();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      date: '2026-09-19',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Admin (Operations)',
      action,
      module,
      recordId,
      details,
      beforeValue: before,
      afterValue: after,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Follow-up Completion Workflow
  const completeFollowUp = (
    followUpId: string,
    outcome: string,
    duration: string,
    notes: string,
    nextAction: string,
    nextDate?: string,
    nextTime?: string
  ) => {
    const target = followUps.find((f) => f.id === followUpId);
    if (!target) return;

    // 1. Update Follow-up
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              status: 'Completed',
              completedAt: '2026-09-19 11:35 AM',
              callOutcome: outcome as any,
              callDuration: duration,
              notes: notes ? `${f.notes}\n[Outcome Note]: ${notes}` : f.notes,
              nextAction: nextAction as any,
            }
          : f
      )
    );

    // 2. Add to Call Log
    const newCallLog: CallLog = {
      id: `call-${Date.now()}`,
      leadId: target.leadId,
      guestId: target.guestId,
      guestName: target.guestName,
      date: '2026-09-19',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'Outbound',
      duration: duration || '2m 15s',
      staff: target.assignedTo || 'Admin',
      outcome,
      notes: notes || 'Follow-up call completed with guest.',
    };
    setCallLogs((prev) => [newCallLog, ...prev]);

    // 3. Update Lead status if linked
    if (target.leadId) {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== target.leadId) return l;
          let newStatus: LeadStatus = l.status;
          if (outcome === 'Booking Confirmed') newStatus = 'Confirmed';
          else if (outcome === 'Not Interested') newStatus = 'Not Interested';
          else if (outcome === 'Interested') newStatus = 'Interested';
          else if (outcome === 'Price Objection' || outcome === 'Call Later') newStatus = 'Follow-up';

          return {
            ...l,
            status: newStatus,
            notes: `${l.notes}\n[Call ${outcome}]: ${notes}`,
          };
        })
      );
    }

    // 4. If nextAction is 'Create next follow-up', automatically create one
    if (nextAction === 'Create next follow-up' && nextDate) {
      const scheduledNew: FollowUp = {
        id: `fu-${Date.now()}`,
        leadId: target.leadId,
        guestId: target.guestId,
        guestName: target.guestName,
        guestPhone: target.guestPhone,
        propertyId: target.propertyId,
        propertyName: target.propertyName,
        type: 'Phone Call',
        purpose: `Follow-up on previous call (${outcome})`,
        scheduledDate: nextDate,
        scheduledTime: nextTime || '11:00 AM',
        assignedTo: target.assignedTo,
        status: 'Pending',
        urgency: nextDate === '2026-09-19' ? 'Due Today' : nextDate === '2026-09-20' ? 'Tomorrow' : 'This Week',
        notes: `Scheduled from follow-up ${target.id}. Notes: ${notes}`,
      };
      setFollowUps((prev) => [scheduledNew, ...prev]);
    }

    addAuditLog(
      'Completed Follow-up',
      'CRM',
      target.id,
      `Completed call with ${target.guestName}. Outcome: ${outcome}`,
      `Status: ${target.status}`,
      `Status: Completed, Outcome: ${outcome}`
    );

    showToast('Follow-up completed.', `Recorded outcome: ${outcome}`);
    closeGlobalModal();
  };

  const rescheduleFollowUp = (followUpId: string, newDate: string, newTime: string) => {
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              status: 'Rescheduled',
              scheduledDate: newDate,
              scheduledTime: newTime,
              urgency: newDate === '2026-09-19' ? 'Due Today' : newDate === '2026-09-20' ? 'Tomorrow' : 'This Week',
              notes: `${f.notes}\n[Rescheduled to ${newDate} at ${newTime}]`,
            }
          : f
      )
    );
    showToast('Follow-up rescheduled', `Moved to ${newDate} at ${newTime}`);
  };

  const addFollowUp = (data: Partial<FollowUp>) => {
    const newFollowUp: FollowUp = {
      id: `fu-${Date.now()}`,
      guestName: data.guestName || 'Guest',
      guestPhone: data.guestPhone || '+91 98000 00000',
      propertyId: data.propertyId || properties[0].id,
      propertyName: properties.find((p) => p.id === data.propertyId)?.name || properties[0].name,
      type: data.type || 'Phone Call',
      purpose: data.purpose || 'Follow-up inquiry',
      scheduledDate: data.scheduledDate || '2026-09-19',
      scheduledTime: data.scheduledTime || '12:00 PM',
      assignedTo: data.assignedTo || 'Arun',
      status: 'Pending',
      urgency: data.scheduledDate === '2026-09-19' ? 'Due Today' : 'Tomorrow',
      notes: data.notes || '',
      ...data,
    };
    setFollowUps((prev) => [newFollowUp, ...prev]);
    addAuditLog('Created Follow-up', 'CRM', newFollowUp.id, `Created follow-up for ${newFollowUp.guestName}`);
    showToast('Follow-up scheduled', `Scheduled for ${newFollowUp.guestName}`);
    closeGlobalModal();
  };

  const addLead = (data: Partial<Lead>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      leadNumber: `OD-LEAD-2026-${Math.floor(10000 + Math.random() * 90000).toString().slice(1)}`,
      guestName: data.guestName || 'New Inquirer',
      guestPhone: data.guestPhone || '+91 99000 11000',
      guestEmail: data.guestEmail || 'guest@example.com',
      propertyId: prop.id,
      propertyName: prop.name,
      checkIn: data.checkIn || '2026-09-25',
      checkOut: data.checkOut || '2026-09-27',
      guestsCount: data.guestsCount || 2,
      estimatedValue: data.estimatedValue || 12000,
      source: data.source || 'Phone Call',
      assignedTo: data.assignedTo || 'Arun',
      status: data.status || 'New',
      nextFollowUpDate: data.nextFollowUpDate || '2026-09-19',
      notes: data.notes || 'Inquired about property availability.',
      createdAt: '2026-09-19',
      ...data,
    };

    setLeads((prev) => [newLead, ...prev]);

    // Also auto-create a FollowUp if not existing
    const newFu: FollowUp = {
      id: `fu-${Date.now()}`,
      leadId: newLead.id,
      guestName: newLead.guestName,
      guestPhone: newLead.guestPhone,
      propertyId: newLead.propertyId,
      propertyName: newLead.propertyName,
      type: 'Phone Call',
      purpose: `First contact follow-up for lead ${newLead.leadNumber}`,
      scheduledDate: newLead.nextFollowUpDate,
      scheduledTime: '11:00 AM',
      assignedTo: newLead.assignedTo,
      status: 'Pending',
      urgency: 'Due Today',
      notes: newLead.notes,
    };
    setFollowUps((prev) => [newFu, ...prev]);

    addAuditLog('Created Lead', 'CRM', newLead.id, `Created lead ${newLead.leadNumber} for ${newLead.guestName}`);
    showToast('Lead created', `Lead ${newLead.leadNumber} added to pipeline.`);
    closeGlobalModal();
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    showToast('Lead status updated', `Moved to ${status}`);
  };

  const addQuotation = (data: Partial<Quotation>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const newQuote: Quotation = {
      id: `quot-${Date.now()}`,
      quotationNumber: `OD-Q-2026-00${Math.floor(25 + Math.random() * 50)}`,
      leadId: data.leadId,
      guestName: data.guestName || 'Guest',
      guestPhone: data.guestPhone || '+91 98000 00000',
      guestEmail: data.guestEmail || 'guest@example.com',
      propertyId: prop.id,
      propertyName: prop.name,
      roomTypeName: data.roomTypeName || 'Deluxe Room',
      checkIn: data.checkIn || '2026-09-25',
      checkOut: data.checkOut || '2026-09-27',
      nights: data.nights || 2,
      guestsCount: data.guestsCount || 2,
      roomCharge: data.roomCharge || 12000,
      extraGuestCharge: data.extraGuestCharge || 0,
      discount: data.discount || 0,
      tax: data.tax || 1440,
      total: (data.roomCharge || 12000) + (data.extraGuestCharge || 0) - (data.discount || 0) + (data.tax || 1440),
      validUntil: data.validUntil || '2026-09-23',
      status: 'Sent',
      createdAt: '2026-09-19',
      notes: data.notes || '',
      ...data,
    };
    setQuotations((prev) => [newQuote, ...prev]);
    addAuditLog('Created Quotation', 'CRM', newQuote.id, `Created quotation ${newQuote.quotationNumber} for ${newQuote.guestName}`);
    showToast('Quotation created', `Quotation ${newQuote.quotationNumber} generated`);
    closeGlobalModal();
  };

  const convertQuotationToBooking = (quotationId: string) => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return;

    // Find available unit in that property
    const availableUnit =
      units.find((u) => u.propertyId === quote.propertyId && u.status === 'Available') ||
      units.find((u) => u.propertyId === quote.propertyId) ||
      units[0];
    if (!availableUnit) {
      showToast('No unit available', 'Cannot convert — no units found for this property.', 'error');
      return;
    }

    const tempId = `res-${Date.now()}`;
    const tempBookingId = `OD-BKG-${new Date().getFullYear()}-${String(Math.floor(900 + Math.random() * 100)).padStart(5, '0')}`;

    const newBooking: Reservation = {
      id: tempId,
      bookingId: tempBookingId,
      guestId: `guest-${Date.now()}`,
      guestName: quote.guestName,
      guestPhone: quote.guestPhone,
      guestEmail: quote.guestEmail,
      propertyId: quote.propertyId,
      propertyName: quote.propertyName,
      unitId: availableUnit.id,
      unitNumber: availableUnit.number,
      unitTypeName: quote.roomTypeName,
      checkIn: quote.checkIn,
      checkOut: quote.checkOut,
      nights: quote.nights,
      guestsCount: quote.guestsCount,
      source: 'Website',
      rate: quote.roomCharge,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      paid: 0,
      balance: quote.total,
      status: 'Confirmed',
      specialRequests: quote.notes,
      createdAt: new Date().toISOString().split('T')[0],
      quotationId: quote.id,
    };

    setReservations((prev) => [newBooking, ...prev]);

    // Mark quotation as Accepted
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status: 'Accepted' } : q))
    );

    // If lead exists, update lead to Confirmed
    if (quote.leadId) {
      setLeads((prev) =>
        prev.map((l) => (l.id === quote.leadId ? { ...l, status: 'Confirmed', reservationId: tempId } : l))
      );
    }

    addAuditLog(
      'Converted Quotation to Booking',
      'Reservations',
      tempBookingId,
      `Converted quotation ${quote.quotationNumber} to booking ${tempBookingId}`
    );

    showToast('Booking Created!', `Quotation converted to Booking ${tempBookingId}`);

    // Async DB sync
    (async () => {
      try {
        const payload = {
          guestName: newBooking.guestName,
          guestPhone: newBooking.guestPhone,
          guestEmail: newBooking.guestEmail,
          propertyId: newBooking.propertyId,
          propertyName: newBooking.propertyName,
          unitId: availableUnit.id,
          unitNumber: availableUnit.number,
          unitTypeName: availableUnit.unitTypeName,
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          nights: newBooking.nights,
          guestsCount: newBooking.guestsCount,
          source: newBooking.source,
          rate: newBooking.rate,
          discount: newBooking.discount,
          tax: newBooking.tax,
          paid: 0,
          status: newBooking.status,
          specialRequests: newBooking.specialRequests,
          quotationId: quote.id,
          leadId: quote.leadId,
        };

        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            const dbRes = json.data;
            // Reconcile temp IDs with DB-generated IDs
            setReservations((prev) =>
              prev.map((r) =>
                r.id === tempId
                  ? { ...r, id: dbRes.id, bookingId: dbRes.bookingId || r.bookingId, guestId: dbRes.guestId || r.guestId }
                  : r
              )
            );
            if (quote.leadId) {
              setLeads((prev) =>
                prev.map((l) => (l.id === quote.leadId ? { ...l, reservationId: dbRes.id } : l))
              );
            }
          }
        }
      } catch (err) {
        console.warn('DB sync error for convertQuotationToBooking:', err);
      }
    })();
  };

  const addReservation = (data: Partial<Reservation>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const unit = units.find((u) => u.id === data.unitId) || units.find((u) => u.propertyId === prop.id) || units[0];

    const total = (data.rate || 10000) - (data.discount || 0) + (data.tax || 1200);
    const paid = data.paid || 0;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      bookingId: `OD-BKG-2026-00${Math.floor(1000 + Math.random() * 500)}`,
      guestId: data.guestId || `guest-${Date.now()}`,
      guestName: data.guestName || 'Guest',
      guestPhone: data.guestPhone || '+91 98000 00000',
      guestEmail: data.guestEmail || 'guest@example.com',
      propertyId: prop.id,
      propertyName: prop.name,
      unitId: unit.id,
      unitNumber: unit.number,
      unitTypeName: unit.unitTypeName,
      checkIn: data.checkIn || '2026-09-20',
      checkOut: data.checkOut || '2026-09-22',
      nights: data.nights || 2,
      guestsCount: data.guestsCount || 2,
      source: data.source || 'Phone',
      rate: data.rate || 10000,
      discount: data.discount || 0,
      tax: data.tax || 1200,
      total,
      paid,
      balance: total - paid,
      status: data.status || 'Confirmed',
      specialRequests: data.specialRequests || '',
      createdAt: '2026-09-19',
      ...data,
    };

    setReservations((prev) => [newRes, ...prev]);

    // If initial status is Checked In, set unit Occupied
    if (newRes.status === 'Checked In') {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === unit.id
            ? { ...u, status: 'Occupied', currentReservationId: newRes.id, currentGuestName: newRes.guestName, currentCheckOut: newRes.checkOut }
            : u
        )
      );
    }

    // If paid > 0, record initial payment
    if (paid > 0) {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        paymentId: `OD-PAY-2026-${Math.floor(330 + Math.random() * 70)}`,
        reservationId: newRes.id,
        bookingId: newRes.bookingId,
        guestName: newRes.guestName,
        propertyId: newRes.propertyId,
        propertyName: newRes.propertyName,
        amount: paid,
        method: 'UPI',
        date: '2026-09-19',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success',
        referenceNumber: `INIT-DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        collectedBy: 'Reception',
      };
      setPayments((prev) => [newPay, ...prev]);
    }

    addAuditLog('Created Reservation', 'Reservations', newRes.bookingId, `Created booking for ${newRes.guestName} at ${newRes.propertyName}`);

    // Outbound channel sync event: automatically block unit on connected OTAs to prevent double-booking
    const channels: OTAChannel[] = ['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'];
    const outboundSyncEvents: ChannelSyncEvent[] = channels.map((c) => ({
      id: `sync-evt-${Date.now()}-${c.toLowerCase()}`,
      timestamp: 'Just now',
      channel: c,
      propertyName: newRes.propertyName,
      eventType: 'INVENTORY_BLOCK',
      status: 'Success',
      bookingReference: newRes.bookingId,
      details: `Unit ${newRes.unitNumber} dates ${newRes.checkIn} to ${newRes.checkOut} blocked on ${c} (2-way calendar parity).`,
      latencyMs: Math.floor(90 + Math.random() * 80),
    }));
    setChannelSyncEvents((prev) => [...outboundSyncEvents, ...prev]);

    showToast('Reservation created', `Booking ${newRes.bookingId} confirmed & blocked across all OTAs.`);
    closeGlobalModal();

    // Async PostgreSQL Sync
    (async () => {
      try {
        const payload = {
          guestName: newRes.guestName,
          guestPhone: newRes.guestPhone,
          guestEmail: newRes.guestEmail,
          propertyId: prop.id,
          propertyName: prop.name,
          unitId: unit.id,
          unitNumber: unit.number,
          unitTypeName: unit.unitTypeName,
          checkIn: newRes.checkIn,
          checkOut: newRes.checkOut,
          nights: newRes.nights,
          guestsCount: newRes.guestsCount,
          source: newRes.source,
          rate: newRes.rate,
          discount: newRes.discount,
          tax: newRes.tax,
          paid: newRes.paid,
          status: newRes.status,
          specialRequests: newRes.specialRequests,
        };

        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            const dbRes = json.data;
            setReservations((prev) =>
              prev.map((r) =>
                r.id === newRes.id
                  ? {
                      ...r,
                      id: dbRes.id,
                      bookingId: dbRes.bookingId || r.bookingId,
                      guestId: dbRes.guestId || r.guestId,
                    }
                  : r
              )
            );

            setUnits((prev) =>
              prev.map((u) =>
                u.id === unit.id && u.currentReservationId === newRes.id
                  ? { ...u, currentReservationId: dbRes.id }
                  : u
              )
            );

            if (paid > 0) {
              setPayments((prev) =>
                prev.map((p) =>
                  p.reservationId === newRes.id
                    ? { ...p, reservationId: dbRes.id, bookingId: dbRes.bookingId }
                    : p
                )
              );
            }
          }
        }
      } catch (err) {
        console.warn('PostgreSQL sync error for reservation:', err);
      }
    })();
  };

  const checkInGuest = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'Checked In' } : r))
    );

    setUnits((prev) =>
      prev.map((u) =>
        u.id === res.unitId
          ? { ...u, status: 'Occupied', currentReservationId: res.id, currentGuestName: res.guestName, currentCheckOut: res.checkOut }
          : u
      )
    );

    addAuditLog('Checked In Guest', 'Reservations', res.bookingId, `Checked in ${res.guestName} to ${res.unitNumber}`);
    showToast('Check-in Complete', `${res.guestName} checked in to ${res.unitNumber}`);

    // Async PostgreSQL Sync
    (async () => {
      try {
        await fetch(`/api/reservations/${reservationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check-in' }),
        });
        if (res.unitId) {
          await fetch(`/api/units/${res.unitId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Occupied',
              currentReservationId: res.id,
              currentGuestName: res.guestName,
              currentCheckOut: res.checkOut,
            }),
          });
        }
      } catch (e) {
        console.warn('Failed to sync check-in to database:', e);
      }
    })();
  };

  const checkOutGuest = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    // 1. Mark reservation checked out
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'Checked Out' } : r))
    );

    // 2. Automatically mark room as Dirty
    setUnits((prev) =>
      prev.map((u) =>
        u.id === res.unitId
          ? { ...u, status: 'Dirty', currentReservationId: undefined, currentGuestName: undefined, currentCheckOut: undefined }
          : u
      )
    );

    // 3. Automatically dispatch Housekeeping Checkout Cleaning task
    const newHk: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      propertyId: res.propertyId,
      propertyName: res.propertyName,
      unitId: res.unitId,
      unitNumber: res.unitNumber,
      taskType: 'Checkout Cleaning',
      assignedTo: 'Housekeeping Duty Team',
      scheduledTime: 'Immediate',
      status: 'Pending',
      priority: 'Urgent',
      notes: `Departure cleaning for guest ${res.guestName}. Sanitize room and restock all amenities.`,
      updatedAt: '2026-09-19 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHousekeepingTasks((prev) => [newHk, ...prev]);

    addAuditLog(
      'Checked Out Guest',
      'Reservations',
      res.bookingId,
      `Checked out ${res.guestName}. Unit ${res.unitNumber} marked Dirty, Housekeeping task ${newHk.id} created.`
    );

    showToast('Guest Checked Out', `Unit ${res.unitNumber} set to Dirty. Housekeeping task dispatched.`);

    // Async PostgreSQL Sync
    (async () => {
      try {
        await fetch(`/api/reservations/${reservationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check-out' }),
        });
        if (res.unitId) {
          await fetch(`/api/units/${res.unitId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Dirty',
              currentReservationId: null,
              currentGuestName: null,
              currentCheckOut: null,
            }),
          });
        }
      } catch (e) {
        console.warn('Failed to sync check-out to database:', e);
      }
    })();
  };

  const cancelReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'Cancelled' } : r))
    );

    if (res.unitId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === res.unitId && u.currentReservationId === res.id
            ? { ...u, status: 'Available', currentReservationId: undefined, currentGuestName: undefined, currentCheckOut: undefined }
            : u
        )
      );
    }

    addAuditLog('Cancelled Reservation', 'Reservations', res.bookingId, `Cancelled reservation for ${res.guestName}`);
    showToast('Reservation Cancelled', `Booking ${res.bookingId} cancelled. Unit ${res.unitNumber} released.`);

    // Async PostgreSQL Sync
    (async () => {
      try {
        await fetch(`/api/reservations/${reservationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' }),
        });
        if (res.unitId) {
          await fetch(`/api/units/${res.unitId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Available',
              currentReservationId: null,
              currentGuestName: null,
              currentCheckOut: null,
            }),
          });
        }
      } catch (e) {
        console.warn('Failed to sync cancellation to database:', e);
      }
    })();
  };

  const recordPayment = (data: Partial<Payment>) => {
    const amount = data.amount || 0;
    const res = reservations.find((r) => r.id === data.reservationId);

    const tempId = `pay-${Date.now()}`;
    const tempPaymentId = `OD-PAY-${new Date().getFullYear()}-${String(Math.floor(300 + Math.random() * 100)).padStart(5, '0')}`;

    const newPayment: Payment = {
      id: tempId,
      paymentId: tempPaymentId,
      reservationId: data.reservationId || '',
      bookingId: res?.bookingId || data.bookingId || '',
      guestName: res?.guestName || data.guestName || 'Guest',
      propertyId: res?.propertyId || data.propertyId || (properties[0]?.id ?? ''),
      propertyName: res?.propertyName || data.propertyName || (properties[0]?.name ?? ''),
      amount,
      method: data.method || 'UPI',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Success',
      referenceNumber: data.referenceNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      collectedBy: data.collectedBy || 'Reception Desk',
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update reservation balance optimistically
    if (res) {
      setReservations((prev) =>
        prev.map((r) => {
          if (r.id !== res.id) return r;
          const newPaid = r.paid + amount;
          const newBal = Math.max(0, r.total - newPaid);
          return { ...r, paid: newPaid, balance: newBal };
        })
      );
    }

    addAuditLog('Recorded Payment', 'Finance', newPayment.paymentId, `Recorded ₹${amount} via ${newPayment.method} for ${newPayment.guestName}`);
    showToast('Payment recorded successfully', `Received ₹${amount.toLocaleString('en-IN')}`);
    closeGlobalModal();

    // Async DB sync
    (async () => {
      try {
        if (!newPayment.reservationId) return;
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reservationId: newPayment.reservationId,
            amount,
            method: newPayment.method,
            referenceNumber: newPayment.referenceNumber,
            collectedBy: newPayment.collectedBy,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.id) {
            // Reconcile the temp payment entry with DB IDs
            setPayments((prev) =>
              prev.map((p) =>
                p.id === tempId
                  ? { ...p, id: json.data.id, paymentId: json.data.paymentId || p.paymentId }
                  : p
              )
            );
          }
        }
      } catch (err) {
        console.warn('DB sync error for recordPayment:', err);
      }
    })();
  };

  const updateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status } : u))
    );
    showToast('Unit status updated', `Room status changed to ${status}`);

    // Asynchronously update in backend PostgreSQL
    fetch(`/api/units/${unitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((err) => {
      console.warn('Backend sync for unit status update:', err);
    });
  };

  const startHousekeepingTask = (taskId: string) => {
    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Cleaning', updatedAt: '2026-09-19 ' + new Date().toLocaleTimeString() } : t))
    );
    setUnits((prev) =>
      prev.map((u) => (u.id === task.unitId ? { ...u, status: 'Cleaning' } : u))
    );
    showToast('Cleaning in progress', `Unit ${task.unitNumber} marked as Cleaning`);
  };

  const completeHousekeepingTask = (taskId: string) => {
    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Completed', updatedAt: '2026-09-19 ' + new Date().toLocaleTimeString() } : t))
    );
    // When completed, unit becomes Available!
    setUnits((prev) =>
      prev.map((u) => (u.id === task.unitId ? { ...u, status: 'Available' } : u))
    );
    showToast('Housekeeping task completed', `Unit ${task.unitNumber} is now Available!`);
  };

  const inspectHousekeepingTask = (taskId: string) => {
    const task = housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    setHousekeepingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Completed', updatedAt: '2026-09-19 ' + new Date().toLocaleTimeString() } : t))
    );
    setUnits((prev) =>
      prev.map((u) => (u.id === task.unitId ? { ...u, status: 'Available' } : u))
    );
    showToast('Inspection approved', `Unit ${task.unitNumber} verified & Available`);
  };

  const addHousekeepingTask = (data: Partial<HousekeepingTask>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const unit = units.find((u) => u.id === data.unitId) || units.find((u) => u.propertyId === prop.id) || units[0];

    const newTask: HousekeepingTask = {
      id: `hk-${Date.now()}`,
      propertyId: prop.id,
      propertyName: prop.name,
      unitId: unit.id,
      unitNumber: unit.number,
      taskType: data.taskType || 'Regular Cleaning',
      assignedTo: data.assignedTo || 'Housekeeping Team',
      scheduledTime: data.scheduledTime || '12:00 PM',
      status: 'Pending',
      priority: data.priority || 'Normal',
      notes: data.notes || '',
      updatedAt: '2026-09-19 12:00 PM',
      ...data,
    };

    setHousekeepingTasks((prev) => [newTask, ...prev]);
    showToast('Housekeeping task scheduled', `Assigned ${newTask.taskType} for ${newTask.unitNumber}`);
    closeGlobalModal();
  };

  const addMaintenanceTicket = (data: Partial<MaintenanceTicket>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const unit = units.find((u) => u.id === data.unitId) || units.find((u) => u.propertyId === prop.id) || units[0];

    const newTicket: MaintenanceTicket = {
      id: `mt-${Date.now()}`,
      ticketNumber: `MT-${Math.floor(1050 + Math.random() * 50)}`,
      propertyId: prop.id,
      propertyName: prop.name,
      unitId: unit.id,
      unitNumber: unit.number,
      issue: data.issue || 'Maintenance issue',
      description: data.description || '',
      priority: data.priority || 'High',
      assignedTo: data.assignedTo || 'Maintenance Lead',
      status: 'Open',
      createdAt: '2026-09-19 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedCost: data.estimatedCost || 2000,
      ...data,
    };

    setMaintenanceTickets((prev) => [newTicket, ...prev]);

    // Flips unit status to Maintenance
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, status: 'Maintenance' } : u))
    );

    addAuditLog('Created Maintenance Ticket', 'Operations', newTicket.ticketNumber, `Reported ${newTicket.issue} in ${newTicket.unitNumber}`);
    showToast('Maintenance ticket logged', `Unit ${newTicket.unitNumber} marked as Maintenance`);
    closeGlobalModal();
  };

  const resolveMaintenanceTicket = (ticketId: string, notes?: string) => {
    const ticket = maintenanceTickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved', resolutionNotes: notes || 'Repaired and verified.' } : t))
    );

    // Flips unit status to Inspection or Available
    setUnits((prev) =>
      prev.map((u) => (u.id === ticket.unitId ? { ...u, status: 'Available' } : u))
    );

    addAuditLog('Resolved Maintenance Ticket', 'Operations', ticket.ticketNumber, `Resolved ticket for ${ticket.unitNumber}`);
    showToast('Maintenance resolved', `Unit ${ticket.unitNumber} returned to service (Available)`);
  };

  const addExpense = (data: Partial<Expense>) => {
    const prop = properties.find((p) => p.id === data.propertyId) || properties[0];
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: '2026-09-19',
      propertyId: prop.id,
      propertyName: prop.name,
      category: data.category || 'Supplies',
      vendor: data.vendor || 'Local Vendor',
      description: data.description || 'Property operating expense',
      amount: data.amount || 2500,
      status: 'Approved',
      paymentMode: data.paymentMode || 'UPI',
      ...data,
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast('Expense recorded', `Added ₹${newExp.amount.toLocaleString('en-IN')} under ${newExp.category}`);
    closeGlobalModal();
  };

  const addGuest = (data: Partial<Guest>) => {
    const newG: Guest = {
      id: `guest-${Date.now()}`,
      name: data.name || 'New Guest',
      phone: data.phone || '+91 98000 00000',
      email: data.email || 'guest@example.com',
      idProofNumber: data.idProofNumber || '',
      vip: !!data.vip,
      totalStays: 0,
      totalSpend: 0,
      preferences: data.preferences || [],
      status: data.vip ? 'VIP' : 'First-time',
      createdAt: '2026-09-19',
      ...data,
    };
    setGuests((prev) => [newG, ...prev]);
    showToast('Guest profile created', `${newG.name} registered`);
    closeGlobalModal();
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              responseStatus: 'Responded',
              responseText: replyText,
              responseDate: '2026-09-19',
            }
          : r
      )
    );
    showToast('Reply published', 'Public review response updated');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications cleared', 'All marked as read');
  };

  // ---------------------------------------------------------------------------
  // OTA Channel Manager & Sync Simulator Handlers
  // ---------------------------------------------------------------------------

  const triggerGlobalChannelSync = async () => {
    setIsSyncingChannels(true);
    try {
      const res = await fetch('/api/channels/simulate-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: selectedPropertyId }),
      });
      await res.json();

      const nowStr = 'Just now';
      setChannelConnections((prev) =>
        prev.map((c) => ({ ...c, lastSyncAt: nowStr, status: 'Connected' }))
      );

      const targetPropName = selectedProperty ? selectedProperty.name : 'All Properties';
      const newEvents: ChannelSyncEvent[] = (['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'] as OTAChannel[]).map((c) => ({
        id: `sync-evt-${Date.now()}-${c.toLowerCase()}`,
        timestamp: 'Just now',
        channel: c,
        propertyName: targetPropName,
        eventType: 'RATE_PUSH',
        status: 'Success',
        details: `Two-way rate & inventory parity push confirmed on ${c} distribution endpoint.`,
        latencyMs: Math.floor(100 + Math.random() * 120),
      }));

      setChannelSyncEvents((prev) => [...newEvents, ...prev]);
      showToast('Global OTA Sync Complete', 'Inventory & rates synchronized across Airbnb, Booking.com, Agoda, and MMT.', 'success');
    } catch {
      showToast('Sync Refreshed', 'Local channel state and inventory parity verified.', 'info');
    } finally {
      setIsSyncingChannels(false);
    }
  };

  const simulateIncomingOtaBooking = async (params: {
    channel: OTAChannel;
    propertyId?: string;
    propertyName?: string;
    unitTypeId?: string;
    unitTypeName?: string;
    unitNumber?: string;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    guestsCount?: number;
    baseRate?: number;
  }): Promise<Reservation> => {
    const targetProp = properties.find((p) => p.id === params.propertyId) || properties[0];
    const targetUnitType = unitTypes.find((ut) => ut.id === params.unitTypeId) || unitTypes[0];
    const availableUnit =
      units.find((u) => u.propertyId === targetProp.id && u.status === 'Available') ||
      units.find((u) => u.propertyId === targetProp.id) ||
      units[0];

    const basePayload = {
      channel: params.channel,
      propertyId: targetProp.id,
      propertyName: targetProp.name,
      unitTypeId: targetUnitType.id,
      unitTypeName: targetUnitType.name,
      unitNumber: params.unitNumber || availableUnit.number,
      guestName: params.guestName || 'Sneha Roy',
      guestEmail: params.guestEmail || 'sneha.roy@gmail.com',
      guestPhone: params.guestPhone || '+91 98450 11223',
      checkIn: params.checkIn || '2026-09-26',
      checkOut: params.checkOut || '2026-09-29',
      nights: params.nights || 3,
      guestsCount: params.guestsCount || 2,
      baseRate: params.baseRate || targetUnitType.baseRate || 5000,
    };

    let newRes: Reservation;
    try {
      const res = await fetch('/api/channels/simulate-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload),
      });
      const data = await res.json();
      if (data.reservation) {
        newRes = data.reservation;
      } else {
        throw new Error('Fallback calculation');
      }
    } catch {
      // Local fallback calculation
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const bookingId = `${params.channel.substring(0, 3).toUpperCase()}-${randomNum}`;
      const total = basePayload.baseRate * basePayload.nights * 1.15;
      newRes = {
        id: `res-ota-${Date.now()}`,
        bookingId,
        guestId: `guest-ota-${Date.now()}`,
        guestName: basePayload.guestName,
        guestPhone: basePayload.guestPhone,
        guestEmail: basePayload.guestEmail,
        propertyId: targetProp.id,
        propertyName: targetProp.name,
        unitId: availableUnit.id,
        unitNumber: basePayload.unitNumber,
        unitTypeName: targetUnitType.name,
        checkIn: basePayload.checkIn,
        checkOut: basePayload.checkOut,
        nights: basePayload.nights,
        guestsCount: basePayload.guestsCount,
        source: params.channel,
        rate: basePayload.baseRate * basePayload.nights,
        discount: 0,
        tax: Math.round(total * 0.12),
        total: Math.round(total),
        paid: Math.round(total),
        balance: 0,
        status: 'Confirmed',
        specialRequests: `Instant booking via ${params.channel} API.`,
        createdAt: '2026-09-21',
      };
    }

    // Add reservation to state
    setReservations((prev) => [newRes, ...prev]);

    // Mark unit as occupied
    setUnits((prev) =>
      prev.map((u) =>
        u.id === availableUnit.id
          ? {
              ...u,
              status: 'Occupied',
              currentReservationId: newRes.id,
              currentGuestName: newRes.guestName,
              currentCheckOut: newRes.checkOut,
            }
          : u
      )
    );

    // Record incoming sync event
    const inboundEvent: ChannelSyncEvent = {
      id: `sync-in-${Date.now()}`,
      timestamp: 'Just now',
      channel: params.channel,
      propertyName: targetProp.name,
      eventType: 'INCOMING_BOOKING',
      status: 'Success',
      bookingReference: newRes.bookingId,
      details: `Instant booking received for ${newRes.guestName} (${newRes.nights} nights, ₹${newRes.total?.toLocaleString('en-IN')}). Unit ${newRes.unitNumber} assigned.`,
      latencyMs: Math.floor(95 + Math.random() * 60),
    };

    // Outbound stop-sell block on other channels
    const otherChannels = (['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'] as OTAChannel[]).filter(
      (c) => c !== params.channel
    );
    const outboundBlocks: ChannelSyncEvent[] = otherChannels.map((c) => ({
      id: `sync-out-${Date.now()}-${c.toLowerCase()}`,
      timestamp: 'Just now',
      channel: c,
      propertyName: targetProp.name,
      eventType: 'INVENTORY_BLOCK',
      status: 'Success',
      bookingReference: newRes.bookingId,
      details: `Unit ${newRes.unitNumber} dates ${newRes.checkIn} to ${newRes.checkOut} blocked on ${c} (anti-double-booking).`,
      latencyMs: Math.floor(110 + Math.random() * 80),
    }));

    setChannelSyncEvents((prev) => [inboundEvent, ...outboundBlocks, ...prev]);

    addAuditLog(
      'OTA Instant Booking Received',
      'Channel Manager',
      newRes.bookingId,
      `Simulated ${params.channel} instant reservation ${newRes.bookingId} for ${newRes.guestName}`
    );

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: `New ${params.channel} Booking`,
      message: `${newRes.guestName} booked ${newRes.unitTypeName} (${newRes.unitNumber}) at ${newRes.propertyName}. Total: ₹${newRes.total?.toLocaleString('en-IN')}`,
      type: 'booking',
      time: 'Just now',
      read: false,
      link: '/reservations',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Incoming ${params.channel} Booking!`, `${newRes.bookingId} - ${newRes.guestName} booked ${newRes.unitNumber}`, 'success');
    closeGlobalModal();
    return newRes;
  };

  const simulateOtaCancellation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId || r.bookingId === reservationId);
    if (!res) return;

    setReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'Cancelled' } : r))
    );

    // Free up the unit
    if (res.unitId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === res.unitId
            ? {
                ...u,
                status: 'Available',
                currentReservationId: undefined,
                currentGuestName: undefined,
                currentCheckOut: undefined,
              }
            : u
        )
      );
    }

    const cancelEvt: ChannelSyncEvent = {
      id: `sync-cancel-${Date.now()}`,
      timestamp: 'Just now',
      channel: (res.source as OTAChannel) || 'Airbnb',
      propertyName: res.propertyName,
      eventType: 'BOOKING_CANCELLED',
      status: 'Success',
      bookingReference: res.bookingId,
      details: `Guest cancelled ${res.bookingId} (${res.guestName}). Unit ${res.unitNumber} inventory released back across all OTAs.`,
      latencyMs: 110,
    };

    setChannelSyncEvents((prev) => [cancelEvt, ...prev]);
    showToast('OTA Booking Cancelled', `Unit ${res.unitNumber} released back into channel distribution.`, 'warning');

    // Async DB sync
    (async () => {
      try {
        await fetch(`/api/reservations/${res.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel' }),
        });
        if (res.unitId) {
          await fetch(`/api/units/${res.unitId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'Available',
              currentReservationId: null,
              currentGuestName: null,
              currentCheckOut: null,
            }),
          });
        }
      } catch (e) {
        console.warn('DB sync error for simulateOtaCancellation:', e);
      }
    })();
  };

  const updateChannelSettings = (channelId: string, updates: Partial<ChannelConnection>) => {
    setChannelConnections((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, ...updates, lastSyncAt: 'Just now' } : c))
    );
    showToast('Channel Settings Saved', 'Synchronization parameters updated successfully.');
  };

  const updateChannelRateMarkup = (channel: OTAChannel, markupPercentage: number) => {
    setChannelConnections((prev) =>
      prev.map((c) => (c.channel === channel ? { ...c, rateMarkupPercentage: markupPercentage } : c))
    );

    setChannelRateRules((prev) =>
      prev.map((rule) => {
        const channelData = rule.rates[channel];
        if (!channelData) return rule;
        const newChannelRate = Math.round(rule.baseRate * (1 + markupPercentage / 100));
        const commissionAmount = Math.round(newChannelRate * (channelData.commissionRate / 100));
        const newNetPayout = newChannelRate - commissionAmount;

        return {
          ...rule,
          rates: {
            ...rule.rates,
            [channel]: {
              ...channelData,
              markupPercentage,
              channelRate: newChannelRate,
              netPayout: newNetPayout,
            },
          },
        };
      })
    );

    showToast('Rate Parity Updated', `${channel} markup adjusted to +${markupPercentage}%. Calculated rates updated.`);
  };

  // ── Property & Unit Backend-Integrated CRUD ─────────────────────────────────
  const addProperty = (data: Partial<Property>) => {
    const tempId = `prop-${Date.now()}`;
    const newProperty: Property = {
      id: tempId,
      name: data.name || 'New Property',
      type: data.type || 'Hotel',
      location: data.location || 'India',
      contact: data.contact || '',
      totalUnits: data.totalUnits ?? 0,
      occupancyRate: 0,
      todayArrivals: 0,
      todayDepartures: 0,
      revenueThisMonth: 0,
      status: data.status || 'Active',
      ownerName: data.ownerName || '',
      ownerEmail: data.ownerEmail || '',
      ownerPhone: data.ownerPhone || '',
      description: data.description || '',
      amenities: data.amenities || [],
    };
    setProperties((prev) => [newProperty, ...prev]);
    addAuditLog('CREATE', 'Properties', newProperty.id, `New property "${newProperty.name}" added at ${newProperty.location}.`);
    showToast('Property Added', `"${newProperty.name}" has been added to your portfolio.`, 'success');

    // Asynchronously persist to backend PostgreSQL
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProperty.name,
        type: newProperty.type,
        location: newProperty.location,
        contact: newProperty.contact,
        totalUnits: newProperty.totalUnits,
        ownerName: newProperty.ownerName,
        ownerEmail: newProperty.ownerEmail,
        ownerPhone: newProperty.ownerPhone,
        description: newProperty.description,
        amenities: newProperty.amenities,
        status: newProperty.status,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.id) {
          // Update temp ID with database-persisted cuid
          setProperties((prev) =>
            prev.map((p) => (p.id === tempId ? { ...p, id: json.data.id } : p))
          );
        }
      })
      .catch((err) => {
        console.warn('Backend sync for property creation:', err);
      });
  };

  const removeProperty = (propertyId: string) => {
    const target = properties.find((p) => p.id === propertyId);
    if (!target) return;
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    addAuditLog('DELETE', 'Properties', propertyId, `Property "${target.name}" removed from portfolio.`);
    showToast('Property Removed', `"${target.name}" has been removed.`, 'warning');

    // Asynchronously delete from backend PostgreSQL
    fetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('Backend sync for property deletion:', err);
    });
  };

  const addUnit = (data: Partial<Unit> & { propertyId: string; propertyName: string }) => {
    const tempId = `unit-${Date.now()}`;
    const newUnit: Unit = {
      id: tempId,
      propertyId: data.propertyId,
      propertyName: data.propertyName,
      unitTypeId: data.unitTypeId || '',
      unitTypeName: data.unitTypeName || 'Standard Room',
      number: data.number || `R-${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Unit',
      floor: data.floor || 'Ground Floor',
      status: (data.status as UnitStatus) || 'Available',
    };
    setUnits((prev) => [...prev, newUnit]);
    setProperties((prev) =>
      prev.map((p) => (p.id === data.propertyId ? { ...p, totalUnits: (p.totalUnits || 0) + 1 } : p))
    );
    addAuditLog('CREATE', 'Units', newUnit.id, `Unit "${newUnit.number}" added to ${newUnit.propertyName}.`);
    showToast('Unit Added', `Unit ${newUnit.number} added successfully.`, 'success');

    // Asynchronously persist to backend PostgreSQL
    fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: newUnit.propertyId,
        unitTypeId: newUnit.unitTypeId || undefined,
        number: newUnit.number,
        name: newUnit.name,
        floor: newUnit.floor,
        status: newUnit.status,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.id) {
          // Update temp ID with database-persisted cuid
          setUnits((prev) =>
            prev.map((u) =>
              u.id === tempId
                ? { ...u, id: json.data.id, unitTypeId: json.data.unitTypeId || u.unitTypeId }
                : u
            )
          );
        }
      })
      .catch((err) => {
        console.warn('Backend sync for unit creation:', err);
      });
  };

  const removeUnit = (unitId: string) => {
    const target = units.find((u) => u.id === unitId);
    if (!target) return;
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
    setProperties((prev) =>
      prev.map((p) => (p.id === target.propertyId ? { ...p, totalUnits: Math.max(0, (p.totalUnits || 1) - 1) } : p))
    );
    addAuditLog('DELETE', 'Units', unitId, `Unit "${target.number}" removed from ${target.propertyName}.`);
    showToast('Unit Removed', `Unit ${target.number} has been removed.`, 'warning');

    // Asynchronously delete from backend PostgreSQL
    fetch(`/api/units/${unitId}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('Backend sync for unit deletion:', err);
    });
  };

  return (
    <ERPContext.Provider
      value={{
        properties,
        selectedPropertyId,
        unitTypes,
        units,
        guests,
        leads,
        followUps,
        callLogs,
        quotations,
        reservations,
        payments,
        invoices,
        housekeepingTasks,
        maintenanceTickets,
        staffTasks,
        expenses,
        ownerSettlements,
        reviews,
        auditLogs,
        notifications,
        toasts,
        channelConnections,
        channelSyncEvents,
        channelRateRules,
        isSyncingChannels,
        triggerGlobalChannelSync,
        simulateIncomingOtaBooking,
        simulateOtaCancellation,
        updateChannelSettings,
        updateChannelRateMarkup,
        selectedProperty,
        setSelectedPropertyId,
        activeDrawer,
        openDrawer,
        closeDrawer,
        activeModal,
        openGlobalModal,
        closeGlobalModal,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        showToast,
        removeToast,
        completeFollowUp,
        rescheduleFollowUp,
        addFollowUp,
        addLead,
        updateLeadStatus,
        addQuotation,
        convertQuotationToBooking,
        addReservation,
        checkInGuest,
        checkOutGuest,
        cancelReservation,
        recordPayment,
        updateUnitStatus,
        startHousekeepingTask,
        completeHousekeepingTask,
        inspectHousekeepingTask,
        addHousekeepingTask,
        addMaintenanceTicket,
        resolveMaintenanceTicket,
        addExpense,
        addGuest,
        replyToReview,
        markNotificationRead,
        markAllNotificationsRead,
        addProperty,
        removeProperty,
        addUnit,
        removeUnit,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}

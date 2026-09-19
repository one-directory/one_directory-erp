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
} from '@/types/erp';
import {
  INITIAL_PROPERTIES,
  INITIAL_UNIT_TYPES,
  INITIAL_UNITS,
  INITIAL_GUESTS,
  INITIAL_LEADS,
  INITIAL_FOLLOW_UPS,
  INITIAL_CALL_LOGS,
  INITIAL_QUOTATIONS,
  INITIAL_RESERVATIONS,
  INITIAL_PAYMENTS,
  INITIAL_INVOICES,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_STAFF_TASKS,
  INITIAL_EXPENSES,
  INITIAL_OWNER_SETTLEMENTS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
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
  | 'complete-followup';

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
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  // Primary state initialized with realistic mock dataset
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [unitTypes, setUnitTypes] = useState<UnitType[]>(INITIAL_UNIT_TYPES);
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(INITIAL_FOLLOW_UPS);
  const [callLogs, setCallLogs] = useState<CallLog[]>(INITIAL_CALL_LOGS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING_TASKS);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE_TICKETS);
  const [staffTasks, setStaffTasks] = useState<StaffTask[]>(INITIAL_STAFF_TASKS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [ownerSettlements, setOwnerSettlements] = useState<OwnerSettlement[]>(INITIAL_OWNER_SETTLEMENTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

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
    const availableUnit = units.find((u) => u.propertyId === quote.propertyId && u.status === 'Available') || units[0];

    const newBooking: Reservation = {
      id: `res-${Date.now()}`,
      bookingId: `OD-BKG-2026-00${Math.floor(995 + Math.random() * 100)}`,
      guestId: 'guest-1',
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
      createdAt: '2026-09-19',
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
        prev.map((l) => (l.id === quote.leadId ? { ...l, status: 'Confirmed', reservationId: newBooking.id } : l))
      );
    }

    addAuditLog(
      'Converted Quotation to Booking',
      'Reservations',
      newBooking.bookingId,
      `Converted quotation ${quote.quotationNumber} to booking ${newBooking.bookingId}`
    );

    showToast('Booking Created!', `Quotation converted to Booking ${newBooking.bookingId}`);
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
    showToast('Reservation created', `Booking ${newRes.bookingId} confirmed`);
    closeGlobalModal();
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
  };

  const recordPayment = (data: Partial<Payment>) => {
    const amount = data.amount || 0;
    const res = reservations.find((r) => r.id === data.reservationId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentId: `OD-PAY-2026-${Math.floor(330 + Math.random() * 70)}`,
      reservationId: data.reservationId || 'res-1',
      bookingId: res?.bookingId || data.bookingId || 'OD-BKG-2026-00982',
      guestName: res?.guestName || data.guestName || 'Guest',
      propertyId: res?.propertyId || data.propertyId || properties[0].id,
      propertyName: res?.propertyName || data.propertyName || properties[0].name,
      amount,
      method: data.method || 'UPI',
      date: '2026-09-19',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Success',
      referenceNumber: data.referenceNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      collectedBy: data.collectedBy || 'Reception Desk',
      ...data,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Update reservation balance if reservation linked
    if (res) {
      setReservations((prev) =>
        prev.map((r) => {
          if (r.id !== res.id) return r;
          const newPaid = r.paid + amount;
          const newBal = Math.max(0, r.total - newPaid);
          return {
            ...r,
            paid: newPaid,
            balance: newBal,
          };
        })
      );
    }

    addAuditLog('Recorded Payment', 'Finance', newPayment.paymentId, `Recorded ₹${amount} via ${newPayment.method} for ${newPayment.guestName}`);
    showToast('Payment recorded successfully', `Received ₹${amount.toLocaleString('en-IN')}`);
    closeGlobalModal();
  };

  const updateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, status } : u))
    );
    showToast('Unit status updated', `Room status changed to ${status}`);
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

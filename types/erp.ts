export type PropertyType =
  | 'Homestay'
  | 'Resort'
  | 'Beach Resort'
  | 'Resort / Stay'
  | 'Camp / Cottages'
  | 'Riverside Stay'
  | 'Villa'
  | 'Hotel'
  | 'Apartments';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  contact: string;
  totalUnits: number;
  occupancyRate: number;
  todayArrivals: number;
  todayDepartures: number;
  revenueThisMonth: number;
  status: 'Active' | 'Under Renovation' | 'Seasonal Pause';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  description: string;
  amenities: string[];
}

export interface UnitType {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  capacity: number;
  bedConfiguration: string;
  baseRate: number;
  numberOfUnits: number;
  amenities: string[];
  status: 'Active' | 'Inactive';
}

export type UnitStatus =
  | 'Available'
  | 'Occupied'
  | 'Dirty'
  | 'Cleaning'
  | 'Inspection'
  | 'Maintenance'
  | 'Blocked'
  | 'Out of Service';

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitTypeId: string;
  unitTypeName: string;
  number: string;
  name: string;
  floor: string;
  status: UnitStatus;
  currentReservationId?: string;
  currentGuestName?: string;
  currentCheckOut?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idProofNumber?: string;
  vip: boolean;
  totalStays: number;
  lastStayDate?: string;
  totalSpend: number;
  preferences: string[];
  status: 'Regular' | 'VIP' | 'Blacklisted' | 'First-time';
  createdAt: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Quotation Sent'
  | 'Follow-up'
  | 'Confirmed'
  | 'Not Interested'
  | 'No Response'
  | 'Lost';

export interface Lead {
  id: string;
  leadNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  estimatedValue: number;
  source: 'Phone Call' | 'WhatsApp' | 'Website' | 'Walk-in' | 'Referral' | 'Instagram';
  assignedTo: string;
  status: LeadStatus;
  nextFollowUpDate: string;
  notes: string;
  createdAt: string;
  quotationId?: string;
  reservationId?: string;
}

export type FollowUpType =
  | 'Phone Call'
  | 'WhatsApp'
  | 'Email'
  | 'SMS'
  | 'In Person'
  | 'Other';

export type FollowUpUrgency = 'Overdue' | 'Due Today' | 'Tomorrow' | 'This Week';

export interface FollowUp {
  id: string;
  leadId?: string;
  guestId?: string;
  guestName: string;
  guestPhone: string;
  propertyId: string;
  propertyName: string;
  type: FollowUpType;
  purpose: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTo: string;
  status: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled';
  urgency: FollowUpUrgency;
  notes: string;
  completedAt?: string;
  callOutcome?:
    | 'Interested'
    | 'Not Interested'
    | 'Call Later'
    | 'No Response'
    | 'Price Objection'
    | 'Dates Unavailable'
    | 'Booking Confirmed'
    | 'Other';
  callDuration?: string;
  nextAction?:
    | 'No further action'
    | 'Create next follow-up'
    | 'Send quotation'
    | 'Create booking';
}

export interface CallLog {
  id: string;
  leadId?: string;
  guestId?: string;
  guestName: string;
  date: string;
  time: string;
  direction: 'Inbound' | 'Outbound';
  duration: string;
  staff: string;
  outcome: string;
  notes: string;
}

export interface Communication {
  id: string;
  guestName: string;
  channel: 'Phone' | 'WhatsApp' | 'Quotation' | 'Booking' | 'Payment' | 'Email';
  title: string;
  detail: string;
  timestamp: string;
  staff: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  leadId?: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  propertyId: string;
  propertyName: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  roomCharge: number;
  extraGuestCharge: number;
  discount: number;
  tax: number;
  total: number;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired';
  createdAt: string;
  notes?: string;
}

export type ReservationStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Checked In'
  | 'In House'
  | 'Checked Out'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export type BookingSource =
  | 'Website'
  | 'Walk-in'
  | 'Phone'
  | 'WhatsApp'
  | 'Booking.com'
  | 'Agoda'
  | 'Airbnb'
  | 'MakeMyTrip'
  | 'Expedia'
  | 'Other';

export interface Reservation {
  id: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  unitTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestsCount: number;
  source: BookingSource;
  rate: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  quotationId?: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  reservationId: string;
  bookingId: string;
  guestName: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Payment Gateway' | 'Other';
  date: string;
  time: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded' | 'Partially Refunded';
  referenceNumber: string;
  collectedBy: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyGstin: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  items: InvoiceItem[];
}

export type HousekeepingTaskType =
  | 'Checkout Cleaning'
  | 'Regular Cleaning'
  | 'Deep Cleaning'
  | 'Linen Change'
  | 'Inspection';

export type HousekeepingStatus = 'Pending' | 'Cleaning' | 'Inspection' | 'Completed';

export interface HousekeepingTask {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  taskType: HousekeepingTaskType;
  assignedTo: string;
  scheduledTime: string;
  status: HousekeepingStatus;
  priority: 'Urgent' | 'High' | 'Normal';
  notes?: string;
  updatedAt: string;
}

export type MaintenancePriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type MaintenanceStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Parts'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  issue: string;
  description: string;
  priority: MaintenancePriority;
  assignedTo: string;
  status: MaintenanceStatus;
  createdAt: string;
  estimatedCost?: number;
  resolutionNotes?: string;
}

export interface StaffTask {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High';
  due: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  department: 'Reception' | 'Concierge' | 'Operations' | 'Accounts';
}

export type ExpenseCategory =
  | 'Electricity'
  | 'Water'
  | 'Internet'
  | 'Laundry'
  | 'Housekeeping'
  | 'Maintenance'
  | 'Supplies'
  | 'Staff'
  | 'Marketing'
  | 'OTA Commission'
  | 'Transportation'
  | 'Food'
  | 'Other';

export interface Expense {
  id: string;
  date: string;
  propertyId: string;
  propertyName: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Approved';
  paymentMode: string;
}

export interface SettlementLineItem {
  description: string;
  type: 'revenue' | 'deduction';
  amount: number;
}

export interface OwnerSettlement {
  id: string;
  settlementNumber: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  period: string;
  grossRevenue: number;
  taxes: number;
  otaCommission: number;
  otherDeductions: number;
  netRevenue: number;
  managementFeePct: number;
  managementFee: number;
  ownerShare: number;
  amountPaid: number;
  balance: number;
  status: 'Draft' | 'Approved' | 'Paid' | 'Partially Paid';
  items: SettlementLineItem[];
}

export type ReviewPlatform = 'Google' | 'Tripadvisor' | 'Booking.com' | 'Agoda' | 'Airbnb';

export interface Review {
  id: string;
  guestName: string;
  propertyId: string;
  propertyName: string;
  platform: ReviewPlatform;
  rating: number;
  date: string;
  comment: string;
  responseStatus: 'Responded' | 'Pending';
  responseText?: string;
  responseDate?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: string;
  action: string;
  module: string;
  recordId: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'followup' | 'payment' | 'housekeeping' | 'maintenance' | 'system';
  time: string;
  read: boolean;
  link?: string;
}

// -----------------------------------------------------------------------------
// OTA CHANNEL MANAGER & SYNC SIMULATOR
// -----------------------------------------------------------------------------

export type OTAChannel = 'Airbnb' | 'Booking.com' | 'Agoda' | 'MakeMyTrip';

export type ChannelSyncStatus = 'Connected' | 'Syncing' | 'Error' | 'Paused';

export interface ChannelConnection {
  id: string;
  channel: OTAChannel;
  propertyId: string;
  propertyName: string;
  status: ChannelSyncStatus;
  syncMode: 'Two-Way (API)' | 'iCal Only';
  lastSyncAt: string;
  commissionRate: number; // percentage, e.g. 15 for 15%
  rateMarkupPercentage: number; // percentage, e.g. 10 for +10%
  minStay: number;
  autoStopSell: boolean;
  activeListingsCount: number;
  iCalExportUrl: string;
  iCalImportUrl?: string;
  accountEmail?: string;
}

export type ChannelSyncEventType =
  | 'INVENTORY_BLOCK'
  | 'INVENTORY_RELEASE'
  | 'RATE_PUSH'
  | 'INCOMING_BOOKING'
  | 'BOOKING_CANCELLED'
  | 'STOP_SELL';

export interface ChannelSyncEvent {
  id: string;
  timestamp: string;
  channel: OTAChannel;
  propertyName: string;
  eventType: ChannelSyncEventType;
  status: 'Success' | 'Pending' | 'Failed';
  bookingReference?: string;
  details: string;
  payloadJson?: string;
  latencyMs?: number;
}

export interface ChannelRateRule {
  id: string;
  propertyId: string;
  propertyName: string;
  unitTypeId: string;
  unitTypeName: string;
  baseRate: number;
  rates: Record<OTAChannel, {
    markupPercentage: number;
    channelRate: number;
    commissionRate: number;
    netPayout: number;
  }>;
}

export type StaffRole =
  | 'ADMIN'
  | 'PROPERTY_MANAGER'
  | 'FRONT_DESK'
  | 'OPERATIONS'
  | 'ACCOUNTANT';

export interface ERPUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  department?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  propertyIds: string[];
  createdAt?: string;
  updatedAt?: string;
}


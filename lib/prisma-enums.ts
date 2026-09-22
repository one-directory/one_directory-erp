import { PropertyType, PropertyStatus, UnitStatus, ReservationStatus, BookingSource } from '@prisma/client';

export function toPrismaPropertyType(type?: string): PropertyType {
  if (!type) return 'Hotel';
  const map: Record<string, PropertyType> = {
    Homestay: 'Homestay',
    Resort: 'Resort',
    'Beach Resort': 'Beach_Resort',
    Beach_Resort: 'Beach_Resort',
    'Resort / Stay': 'Resort_Stay',
    Resort_Stay: 'Resort_Stay',
    'Camp / Cottages': 'Camp_Cottages',
    Camp_Cottages: 'Camp_Cottages',
    'Riverside Stay': 'Riverside_Stay',
    Riverside_Stay: 'Riverside_Stay',
    Villa: 'Villa',
    Hotel: 'Hotel',
    Apartments: 'Apartments',
  };
  return map[type] || 'Hotel';
}

export function toPrismaPropertyStatus(status?: string): PropertyStatus {
  if (!status) return 'Active';
  const map: Record<string, PropertyStatus> = {
    Active: 'Active',
    'Under Renovation': 'Under_Renovation',
    Under_Renovation: 'Under_Renovation',
    'Seasonal Pause': 'Seasonal_Pause',
    Seasonal_Pause: 'Seasonal_Pause',
  };
  return map[status] || 'Active';
}

export function toPrismaUnitStatus(status?: string): UnitStatus {
  if (!status) return 'Available';
  const map: Record<string, UnitStatus> = {
    Available: 'Available',
    Occupied: 'Occupied',
    Dirty: 'Dirty',
    Cleaning: 'Cleaning',
    Inspection: 'Inspection',
    Maintenance: 'Maintenance',
    Blocked: 'Blocked',
    'Out of Service': 'Out_of_Service',
    Out_of_Service: 'Out_of_Service',
  };
  return map[status] || 'Available';
}

export function toPrismaReservationStatus(status?: string): ReservationStatus {
  if (!status) return 'Confirmed';
  const map: Record<string, ReservationStatus> = {
    Pending: 'Pending',
    Confirmed: 'Confirmed',
    'Checked In': 'Checked_In',
    Checked_In: 'Checked_In',
    'In House': 'In_House',
    In_House: 'In_House',
    'Checked Out': 'Checked_Out',
    Checked_Out: 'Checked_Out',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
    'No Show': 'No_Show',
    No_Show: 'No_Show',
  };
  return map[status] || 'Confirmed';
}

export function toPrismaBookingSource(source?: string): BookingSource {
  if (!source) return 'Website';
  const map: Record<string, BookingSource> = {
    Website: 'Website',
    'Walk-in': 'Walk_in',
    Walk_in: 'Walk_in',
    Phone: 'Phone',
    WhatsApp: 'WhatsApp',
    'Booking.com': 'Booking_com',
    Booking_com: 'Booking_com',
    Agoda: 'Agoda',
    Airbnb: 'Airbnb',
    MakeMyTrip: 'MakeMyTrip',
    Expedia: 'Expedia',
    Other: 'Other',
  };
  return map[source] || 'Website';
}


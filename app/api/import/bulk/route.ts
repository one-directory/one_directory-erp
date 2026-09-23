import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toPrismaPropertyType, toPrismaPropertyStatus, toPrismaUnitStatus, toPrismaReservationStatus, toPrismaBookingSource } from '@/lib/prisma-enums';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, entity, items } = body;

    // ── 1. Action: 1-Click Seed Demo Portfolio ───────────────────────────────
    if (action === 'seed-demo') {
      // Clear existing records in logical order
      await prisma.payment.deleteMany();
      await prisma.invoice.deleteMany();
      await prisma.reservation.deleteMany();
      await prisma.housekeepingTask.deleteMany();
      await prisma.maintenanceTicket.deleteMany();
      await prisma.unit.deleteMany();
      await prisma.unitType.deleteMany();
      await prisma.property.deleteMany();
      await prisma.guest.deleteMany();

      // Create Properties
      const p1 = await prisma.property.create({
        data: {
          id: 'prop-heritage',
          name: 'The Heritage Haveli & Courtyard',
          type: 'Resort',
          location: 'Old City, Udaipur, Rajasthan',
          contact: '+91 294 242 8899',
          totalUnits: 8,
          status: 'Active',
          ownerName: 'Mahaveer Singh Mewar',
          ownerEmail: 'mahaveer@heritagehaveli.in',
          ownerPhone: '+91 98290 11223',
          description: 'A 200-year-old restored Rajput haveli with central courtyard fountains, hand-painted frescoes, and rooftop lake views.',
          amenities: ['WiFi', 'Swimming Pool', 'AC', 'Restaurant', 'Spa', 'Room Service'],
        },
      });

      const p2 = await prisma.property.create({
        data: {
          id: 'prop-goa-azure',
          name: 'Azure Cove Beachfront Villas',
          type: 'Beach_Resort',
          location: 'Ashwem Beach, North Goa',
          contact: '+91 832 295 4400',
          totalUnits: 6,
          status: 'Active',
          ownerName: 'Clarissa Fernandez',
          ownerEmail: 'clarissa@azurecovegoa.com',
          ownerPhone: '+91 98221 44556',
          description: 'Eco-luxury private beachfront villas nestled under coconut palms, footsteps away from pristine white sands.',
          amenities: ['WiFi', 'Swimming Pool', 'AC', 'Bar', 'Pet Friendly', 'Sea View', 'Airport Transfer'],
        },
      });

      const p3 = await prisma.property.create({
        data: {
          id: 'prop-pines-retreat',
          name: 'Whispering Pines Riverside Retreat',
          type: 'Riverside_Stay',
          location: 'Naggar Road, Manali, Himachal Pradesh',
          contact: '+91 1902 251 122',
          totalUnits: 6,
          status: 'Active',
          ownerName: 'Vikram Thakur',
          ownerEmail: 'vikram@whisperingpines.in',
          ownerPhone: '+91 94180 33445',
          description: 'Deodar wooden chalets beside the Beas river tributary with snowcapped mountain views and apple orchards.',
          amenities: ['WiFi', 'AC', 'Bonfire Area', 'Trekking', 'Restaurant', 'Mountain View'],
        },
      });

      // Create Unit Types & Units for Udaipur
      const utHeritageDeluxe = await prisma.unitType.create({
        data: {
          propertyId: p1.id,
          propertyName: p1.name,
          name: 'Deluxe Courtyard Suite',
          capacity: 2,
          bedConfiguration: '1 King Bed',
          baseRate: 6500,
          numberOfUnits: 4,
          amenities: ['Courtyard View', 'Heritage Jharokha', 'Bathtub', 'Smart TV'],
        },
      });

      const utHeritageRoyal = await prisma.unitType.create({
        data: {
          propertyId: p1.id,
          propertyName: p1.name,
          name: 'Royal Lakeview Suite',
          capacity: 3,
          bedConfiguration: '1 King Bed + 1 Diwan',
          baseRate: 9800,
          numberOfUnits: 4,
          amenities: ['Lake View', 'Private Balcony', 'Butler Service', 'Jacuzzi'],
        },
      });

      const unitsP1 = [
        { num: '101', name: 'Courtyard Suite 101', type: utHeritageDeluxe, floor: 'Ground' },
        { num: '102', name: 'Courtyard Suite 102', type: utHeritageDeluxe, floor: 'Ground' },
        { num: '103', name: 'Courtyard Suite 103', type: utHeritageDeluxe, floor: '1st Floor' },
        { num: '104', name: 'Courtyard Suite 104', type: utHeritageDeluxe, floor: '1st Floor' },
        { num: '201', name: 'Royal Lakeview 201', type: utHeritageRoyal, floor: '2nd Floor' },
        { num: '202', name: 'Royal Lakeview 202', type: utHeritageRoyal, floor: '2nd Floor' },
        { num: '203', name: 'Royal Lakeview 203', type: utHeritageRoyal, floor: '2nd Floor' },
        { num: '204', name: 'Royal Lakeview 204', type: utHeritageRoyal, floor: 'Rooftop' },
      ];

      const createdUnitsP1 = [];
      for (const u of unitsP1) {
        const created = await prisma.unit.create({
          data: {
            propertyId: p1.id,
            propertyName: p1.name,
            unitTypeId: u.type.id,
            unitTypeName: u.type.name,
            number: u.num,
            name: u.name,
            floor: u.floor,
            status: 'Available',
          },
        });
        createdUnitsP1.push(created);
      }

      // Create Unit Types & Units for Goa
      const utGoaVilla = await prisma.unitType.create({
        data: {
          propertyId: p2.id,
          propertyName: p2.name,
          name: 'Private Plunge Pool Villa',
          capacity: 4,
          bedConfiguration: '2 King Beds',
          baseRate: 14500,
          numberOfUnits: 6,
          amenities: ['Private Pool', 'Outdoor Deck', 'Kitchenette', 'Beach Access'],
        },
      });

      const createdUnitsP2 = [];
      for (let i = 1; i <= 6; i++) {
        const created = await prisma.unit.create({
          data: {
            propertyId: p2.id,
            propertyName: p2.name,
            unitTypeId: utGoaVilla.id,
            unitTypeName: utGoaVilla.name,
            number: `V-${i}`,
            name: `Azure Villa ${i}`,
            floor: 'Ground',
            status: 'Available',
          },
        });
        createdUnitsP2.push(created);
      }

      // Create Guests
      const g1 = await prisma.guest.create({
        data: {
          name: 'Aakash Verma',
          phone: '+91 98190 23456',
          email: 'aakash.verma@techcorp.in',
          vip: true,
          totalStays: 4,
          totalSpend: 78000,
          status: 'VIP',
          preferences: ['High Floor', 'Late Check-out', 'Black Coffee'],
        },
      });

      const g2 = await prisma.guest.create({
        data: {
          name: 'Dr. Priya Nambiar',
          phone: '+91 94471 88990',
          email: 'priya.nambiar@aiims.edu',
          vip: false,
          totalStays: 2,
          totalSpend: 32000,
          status: 'Regular',
          preferences: ['Quiet Room', 'Extra Pillows'],
        },
      });

      const g3 = await prisma.guest.create({
        data: {
          name: 'David & Sarah Jenkins',
          phone: '+44 7911 123456',
          email: 'david.jenkins@londonconsulting.co.uk',
          vip: true,
          totalStays: 1,
          totalSpend: 58000,
          status: 'VIP',
          preferences: ['Vegetarian Meals', 'Airport Pickup'],
        },
      });

      // Create Active Reservations
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

      // Reservation 1: Checked In at Udaipur
      const res1 = await prisma.reservation.create({
        data: {
          bookingId: 'RES-UDR-1001',
          guestId: g1.id,
          guestName: g1.name,
          guestPhone: g1.phone,
          guestEmail: g1.email,
          propertyId: p1.id,
          propertyName: p1.name,
          unitId: createdUnitsP1[0].id,
          unitNumber: createdUnitsP1[0].number,
          unitTypeName: createdUnitsP1[0].unitTypeName,
          checkIn: today,
          checkOut: tomorrow,
          nights: 1,
          guestsCount: 2,
          source: 'Website',
          rate: 6500,
          discount: 500,
          tax: 720,
          total: 6720,
          paid: 6720,
          balance: 0,
          status: 'In_House',
          specialRequests: 'Anniversary celebration. Complimentary cake requested.',
        },
      });

      await prisma.unit.update({
        where: { id: createdUnitsP1[0].id },
        data: {
          status: 'Occupied',
          currentReservationId: res1.id,
          currentGuestName: res1.guestName,
          currentCheckOut: res1.checkOut,
        },
      });

      // Payment for Res 1
      await prisma.payment.create({
        data: {
          paymentId: 'PAY-UDR-001',
          reservationId: res1.id,
          bookingId: res1.bookingId,
          guestName: res1.guestName,
          propertyId: p1.id,
          propertyName: p1.name,
          amount: 6720,
          method: 'UPI',
          date: today,
          time: '11:30 AM',
          status: 'Success',
          referenceNumber: 'UPI/2026/89341029',
          collectedBy: 'Front Desk',
        },
      });

      // Reservation 2: Confirmed at Goa Azure
      const res2 = await prisma.reservation.create({
        data: {
          bookingId: 'RES-GOA-2002',
          guestId: g3.id,
          guestName: g3.name,
          guestPhone: g3.phone,
          guestEmail: g3.email,
          propertyId: p2.id,
          propertyName: p2.name,
          unitId: createdUnitsP2[0].id,
          unitNumber: createdUnitsP2[0].number,
          unitTypeName: createdUnitsP2[0].unitTypeName,
          checkIn: tomorrow,
          checkOut: nextWeek,
          nights: 4,
          guestsCount: 2,
          source: 'Airbnb',
          rate: 14500 * 4,
          discount: 2000,
          tax: 6720,
          total: 62720,
          paid: 62720,
          balance: 0,
          status: 'Confirmed',
          specialRequests: 'Airport transfer required from Mopa Airport at 3:00 PM.',
        },
      });

      // Payment for Res 2
      await prisma.payment.create({
        data: {
          paymentId: 'PAY-GOA-002',
          reservationId: res2.id,
          bookingId: res2.bookingId,
          guestName: res2.guestName,
          propertyId: p2.id,
          propertyName: p2.name,
          amount: 62720,
          method: 'Credit_Card',
          date: today,
          time: '02:15 PM',
          status: 'Success',
          referenceNumber: 'TXN-ABNB-998811',
          collectedBy: 'Airbnb Payout',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Successfully seeded authentic boutique hospitality demo portfolio with properties, luxury units, guests, reservations, and payment receipts!',
        stats: {
          properties: 3,
          units: 14,
          guests: 3,
          reservations: 2,
          payments: 2,
        },
      });
    }

    // ── 2. Action: Reset Database ────────────────────────────────────────────
    if (action === 'reset-db') {
      await prisma.payment.deleteMany();
      await prisma.invoice.deleteMany();
      await prisma.reservation.deleteMany();
      await prisma.housekeepingTask.deleteMany();
      await prisma.maintenanceTicket.deleteMany();
      await prisma.unit.deleteMany();
      await prisma.unitType.deleteMany();
      await prisma.property.deleteMany();
      await prisma.guest.deleteMany();

      return NextResponse.json({
        success: true,
        message: 'Database reset successfully. All entity tables are now clean and ready for real data import.',
      });
    }

    // ── 3. Action: Bulk Entity Import ────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided for import. Expected an array of records in items.' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let createdCount = 0;
    let updatedCount = 0;

    switch (entity) {
      // ── A. Import Properties ───────────────────────────────────────────────
      case 'properties': {
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          if (!row.name || !row.location) {
            errors.push(`Row ${i + 1}: Missing required fields "name" and "location".`);
            continue;
          }

          const propType = toPrismaPropertyType(row.type);
          const propStatus = toPrismaPropertyStatus(row.status);
          const amenities = Array.isArray(row.amenities)
            ? row.amenities
            : typeof row.amenities === 'string'
            ? row.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
            : [];

          await prisma.property.create({
            data: {
              id: row.id || undefined,
              name: String(row.name).trim(),
              type: propType,
              location: String(row.location).trim(),
              contact: String(row.contact || ''),
              totalUnits: Number(row.totalUnits) || 1,
              status: propStatus,
              ownerName: String(row.ownerName || 'Property Owner'),
              ownerEmail: String(row.ownerEmail || 'owner@onedirectory.com'),
              ownerPhone: String(row.ownerPhone || ''),
              description: String(row.description || ''),
              amenities,
            },
          });
          createdCount++;
        }
        break;
      }

      // ── B. Import Units ────────────────────────────────────────────────────
      case 'units': {
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          if (!row.number) {
            errors.push(`Row ${i + 1}: Missing required unit number.`);
            continue;
          }

          // Resolve Property
          let property = null;
          if (row.propertyId) {
            property = await prisma.property.findUnique({ where: { id: row.propertyId } });
          }
          if (!property && row.propertyName) {
            property = await prisma.property.findFirst({
              where: { name: { contains: row.propertyName, mode: 'insensitive' } },
            });
          }
          if (!property) {
            property = await prisma.property.findFirst();
          }

          if (!property) {
            errors.push(`Row ${i + 1}: Cannot import unit without an existing property. Please import properties first.`);
            continue;
          }

          // Resolve or create UnitType
          const unitTypeName = row.unitTypeName || row.type || 'Standard Room';
          let unitType = await prisma.unitType.findFirst({
            where: { propertyId: property.id, name: unitTypeName },
          });

          if (!unitType) {
            unitType = await prisma.unitType.create({
              data: {
                propertyId: property.id,
                propertyName: property.name,
                name: unitTypeName,
                capacity: Number(row.capacity) || 2,
                bedConfiguration: row.bedConfiguration || '1 Double Bed',
                baseRate: Number(row.baseRate) || 4500,
                numberOfUnits: 1,
              },
            });
          }

          const unitStatus = toPrismaUnitStatus(row.status);

          await prisma.unit.create({
            data: {
              propertyId: property.id,
              propertyName: property.name,
              unitTypeId: unitType.id,
              unitTypeName: unitType.name,
              number: String(row.number).trim(),
              name: row.name || `${unitType.name} ${row.number}`,
              floor: String(row.floor || '1'),
              status: unitStatus,
            },
          });
          createdCount++;
        }
        break;
      }

      // ── C. Import Guests ───────────────────────────────────────────────────
      case 'guests': {
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          if (!row.name || !row.phone) {
            errors.push(`Row ${i + 1}: Missing required guest name or phone.`);
            continue;
          }

          const existing = await prisma.guest.findFirst({
            where: {
              OR: [
                { phone: String(row.phone).trim() },
                ...(row.email ? [{ email: String(row.email).trim() }] : []),
              ],
            },
          });

          if (existing) {
            await prisma.guest.update({
              where: { id: existing.id },
              data: {
                name: String(row.name).trim(),
                email: row.email ? String(row.email).trim() : existing.email,
                vip: row.vip === true || row.vip === 'true',
                status: row.status === 'VIP' ? 'VIP' : 'Regular',
                idProofNumber: row.idProofNumber || existing.idProofNumber,
              },
            });
            updatedCount++;
          } else {
            await prisma.guest.create({
              data: {
                name: String(row.name).trim(),
                phone: String(row.phone).trim(),
                email: String(row.email || `${String(row.name).toLowerCase().replace(/\s+/g, '.')}@example.com`),
                vip: row.vip === true || row.vip === 'true',
                totalStays: Number(row.totalStays) || 0,
                totalSpend: Number(row.totalSpend) || 0,
                idProofNumber: row.idProofNumber || undefined,
                status: row.status === 'VIP' ? 'VIP' : 'Regular',
              },
            });
            createdCount++;
          }
        }
        break;
      }

      // ── D. Import Reservations ─────────────────────────────────────────────
      case 'reservations': {
        for (let i = 0; i < items.length; i++) {
          const row = items[i];
          if (!row.guestName || !row.checkIn || !row.checkOut) {
            errors.push(`Row ${i + 1}: Missing required guestName, checkIn, or checkOut.`);
            continue;
          }

          // Guest resolution
          let guest = await prisma.guest.findFirst({
            where: {
              OR: [
                { phone: String(row.guestPhone || '') },
                ...(row.guestEmail ? [{ email: String(row.guestEmail) }] : []),
              ],
            },
          });

          if (!guest) {
            guest = await prisma.guest.create({
              data: {
                name: String(row.guestName).trim(),
                phone: String(row.guestPhone || '+91 98000 00000'),
                email: String(row.guestEmail || 'guest@example.com'),
                status: 'Regular',
              },
            });
          }

          // Property resolution
          let property = null;
          if (row.propertyId) {
            property = await prisma.property.findUnique({ where: { id: row.propertyId } });
          }
          if (!property && row.propertyName) {
            property = await prisma.property.findFirst({
              where: { name: { contains: row.propertyName, mode: 'insensitive' } },
            });
          }
          if (!property) {
            property = await prisma.property.findFirst();
          }

          if (!property) {
            errors.push(`Row ${i + 1}: No property found to link reservation.`);
            continue;
          }

          // Unit resolution
          let unit = null;
          if (row.unitNumber) {
            unit = await prisma.unit.findFirst({
              where: { propertyId: property.id, number: String(row.unitNumber) },
            });
          }
          if (!unit) {
            unit = await prisma.unit.findFirst({ where: { propertyId: property.id } });
          }

          if (!unit) {
            errors.push(`Row ${i + 1}: No units available in property ${property.name}.`);
            continue;
          }

          const bookingId = row.bookingId || `OD-${Math.floor(100000 + Math.random() * 900000)}`;
          const source = toPrismaBookingSource(row.source);
          const status = toPrismaReservationStatus(row.status);
          const nights = Number(row.nights) || 1;
          const rate = Number(row.rate) || 5000;
          const tax = Number(row.tax) || Math.round(rate * 0.12);
          const total = Number(row.total) || rate + tax;
          const paid = Number(row.paid) || 0;
          const balance = total - paid;

          await prisma.reservation.create({
            data: {
              bookingId,
              guestId: guest.id,
              guestName: guest.name,
              guestPhone: guest.phone,
              guestEmail: guest.email,
              propertyId: property.id,
              propertyName: property.name,
              unitId: unit.id,
              unitNumber: unit.number,
              unitTypeName: unit.unitTypeName,
              checkIn: String(row.checkIn),
              checkOut: String(row.checkOut),
              nights,
              guestsCount: Number(row.guestsCount) || 2,
              source,
              rate,
              discount: Number(row.discount) || 0,
              tax,
              total,
              paid,
              balance,
              status,
              specialRequests: row.specialRequests || undefined,
            },
          });
          createdCount++;
        }
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Invalid entity type "${entity}". Supported: properties, units, guests, reservations.` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed for ${entity}. Created ${createdCount}, updated ${updatedCount}.`,
      count: createdCount + updatedCount,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[bulk import POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk import failed', details: error?.message },
      { status: 500 }
    );
  }
}

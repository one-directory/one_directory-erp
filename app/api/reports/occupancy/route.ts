import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/occupancy
// Occupancy stats: overall + per-property + date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const propertyFilter = propertyId && propertyId !== 'all' ? { propertyId } : {};

    // Total units
    const [totalUnits, occupiedUnits, cleaningUnits, maintenanceUnits] = await Promise.all([
      prisma.unit.count({ where: propertyFilter }),
      prisma.unit.count({ where: { ...propertyFilter, status: 'Occupied' } }),
      prisma.unit.count({ where: { ...propertyFilter, status: 'Cleaning' } }),
      prisma.unit.count({ where: { ...propertyFilter, status: { in: ['Maintenance', 'Out_of_Service'] } } }),
    ]);

    const vacantUnits = totalUnits - occupiedUnits - cleaningUnits - maintenanceUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    // Monthly occupancy from reservations
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const daysInMonth = new Date(year, i + 1, 0).getDate();
      const end = `${year}-${month}-${String(daysInMonth).padStart(2, '00')}`;
      const label = new Date(year, i, 1).toLocaleString('en-IN', { month: 'short' });
      return { month: i + 1, label, start, end, days: daysInMonth };
    });

    const monthlyOccupancy = await Promise.all(
      months.map(async (m) => {
        const count = await prisma.reservation.count({
          where: {
            ...propertyFilter,
            status: { in: ['Confirmed', 'Checked_In', 'Checked_Out'] },
            OR: [
              { checkIn: { gte: m.start, lte: m.end } },
              { checkOut: { gte: m.start, lte: m.end } },
            ],
          },
        });
        return { month: m.label, reservations: count };
      })
    );

    // Property-level occupancy breakdown
    const properties = await prisma.property.findMany({
      select: { id: true, name: true },
      ...(propertyId ? { where: { id: propertyId } } : {}),
    });

    const propertyOccupancy = await Promise.all(
      properties.map(async (p) => {
        const [total, occupied] = await Promise.all([
          prisma.unit.count({ where: { propertyId: p.id } }),
          prisma.unit.count({ where: { propertyId: p.id, status: 'Occupied' } }),
        ]);
        return {
          propertyId: p.id,
          propertyName: p.name,
          totalUnits: total,
          occupiedUnits: occupied,
          occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        year,
        summary: {
          totalUnits,
          occupiedUnits,
          vacantUnits,
          cleaningUnits,
          maintenanceUnits,
          occupancyRate,
        },
        monthly: monthlyOccupancy,
        byProperty: propertyOccupancy,
      },
    });
  } catch (error: any) {
    console.error('Error fetching occupancy report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch occupancy report', details: error?.message },
      { status: 500 }
    );
  }
}

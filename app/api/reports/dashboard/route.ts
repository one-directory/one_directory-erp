import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/dashboard
// Returns aggregated KPIs for the ERP dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const propertyFilter = propertyId && propertyId !== 'all' ? { propertyId } : {};

    // Fetch counts in parallel
    const [
      totalProperties,
      totalUnits,
      occupiedUnits,
      totalGuests,
      activeReservations,
      todayCheckIns,
      todayCheckOuts,
      pendingLeads,
      openTasks,
      openMaintenance,
      pendingInvoices,
      pendingReviews,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.unit.count({ where: propertyFilter }),
      prisma.unit.count({ where: { ...propertyFilter, status: 'Occupied' } }),
      prisma.guest.count(),
      prisma.reservation.count({
        where: { ...propertyFilter, status: { in: ['Confirmed', 'Checked_In'] } },
      }),
      prisma.reservation.count({
        where: {
          ...propertyFilter,
          checkIn: new Date().toISOString().split('T')[0],
          status: 'Confirmed',
        },
      }),
      prisma.reservation.count({
        where: {
          ...propertyFilter,
          checkOut: new Date().toISOString().split('T')[0],
          status: 'Checked_In',
        },
      }),
      prisma.lead.count({ where: { status: { in: ['New', 'Contacted', 'Interested'] } } }),
      prisma.staffTask.count({
        where: { ...propertyFilter, status: { in: ['Pending', 'In_Progress'] } },
      }),
      prisma.maintenanceTicket.count({
        where: { ...propertyFilter, status: { in: ['Open', 'Assigned', 'In_Progress'] } },
      }),
      prisma.invoice.count({
        where: { ...propertyFilter, status: { in: ['Unpaid', 'Overdue'] } },
      }),
      prisma.review.count({
        where: { ...propertyFilter, responseStatus: 'Pending' },
      }),
    ]);

    // Revenue this month (PaymentStatus.Success)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const revenueResult = await prisma.payment.aggregate({
      where: {
        ...propertyFilter,
        status: 'Success',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const occupancyRate =
      totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalProperties,
          totalUnits,
          occupiedUnits,
          vacantUnits: totalUnits - occupiedUnits,
          occupancyRate,
          totalGuests,
          activeReservations,
          todayCheckIns,
          todayCheckOuts,
          pendingLeads,
          openTasks,
          openMaintenance,
          pendingInvoices,
          pendingReviews,
          revenueThisMonth: revenueResult._sum.amount || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard report', details: error?.message },
      { status: 500 }
    );
  }
}

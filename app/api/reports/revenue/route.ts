import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reports/revenue
// Monthly revenue breakdown with channel & property split
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const propertyFilter = propertyId && propertyId !== 'all' ? { propertyId } : {};

    // Build month range for the given year
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const daysInMonth = new Date(year, i + 1, 0).getDate();
      const end = `${year}-${month}-${String(daysInMonth).padStart(2, '0')}`;
      const label = new Date(year, i, 1).toLocaleString('en-IN', { month: 'short' });
      return { month: i + 1, label, start, end };
    });

    // Fetch monthly payment aggregates in parallel
    const monthlyData = await Promise.all(
      months.map(async (m) => {
        const result = await prisma.payment.aggregate({
          where: {
            ...propertyFilter,
            status: 'Success',          // PaymentStatus.Success matches schema
            date: { gte: m.start, lte: m.end },
          },
          _sum: { amount: true },
          _count: true,
        });
        return {
          month: m.label,
          revenue: result._sum.amount || 0,
          payments: result._count,
        };
      })
    );

    // Channel breakdown (by `source` field from reservations)
    const channelBreakdown = await prisma.reservation.groupBy({
      by: ['source'],
      where: {
        ...propertyFilter,
        status: { in: ['Confirmed', 'Checked_In', 'Checked_Out'] },
      },
      _count: true,
    });

    // Property revenue breakdown
    const propertyRevenue = await prisma.payment.groupBy({
      by: ['propertyId'],
      where: {
        status: 'Success',
        date: { gte: `${year}-01-01`, lte: `${year}-12-31` },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Map property names
    const properties = await prisma.property.findMany({
      select: { id: true, name: true },
    });
    const propMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));

    return NextResponse.json({
      success: true,
      data: {
        year,
        monthly: monthlyData,
        channelBreakdown: channelBreakdown.map((c) => ({
          channel: c.source,
          count: c._count,
        })),
        propertyRevenue: propertyRevenue.map((p) => ({
          propertyId: p.propertyId,
          propertyName: propMap[p.propertyId] || p.propertyId,
          revenue: p._sum.amount || 0,
          count: p._count,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching revenue report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue report', details: error?.message },
      { status: 500 }
    );
  }
}

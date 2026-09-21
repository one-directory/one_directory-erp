import { NextRequest, NextResponse } from 'next/server';
import { OTAChannel } from '@/types/erp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const propertyId = body.propertyId || 'all';

    const channels: OTAChannel[] = ['Airbnb', 'Booking.com', 'Agoda', 'MakeMyTrip'];

    const syncReceipts = channels.map((channel) => {
      const inventoryUnitsUpdated = Math.floor(12 + Math.random() * 8);
      const ratesUpdated = Math.floor(4 + Math.random() * 4);
      const latencyMs = Math.floor(110 + Math.random() * 180);

      return {
        channel,
        status: 'SUCCESS',
        latencyMs,
        inventoryUnitsUpdated,
        ratesUpdated,
        stopSellActiveDates: 6,
        lastSyncTimestamp: new Date().toISOString(),
        receiptId: `sync-${channel.toLowerCase().replace(/[^a-z]/g, '')}-${Date.now()}`,
        endpoint: channel === 'Airbnb' ? 'https://api.airbnb.com/v2/calendars/push'
          : channel === 'Booking.com' ? 'https://supply-xml.booking.com/hotels/xml/availability'
          : channel === 'Agoda' ? 'https://ycs.agoda.com/api/v2/rates/push'
          : 'https://ingo.makemytrip.com/api/extranet/inventory/update',
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Global two-way synchronization executed across all 4 OTAs.',
      timestamp: new Date().toISOString(),
      propertyId,
      receipts: syncReceipts,
    });
  } catch (error) {
    console.error('[simulate-sync POST] Error:', error);
    return NextResponse.json({ error: 'Failed to execute global sync.' }, { status: 500 });
  }
}

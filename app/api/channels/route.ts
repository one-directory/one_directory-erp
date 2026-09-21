import { NextRequest, NextResponse } from 'next/server';
import { OTAChannel, ChannelConnection, ChannelSyncStatus } from '@/types/erp';

// Default mock channel connections for the properties
const defaultChannels: ChannelConnection[] = [
  {
    id: 'chan-airbnb-1',
    channel: 'Airbnb',
    propertyId: 'prop-1',
    propertyName: 'Heritage Haveli & Courtyard Suites',
    status: 'Connected',
    syncMode: 'Two-Way (API)',
    lastSyncAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    commissionRate: 15.0, // 15% host-only fee
    rateMarkupPercentage: 10.0, // +10% markup to absorb commission
    minStay: 2,
    autoStopSell: true,
    activeListingsCount: 14,
    iCalExportUrl: '/api/channels/ical?channel=Airbnb&propertyId=prop-1',
    iCalImportUrl: 'https://www.airbnb.com/calendar/ical/984214819.ics?s=d0f9128',
    accountEmail: 'host.heritagehaveli@onedirectory.com',
  },
  {
    id: 'chan-bdc-1',
    channel: 'Booking.com',
    propertyId: 'prop-1',
    propertyName: 'Heritage Haveli & Courtyard Suites',
    status: 'Connected',
    syncMode: 'Two-Way (API)',
    lastSyncAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    commissionRate: 18.0, // 18% standard hotel commission
    rateMarkupPercentage: 15.0, // +15% markup
    minStay: 1,
    autoStopSell: true,
    activeListingsCount: 14,
    iCalExportUrl: '/api/channels/ical?channel=Booking.com&propertyId=prop-1',
    iCalImportUrl: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=48192a09',
    accountEmail: 'reservations@heritagehaveli.com',
  },
  {
    id: 'chan-agoda-1',
    channel: 'Agoda',
    propertyId: 'prop-1',
    propertyName: 'Heritage Haveli & Courtyard Suites',
    status: 'Connected',
    syncMode: 'Two-Way (API)',
    lastSyncAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    commissionRate: 17.0, // 17% YCS commission
    rateMarkupPercentage: 12.0, // +12% markup
    minStay: 1,
    autoStopSell: true,
    activeListingsCount: 12,
    iCalExportUrl: '/api/channels/ical?channel=Agoda&propertyId=prop-1',
    iCalImportUrl: 'https://ycs.agoda.com/api/v2/calendar/feed/ical/7482910.ics',
    accountEmail: 'ycs.partners@heritagehaveli.com',
  },
  {
    id: 'chan-mmt-1',
    channel: 'MakeMyTrip',
    propertyId: 'prop-1',
    propertyName: 'Heritage Haveli & Courtyard Suites',
    status: 'Connected',
    syncMode: 'Two-Way (API)',
    lastSyncAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    commissionRate: 20.0, // 20% domestic OTA commission
    rateMarkupPercentage: 14.0, // +14% markup
    minStay: 1,
    autoStopSell: true,
    activeListingsCount: 14,
    iCalExportUrl: '/api/channels/ical?channel=MakeMyTrip&propertyId=prop-1',
    iCalImportUrl: 'https://ingo.makemytrip.com/extranet/ical/feed/IN-491029.ics',
    accountEmail: 'ingo.heritagehaveli@onedirectory.com',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const filtered = propertyId && propertyId !== 'all'
      ? defaultChannels.filter((c) => c.propertyId === propertyId)
      : defaultChannels;

    const summary = {
      totalConnected: defaultChannels.filter((c) => c.status === 'Connected').length,
      channelsCount: 4,
      lastGlobalSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      inventoryParity: '100% In Sync',
      totalActiveListings: defaultChannels.reduce((sum, c) => sum + c.activeListingsCount, 0),
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      summary,
    });
  } catch (error) {
    console.error('[channels GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch channel connections.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channelId, status, rateMarkupPercentage, commissionRate, minStay, autoStopSell } = body;

    const channel = defaultChannels.find((c) => c.id === channelId);
    if (!channel) {
      return NextResponse.json({ error: 'Channel connection not found.' }, { status: 404 });
    }

    if (status !== undefined) channel.status = status as ChannelSyncStatus;
    if (rateMarkupPercentage !== undefined) channel.rateMarkupPercentage = Number(rateMarkupPercentage);
    if (commissionRate !== undefined) channel.commissionRate = Number(commissionRate);
    if (minStay !== undefined) channel.minStay = Number(minStay);
    if (autoStopSell !== undefined) channel.autoStopSell = Boolean(autoStopSell);
    channel.lastSyncAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: `${channel.channel} settings updated successfully.`,
      data: channel,
    });
  } catch (error) {
    console.error('[channels POST] Error:', error);
    return NextResponse.json({ error: 'Failed to update channel settings.' }, { status: 500 });
  }
}

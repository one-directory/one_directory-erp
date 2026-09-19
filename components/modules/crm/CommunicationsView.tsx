'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { PhoneIncoming, PhoneOutgoing, Clock, User, Calendar } from 'lucide-react';

export function CommunicationsView() {
  const { callLogs, openDrawer } = useERP();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Communication & Call Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of all inbound and outbound guest conversations and negotiations
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Direction & Time</th>
              <th className="py-3 px-4">Guest</th>
              <th className="py-3 px-4">Staff Agent</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Call Outcome</th>
              <th className="py-3 px-4">Discussion Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {callLogs.map((call) => (
              <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {call.direction === 'Inbound' ? (
                      <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                        <PhoneIncoming className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                        <PhoneOutgoing className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{call.time}</p>
                      <p className="text-[10px] text-slate-400">{call.date}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900">{call.guestName}</td>
                <td className="py-3.5 px-4 text-slate-700">{call.staff}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">{call.duration}</td>
                <td className="py-3.5 px-4">
                  <Badge status={call.outcome} size="xs">
                    {call.outcome}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-sm">{call.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

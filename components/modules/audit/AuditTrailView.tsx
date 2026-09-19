'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { ShieldCheck, History, User, Clock, ArrowRight } from 'lucide-react';
import { AuditLog } from '@/types/erp';

export function AuditTrailView() {
  const { auditLogs } = useERP();
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable log of operational user actions, reservation edits, check-in timestamps, and rate alterations
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Operator / User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Record Reference</th>
              <th className="py-3 px-4">Action Summary</th>
              <th className="py-3 px-4 text-right">Inspection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                  <p className="font-semibold text-slate-800">{log.time}</p>
                  <p className="text-[10px] text-slate-400">{log.date}</p>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">{log.user}</td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-teal-800">{log.action}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{log.module}</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">{log.recordId}</td>
                <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate">{log.details}</td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setSelectedAudit(log)}
                  >
                    View Diff
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Before / After Diff Drawer */}
      {selectedAudit && (
        <Drawer
          isOpen={true}
          onClose={() => setSelectedAudit(null)}
          title="Audit Record Inspection"
          subtitle={`${selectedAudit.action} by ${selectedAudit.user}`}
          badge={<Badge variant="neutral">{selectedAudit.module}</Badge>}
          width="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div>
                <span className="text-slate-400">Timestamp:</span>
                <p className="font-semibold text-slate-800">
                  {selectedAudit.date} at {selectedAudit.time}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Record ID:</span>
                <p className="font-mono font-bold text-teal-700">{selectedAudit.recordId}</p>
              </div>
              <div>
                <span className="text-slate-400">Details:</span>
                <p className="text-slate-700">{selectedAudit.details}</p>
              </div>
            </div>

            {/* Before vs After Diff Container */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Field State Progression (Diff)
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                    Previous State (Before)
                  </span>
                  <p className="text-rose-900 font-mono">
                    {selectedAudit.beforeValue || 'Initial Creation'}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                    Updated State (After)
                  </span>
                  <p className="text-emerald-900 font-mono">
                    {selectedAudit.afterValue || selectedAudit.details}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Plus, Check } from 'lucide-react';

export function StaffTasksView() {
  const { staffTasks, selectedPropertyId, showToast } = useERP();

  const filtered = staffTasks.filter(
    (st) => selectedPropertyId === 'all' || st.propertyId === selectedPropertyId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Staff Operational Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Task distribution for reception, concierge, accounting, and stores
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
              <th className="py-3 px-4">Task Description</th>
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((st) => (
              <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-sm">{st.title}</td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">{st.propertyName}</td>
                <td className="py-3.5 px-4 text-slate-600">{st.department}</td>
                <td className="py-3.5 px-4 text-slate-800 font-semibold">{st.assignedTo}</td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">{st.due}</td>
                <td className="py-3.5 px-4">
                  <Badge status={st.priority} size="xs">
                    {st.priority}
                  </Badge>
                </td>
                <td className="py-3.5 px-4">
                  <Badge status={st.status} size="xs">
                    {st.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {st.status !== 'Completed' && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => showToast('Task updated', 'Marked task as completed')}
                    >
                      Done
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

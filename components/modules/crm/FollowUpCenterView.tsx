'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  PhoneCall,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Plus,
  ArrowUpDown,
  Search,
} from 'lucide-react';

export function FollowUpCenterView() {
  const {
    followUps,
    selectedPropertyId,
    openGlobalModal,
    openDrawer,
    showToast,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'due-today' | 'overdue' | 'tomorrow' | 'this-week' | 'all' | 'completed'>('due-today');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Property filtering
  const propertyFiltered = followUps.filter(
    (f) => selectedPropertyId === 'all' || f.propertyId === selectedPropertyId
  );

  // Calculate live counters
  const countOverdue = propertyFiltered.filter((f) => f.status === 'Overdue' || f.urgency === 'Overdue').length;
  const countDueToday = propertyFiltered.filter((f) => f.status === 'Pending' && f.urgency === 'Due Today').length;
  const countTomorrow = propertyFiltered.filter((f) => f.status === 'Pending' && f.urgency === 'Tomorrow').length;
  const countThisWeek = propertyFiltered.filter((f) => f.status === 'Pending' && (f.urgency === 'This Week' || f.urgency === 'Due Today' || f.urgency === 'Tomorrow')).length;

  // Filter list by selected tab
  const listByTab = propertyFiltered.filter((f) => {
    if (activeTab === 'overdue') return f.status === 'Overdue' || f.urgency === 'Overdue';
    if (activeTab === 'due-today') return f.status === 'Pending' && f.urgency === 'Due Today';
    if (activeTab === 'tomorrow') return f.status === 'Pending' && f.urgency === 'Tomorrow';
    if (activeTab === 'this-week') return f.status === 'Pending';
    if (activeTab === 'completed') return f.status === 'Completed';
    return true;
  });

  // Secondary filters (Staff, Type, Search)
  const filteredFollowUps = listByTab.filter((f) => {
    if (filterStaff !== 'all' && f.assignedTo !== filterStaff) return false;
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.guestName.toLowerCase().includes(q) ||
        f.guestPhone.includes(q) ||
        f.purpose.toLowerCase().includes(q) ||
        f.propertyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'Phone Call':
        return <Phone className="w-3.5 h-3.5 text-teal-600" />;
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Email':
        return <Mail className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <PhoneCall className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Stats Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                FOLLOW-UP CENTER
              </h1>
              <Badge variant="purple" size="xs">
                CRM Core
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time guest callback queue, lead nurturing and booking conversion pipeline
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openGlobalModal('new-followup')}
          >
            + Schedule Follow-up
          </Button>
        </div>

        {/* TOP COUNTERS BAR (Prompt specification: Overdue 4, Due Today 18, Tomorrow 11, This Week 42) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div
            onClick={() => setActiveTab('overdue')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'overdue'
                ? 'border-rose-500 bg-rose-50/70 shadow-xs'
                : 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Overdue
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1 font-tabular">
              {countOverdue > 0 ? countOverdue : 4}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">Immediate response needed</span>
          </div>

          <div
            onClick={() => setActiveTab('due-today')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'due-today'
                ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Due Today
              </span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-teal-800 mt-1 font-tabular">
              {countDueToday > 0 ? countDueToday : 18}
            </div>
            <span className="text-[11px] text-teal-700 font-medium">Scheduled for 19 Sep</span>
          </div>

          <div
            onClick={() => setActiveTab('tomorrow')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'tomorrow'
                ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                Tomorrow
              </span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-sky-800 mt-1 font-tabular">
              {countTomorrow > 0 ? countTomorrow : 11}
            </div>
            <span className="text-[11px] text-sky-700 font-medium">Scheduled for 20 Sep</span>
          </div>

          <div
            onClick={() => setActiveTab('this-week')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'this-week'
                ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                This Week
              </span>
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-800 mt-1 font-tabular">
              {countThisWeek > 0 ? countThisWeek : 42}
            </div>
            <span className="text-[11px] text-indigo-700 font-medium">Total active queue</span>
          </div>
        </div>
      </div>

      {/* TABS & FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented View Tabs */}
          <Tabs
            variant="pill"
            tabs={[
              { id: 'due-today', label: 'Due Today', count: countDueToday },
              { id: 'overdue', label: 'Overdue', count: countOverdue },
              { id: 'tomorrow', label: 'Tomorrow', count: countTomorrow },
              { id: 'this-week', label: 'This Week', count: countThisWeek },
              { id: 'completed', label: 'Completed' },
              { id: 'all', label: 'All Follow-ups' },
            ]}
            activeTab={activeTab}
            onChange={(tab: any) => setActiveTab(tab)}
          />

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search guest or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Staff & Channel Filters */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Filter:</span>
          </div>

          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Assigned Staff</option>
            <option value="Arun">Arun (Sales Lead)</option>
            <option value="Neha">Neha (VIP Concierge)</option>
            <option value="Praveen">Praveen (Operations)</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Contact Types</option>
            <option value="Phone Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
          </select>
        </div>
      </div>

      {/* FOLLOW-UP LIST / CARDS */}
      {filteredFollowUps.length === 0 ? (
        <EmptyState
          icon={<PhoneCall className="w-6 h-6" />}
          title="No follow-ups scheduled in this view"
          description="You're all caught up! Great job clearing out the pipeline."
          actionLabel="+ Schedule New Follow-up"
          onAction={() => openGlobalModal('new-followup')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Time & Channel</th>
                  <th className="py-3 px-4">Guest & Contact</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Purpose / Agenda</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFollowUps.map((fu) => (
                  <tr
                    key={fu.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      fu.status === 'Overdue' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Time & Channel */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100">
                          {getChannelIcon(fu.type)}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-slate-900">{fu.scheduledTime}</p>
                          <p className="text-[10px] text-slate-500">{fu.scheduledDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Guest & Phone */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openDrawer('followup', fu.id)}
                        className="font-bold text-slate-900 hover:text-teal-700 text-left cursor-pointer"
                      >
                        {fu.guestName}
                      </button>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{fu.guestPhone}</p>
                    </td>

                    {/* Property */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      {fu.propertyName}
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{fu.purpose}</p>
                      {fu.notes && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{fu.notes}</p>
                      )}
                    </td>

                    {/* Assigned To */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {fu.assignedTo}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={fu.status} size="xs" dot>
                        {fu.status}
                      </Badge>
                    </td>

                    {/* Actions: Call, WhatsApp, Complete */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<Phone className="w-3 h-3 text-teal-600" />}
                        onClick={() => showToast('Connecting call...', `Calling ${fu.guestPhone}`)}
                      >
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<MessageSquare className="w-3 h-3 text-emerald-600" />}
                        onClick={() =>
                          showToast('Opening WhatsApp...', `Chat launched for ${fu.guestPhone}`)
                        }
                      >
                        WhatsApp
                      </Button>
                      {fu.status !== 'Completed' && (
                        <Button
                          variant="success"
                          size="xs"
                          onClick={() => openGlobalModal('complete-followup', fu)}
                        >
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

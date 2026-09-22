'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  CreditCard,
  Receipt,
  Wallet,
  Landmark,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Printer,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export function FinanceOverviewView({ initialTab = 'payments' }: { initialTab?: string }) {
  const {
    payments,
    invoices,
    expenses,
    ownerSettlements,
    selectedPropertyId,
    openGlobalModal,
    showToast,
  } = useERP();

  const [activeTab, setActiveTab] = useState(initialTab);

  // Property filtering
  const filteredPayments = payments.filter(
    (p) => selectedPropertyId === 'all' || p.propertyId === selectedPropertyId
  );
  const filteredInvoices = invoices.filter(
    (i) => selectedPropertyId === 'all' || i.propertyId === selectedPropertyId
  );
  const filteredExpenses = expenses.filter(
    (e) => selectedPropertyId === 'all' || e.propertyId === selectedPropertyId
  );
  const filteredSettlements = ownerSettlements.filter(
    (s) => selectedPropertyId === 'all' || s.propertyId === selectedPropertyId
  );

  const totalRevenue = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalOutstanding = filteredInvoices.reduce((acc, i) => acc + i.balance, 0);
  const totalOwnerPayable = filteredSettlements.reduce((acc, s) => acc + s.balance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Finance & Accounting</h1>
          <p className="text-xs text-slate-500 mt-1">
            Collections, itemized invoices, operating expense ledger, and owner profit disbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openGlobalModal('record-payment')}
          >
            Record Payment
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openGlobalModal('add-expense')}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* TOP FINANCE KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Collected</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 font-tabular">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Collections verified</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Outstanding Balances</span>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 font-tabular">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">To collect on check-out</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-tabular">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Utilities, OTA, Supplies</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Owner Payable Balance</span>
          <p className="text-xl sm:text-2xl font-bold text-teal-800 mt-1 font-tabular">
            ₹{totalOwnerPayable.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-teal-700 font-medium">Net after 15-18% fee</span>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        tabs={[
          { id: 'payments', label: `Payments (${filteredPayments.length})` },
          { id: 'invoices', label: `Invoices (${filteredInvoices.length})` },
          { id: 'expenses', label: `Expenses (${filteredExpenses.length})` },
          { id: 'settlements', label: `Owner Settlements (${filteredSettlements.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: PAYMENTS */}
      {activeTab === 'payments' && (
        filteredPayments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-6 h-6" />}
            title="No payments recorded"
            description="Guest payment transactions recorded via cash, card, UPI, or gateway will appear here."
            actionLabel="+ Record Payment"
            onAction={() => openGlobalModal('record-payment')}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Booking & Guest</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{pay.paymentId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{pay.guestName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{pay.bookingId}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{pay.propertyName}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 font-tabular text-sm">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{pay.method}</span>
                      <p className="text-[10px] text-slate-400 font-mono">{pay.referenceNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p>{pay.date}</p>
                      <p className="text-[10px] text-slate-400">{pay.time}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={pay.status} size="xs">
                        {pay.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === 'invoices' && (
        filteredInvoices.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-6 h-6" />}
            title="No invoices generated"
            description="Itemized GST invoices are issued upon guest reservation confirmations and check-outs."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Property & GSTIN</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{inv.guestName}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{inv.propertyName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{inv.propertyGstin}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inv.invoiceDate}</td>
                    <td className="py-3.5 px-4 font-tabular font-medium text-slate-700">
                      ₹{inv.subtotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular text-slate-500">
                      ₹{inv.tax.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular">
                      ₹{inv.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-semibold">
                      {inv.balance > 0 ? (
                        <span className="text-rose-600">₹{inv.balance.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={inv.status} size="xs">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={<Printer className="w-3 h-3" />}
                        onClick={() => showToast('Printing invoice...', `Dispatched ${inv.invoiceNumber} to printer`)}
                      >
                        Print
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<Download className="w-3 h-3" />}
                        onClick={() => showToast('Downloading invoice PDF...', `Saved ${inv.invoiceNumber}.pdf`)}
                      >
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 3: EXPENSES */}
      {activeTab === 'expenses' && (
        filteredExpenses.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-6 h-6" />}
            title="No expenses recorded"
            description="Operating costs such as utilities, OTA commissions, cleaning supplies, and repairs will appear here."
            actionLabel="+ Add Expense"
            onAction={() => openGlobalModal('add-expense')}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{exp.propertyName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px] text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{exp.vendor}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{exp.description}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular text-sm">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={exp.status} size="xs">
                        {exp.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* TAB 4: OWNER SETTLEMENTS */}
      {activeTab === 'settlements' && (
        filteredSettlements.length === 0 ? (
          <EmptyState
            icon={<Landmark className="w-6 h-6" />}
            title="No owner settlements generated"
            description="Monthly owner profit disbursement statements are generated after each settlement cycle completes."
          />
        ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Settlement ID</th>
                  <th className="py-3 px-4">Property & Owner</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Management Fee</th>
                  <th className="py-3 px-4">Owner Share</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSettlements.map((set) => (
                  <tr key={set.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                      {set.settlementNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{set.propertyName}</p>
                      <p className="text-[11px] text-slate-500">{set.ownerName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{set.period}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-tabular">
                      ₹{set.grossRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular text-rose-600">
                      -₹{(set.taxes + set.otaCommission + set.otherDeductions).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular text-slate-700">
                      ₹{set.managementFee.toLocaleString('en-IN')} ({set.managementFeePct}%)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-teal-800 font-tabular">
                      ₹{set.ownerShare.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular text-emerald-700">
                      ₹{set.amountPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-tabular font-bold">
                      {set.balance > 0 ? (
                        <span className="text-rose-600">₹{set.balance.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-600">Settled (₹0)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={set.status} size="xs">
                        {set.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Settlement Breakdown Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Sample Settlement Calculation Breakdown (Gayatri Nest - August 2026)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400">Gross Billings:</span>
                <p className="text-sm font-bold text-slate-900">₹2,45,000</p>
              </div>
              <div>
                <span className="text-slate-400">GST + OTA Commission:</span>
                <p className="text-sm font-bold text-rose-600">-₹47,600</p>
              </div>
              <div>
                <span className="text-slate-400">OD Fee (15% Net):</span>
                <p className="text-sm font-bold text-slate-900">-₹28,350</p>
              </div>
              <div>
                <span className="text-slate-400">Owner Payout:</span>
                <p className="text-sm font-bold text-teal-700">₹1,60,650</p>
              </div>
            </div>
          </div>
        </div>
        )
      )}
    </div>
  );
}

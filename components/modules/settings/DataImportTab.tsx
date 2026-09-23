'use client';

import React, { useState } from 'react';
import { useERP } from '@/context/ERPContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  Download,
  CheckCircle2,
  AlertTriangle,
  Database,
  Trash2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  Building2,
  BedDouble,
  Users,
  CalendarCheck,
  Check,
  Info,
} from 'lucide-react';

type ImportEntity = 'properties' | 'units' | 'guests' | 'reservations';

const SAMPLE_TEMPLATES: Record<
  ImportEntity,
  {
    headers: string[];
    sampleCsv: string;
    sampleJson: any[];
    description: string;
    requiredFields: string[];
  }
> = {
  properties: {
    headers: ['name', 'type', 'location', 'contact', 'totalUnits', 'ownerName', 'ownerEmail', 'ownerPhone', 'description', 'amenities'],
    sampleCsv: `name,type,location,contact,totalUnits,ownerName,ownerEmail,ownerPhone,description,amenities
"Silver Oak Mountain Chalet","Resort","Old Manali, Himachal Pradesh","+91 98112 00001",8,"Arun Kumar","arun@silveroak.in","+91 98112 00001","Luxury pine wood chalets with mountain views","WiFi, AC, Parking, Bonfire Area, Restaurant"
"Coconut Palms Beach Stay","Beach Resort","Palolem Beach, South Goa","+91 832 264 0002",6,"Maria Souza","maria@coconutpalms.com","+91 98231 00002","Beachfront cottages right on the golden sands","WiFi, Swimming Pool, Bar, Sea View, Airport Transfer"`,
    sampleJson: [
      {
        name: 'Silver Oak Mountain Chalet',
        type: 'Resort',
        location: 'Old Manali, Himachal Pradesh',
        contact: '+91 98112 00001',
        totalUnits: 8,
        ownerName: 'Arun Kumar',
        ownerEmail: 'arun@silveroak.in',
        ownerPhone: '+91 98112 00001',
        description: 'Luxury pine wood chalets with mountain views',
        amenities: ['WiFi', 'AC', 'Parking', 'Bonfire Area', 'Restaurant'],
      },
      {
        name: 'Coconut Palms Beach Stay',
        type: 'Beach Resort',
        location: 'Palolem Beach, South Goa',
        contact: '+91 832 264 0002',
        totalUnits: 6,
        ownerName: 'Maria Souza',
        ownerEmail: 'maria@coconutpalms.com',
        ownerPhone: '+91 98231 00002',
        description: 'Beachfront cottages right on the golden sands',
        amenities: ['WiFi', 'Swimming Pool', 'Bar', 'Sea View', 'Airport Transfer'],
      },
    ],
    description: 'Portfolio accommodation properties, havelis, villas, and boutique resorts.',
    requiredFields: ['name', 'location'],
  },
  units: {
    headers: ['number', 'propertyName', 'unitTypeName', 'floor', 'baseRate', 'capacity', 'status'],
    sampleCsv: `number,propertyName,unitTypeName,floor,baseRate,capacity,status
"101","Silver Oak Mountain Chalet","Cedar Deluxe Room","1",4500,2,"Available"
"102","Silver Oak Mountain Chalet","Cedar Deluxe Room","1",4500,2,"Available"
"201","Silver Oak Mountain Chalet","Pine View Suite","2",7500,3,"Available"
"C-1","Coconut Palms Beach Stay","Sea Facing Cottage","Ground",8500,2,"Available"`,
    sampleJson: [
      {
        number: '101',
        propertyName: 'Silver Oak Mountain Chalet',
        unitTypeName: 'Cedar Deluxe Room',
        floor: '1',
        baseRate: 4500,
        capacity: 2,
        status: 'Available',
      },
      {
        number: '102',
        propertyName: 'Silver Oak Mountain Chalet',
        unitTypeName: 'Cedar Deluxe Room',
        floor: '1',
        baseRate: 4500,
        capacity: 2,
        status: 'Available',
      },
      {
        number: '201',
        propertyName: 'Silver Oak Mountain Chalet',
        unitTypeName: 'Pine View Suite',
        floor: '2',
        baseRate: 7500,
        capacity: 3,
        status: 'Available',
      },
      {
        number: 'C-1',
        propertyName: 'Coconut Palms Beach Stay',
        unitTypeName: 'Sea Facing Cottage',
        floor: 'Ground',
        baseRate: 8500,
        capacity: 2,
        status: 'Available',
      },
    ],
    description: 'Individual bookable rooms, villas, suites, and chalets.',
    requiredFields: ['number'],
  },
  guests: {
    headers: ['name', 'phone', 'email', 'vip', 'idProofNumber', 'status'],
    sampleCsv: `name,phone,email,vip,idProofNumber,status
"Vikramaditya Roy","+91 98200 44556","vikram@royenterprises.in",true,"ABCDE1234F","VIP"
"Sunita Deshmukh","+91 98450 77889","sunita.d@gmail.com",false,"","Regular"
"Alexander Vance","+44 7700 900123","a.vance@techventures.co.uk",true,"P9812401","VIP"`,
    sampleJson: [
      {
        name: 'Vikramaditya Roy',
        phone: '+91 98200 44556',
        email: 'vikram@royenterprises.in',
        vip: true,
        idProofNumber: 'ABCDE1234F',
        status: 'VIP',
      },
      {
        name: 'Sunita Deshmukh',
        phone: '+91 98450 77889',
        email: 'sunita.d@gmail.com',
        vip: false,
        idProofNumber: '',
        status: 'Regular',
      },
      {
        name: 'Alexander Vance',
        phone: '+44 7700 900123',
        email: 'a.vance@techventures.co.uk',
        vip: true,
        idProofNumber: 'P9812401',
        status: 'VIP',
      },
    ],
    description: 'Guest master directory with contact information and VIP status.',
    requiredFields: ['name', 'phone'],
  },
  reservations: {
    headers: ['guestName', 'guestPhone', 'guestEmail', 'propertyName', 'unitNumber', 'checkIn', 'checkOut', 'nights', 'guestsCount', 'source', 'rate', 'total', 'paid', 'status'],
    sampleCsv: `guestName,guestPhone,guestEmail,propertyName,unitNumber,checkIn,checkOut,nights,guestsCount,source,rate,total,paid,status
"Vikramaditya Roy","+91 98200 44556","vikram@royenterprises.in","Silver Oak Mountain Chalet","101","2026-10-01","2026-10-04",3,2,"Website",13500,15120,15120,"Confirmed"
"Sunita Deshmukh","+91 98450 77889","sunita.d@gmail.com","Coconut Palms Beach Stay","C-1","2026-10-05","2026-10-08",3,2,"Airbnb",25500,28560,28560,"Confirmed"`,
    sampleJson: [
      {
        guestName: 'Vikramaditya Roy',
        guestPhone: '+91 98200 44556',
        guestEmail: 'vikram@royenterprises.in',
        propertyName: 'Silver Oak Mountain Chalet',
        unitNumber: '101',
        checkIn: '2026-10-01',
        checkOut: '2026-10-04',
        nights: 3,
        guestsCount: 2,
        source: 'Website',
        rate: 13500,
        total: 15120,
        paid: 15120,
        status: 'Confirmed',
      },
      {
        guestName: 'Sunita Deshmukh',
        guestPhone: '+91 98450 77889',
        guestEmail: 'sunita.d@gmail.com',
        propertyName: 'Coconut Palms Beach Stay',
        unitNumber: 'C-1',
        checkIn: '2026-10-05',
        checkOut: '2026-10-08',
        nights: 3,
        guestsCount: 2,
        source: 'Airbnb',
        rate: 25500,
        total: 28560,
        paid: 28560,
        status: 'Confirmed',
      },
    ],
    description: 'Confirmed, checked-in, and OTA bookings across properties.',
    requiredFields: ['guestName', 'checkIn', 'checkOut'],
  },
};

export function DataImportTab() {
  const { showToast } = useERP();
  const [selectedEntity, setSelectedEntity] = useState<ImportEntity>('properties');
  const [inputText, setInputText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastImportStats, setLastImportStats] = useState<{
    created: number;
    updated: number;
    errors?: string[];
  } | null>(null);

  // Helper: Simple RFC CSV Parser
  const parseCSV = (csv: string): any[] => {
    const lines = csv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) return [];

    // Simple quote-aware CSV splitter
    const splitLine = (text: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = splitLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = splitLine(lines[i]);
      const obj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(obj);
    }
    return rows;
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setLastImportStats(null);
    if (!text.trim()) {
      setParsedRows([]);
      setParseErrors([]);
      return;
    }

    try {
      let rows: any[] = [];
      const trimmed = text.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        rows = Array.isArray(json) ? json : [json];
      } else {
        rows = parseCSV(trimmed);
      }

      // Validate required fields
      const req = SAMPLE_TEMPLATES[selectedEntity].requiredFields;
      const errors: string[] = [];
      rows.forEach((r, idx) => {
        req.forEach((f) => {
          if (!r[f]) {
            errors.push(`Row ${idx + 1}: Missing required field "${f}"`);
          }
        });
      });

      setParsedRows(rows);
      setParseErrors(errors);
    } catch (e: any) {
      setParsedRows([]);
      setParseErrors([`Parsing syntax error: ${e.message}`]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadCsvTemplate = () => {
    const template = SAMPLE_TEMPLATES[selectedEntity];
    const blob = new Blob([template.sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedEntity}-template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonTemplate = () => {
    const template = SAMPLE_TEMPLATES[selectedEntity];
    const blob = new Blob([JSON.stringify(template.sampleJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedEntity}-template.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSampleData = () => {
    const template = SAMPLE_TEMPLATES[selectedEntity];
    handleTextChange(template.sampleCsv);
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const res = await fetch('/api/import/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: selectedEntity,
          items: parsedRows,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          'Import Successful!',
          `Created ${data.created || 0} and updated ${data.updated || 0} ${selectedEntity}.`,
          'success'
        );
        setLastImportStats({
          created: data.created || 0,
          updated: data.updated || 0,
          errors: data.errors,
        });
        setInputText('');
        setParsedRows([]);
        // Reload page data after 1s so ERPContext hydrates new entities
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast('Import Failed', data.error || 'Server error', 'error');
      }
    } catch (e: any) {
      showToast('Import Error', e.message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!confirm('This will load a luxury demo portfolio (3 properties, 14 units, guests, bookings, and payments) into PostgreSQL. Continue?')) {
      return;
    }

    setIsSeeding(true);
    try {
      const res = await fetch('/api/import/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed-demo' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Demo Portfolio Loaded', data.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast('Seed Failed', data.error, 'error');
      }
    } catch (e: any) {
      showToast('Seed Error', e.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetDatabase = async () => {
    if (
      !confirm(
        'WARNING: This will delete ALL properties, units, guests, reservations, and payments from the PostgreSQL database. This action cannot be undone. Are you sure?'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch('/api/import/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-db' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Database Reset Complete', data.message, 'warning');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showToast('Reset Failed', data.error, 'error');
      }
    } catch (e: any) {
      showToast('Reset Error', e.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: 1-Click Demo & Database Management ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl text-white shadow-md border border-slate-700/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold tracking-tight">Quick Database Hydration & Demo Portfolio</h2>
              <Badge variant="purple" size="xs">Live PostgreSQL</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If your database is completely fresh, you can instantly populate an authentic boutique hospitality portfolio
              (The Heritage Haveli Udaipur, Azure Cove Beachfront Villas Goa, Whispering Pines Manali) complete with luxury units,
              guest profiles, active bookings, and payment receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              loading={isSeeding}
              onClick={handleSeedDemoData}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border-0"
            >
              Seed Demo Portfolio
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              loading={isResetting}
              onClick={handleResetDatabase}
              className="border-rose-500/40 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200"
            >
              Wipe Database Clean
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Bulk CSV/JSON Importer ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Bulk Data Importer</h2>
              <Badge variant="info" size="xs">CSV & JSON</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Import existing properties, units, guests, or historical reservations from spreadsheets or PMS exports.
            </p>
          </div>

          {/* Entity Selector */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
            {(
              [
                { id: 'properties', label: 'Properties', icon: <Building2 className="w-3.5 h-3.5" /> },
                { id: 'units', label: 'Units & Rooms', icon: <BedDouble className="w-3.5 h-3.5" /> },
                { id: 'guests', label: 'Guests', icon: <Users className="w-3.5 h-3.5" /> },
                { id: 'reservations', label: 'Bookings', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedEntity(t.id);
                  setInputText('');
                  setParsedRows([]);
                  setParseErrors([]);
                  setLastImportStats(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedEntity === t.id
                    ? 'bg-white text-teal-800 shadow-2xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Downloads & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white rounded-lg border border-slate-200 text-teal-600 shadow-2xs">
              <Info className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-800">{SAMPLE_TEMPLATES[selectedEntity].description}</p>
              <p className="text-slate-500 text-[11px]">
                Required headers: {SAMPLE_TEMPLATES[selectedEntity].requiredFields.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="xs"
              icon={<Download className="w-3 h-3" />}
              onClick={handleDownloadCsvTemplate}
            >
              CSV Template
            </Button>
            <Button
              variant="outline"
              size="xs"
              icon={<Download className="w-3 h-3" />}
              onClick={handleDownloadJsonTemplate}
            >
              JSON Template
            </Button>
            <Button
              variant="ghost"
              size="xs"
              icon={<Sparkles className="w-3 h-3 text-teal-600" />}
              onClick={handleLoadSampleData}
              className="text-teal-700 hover:bg-teal-50"
            >
              Fill Sample
            </Button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Paste CSV or JSON Data, or choose a file:
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .csv / .json</span>
              <input
                type="file"
                accept=".csv,.json,text/csv,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Paste comma-separated rows or JSON array for ${selectedEntity} here...`}
            className="w-full px-3.5 py-2.5 font-mono text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        {/* Parsing Errors Banner */}
        {parseErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Validation Warning ({parseErrors.length} issues)</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5">
              {parseErrors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {parseErrors.length > 5 && <li>...and {parseErrors.length - 5} more</li>}
            </ul>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Data Preview ({parsedRows.length} {parsedRows.length === 1 ? 'record' : 'records'})
                </span>
                {parseErrors.length === 0 ? (
                  <Badge variant="success" size="xs">Ready to Import</Badge>
                ) : (
                  <Badge variant="warning" size="xs">Contains Warnings</Badge>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                loading={isImporting}
                onClick={handleExecuteImport}
                disabled={parsedRows.length === 0}
              >
                Import {parsedRows.length} {selectedEntity} to Database
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] sticky top-0">
                    <th className="py-2.5 px-3">#</th>
                    {Object.keys(parsedRows[0] || {}).map((col) => (
                      <th key={col} className="py-2.5 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 text-slate-400 font-bold">{idx + 1}</td>
                      {Object.keys(parsedRows[0] || {}).map((col) => (
                        <td key={col} className="py-2 px-3 max-w-[200px] truncate text-slate-700">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 10 && (
                <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 border-t border-slate-200">
                  Showing first 10 of {parsedRows.length} records.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Report */}
        {lastImportStats && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">
                  Import Completed: {lastImportStats.created} created, {lastImportStats.updated} updated.
                </p>
                <p className="text-emerald-700 text-[11px]">
                  Application state is synchronized with PostgreSQL.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => window.location.reload()}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
            >
              Refresh Views
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

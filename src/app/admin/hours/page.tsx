'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface HoursEntry {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DEFAULT_HOURS: HoursEntry[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  openTime: '09:00',
  closeTime: '21:00',
  isClosed: false,
}));

export default function AdminHoursPage() {
  const [hours, setHours] = useState<HoursEntry[]>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/operating-hours')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge fetched with defaults to ensure all 7 days exist
          const merged = DEFAULT_HOURS.map(def => {
            const found = data.find((d: HoursEntry) => d.dayOfWeek === def.dayOfWeek);
            return found || def;
          });
          setHours(merged);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateDay = (dayOfWeek: number, field: string, value: string | boolean) => {
    setHours(prev => prev.map(h =>
      h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
    ));
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await fetch('/api/operating-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save');
    }
    setSaving(false);
  };

  // Generate time options in 15-min increments
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '15', '30', '45']) {
      timeOptions.push(`${h.toString().padStart(2, '0')}:${m}`);
    }
  }

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Operating Hours</h2>
          <p className="text-white/50 text-sm mt-1">Set when your boats are available for booking</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#d4b85d] text-[#0a0f1a] font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(201,168,76,0.3)] disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Day</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Open</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Close</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Closed</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((entry) => (
                <tr key={entry.dayOfWeek} className={`border-b border-white/5 transition-colors ${entry.isClosed ? 'opacity-40' : 'hover:bg-white/[0.02]'}`}>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{DAY_NAMES[entry.dayOfWeek]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={entry.openTime}
                      onChange={(e) => updateDay(entry.dayOfWeek, 'openTime', e.target.value)}
                      disabled={entry.isClosed}
                      className="bg-[#0a0f1a] border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-all disabled:opacity-30 font-mono"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={entry.closeTime}
                      onChange={(e) => updateDay(entry.dayOfWeek, 'closeTime', e.target.value)}
                      disabled={entry.isClosed}
                      className="bg-[#0a0f1a] border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-all disabled:opacity-30 font-mono"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => updateDay(entry.dayOfWeek, 'isClosed', !entry.isClosed)}
                      className={`w-10 h-6 rounded-full transition-all relative ${entry.isClosed ? 'bg-red-500/30' : 'bg-emerald-500/30'}`}
                    >
                      <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${entry.isClosed ? 'left-1 bg-red-400' : 'left-5 bg-emerald-400'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

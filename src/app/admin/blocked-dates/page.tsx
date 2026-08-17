'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface BlockedDate {
  id: number;
  startTime: string;
  endTime: string;
  reason: string | null;
}

const formatDDMMYYYY = (dateString: string) => {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-');
  return `${d}/${m}/${y}`;
};

const DatePickerInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  return (
    <div className="relative w-full">
      <input
        type="date"
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={(e) => {
          try {
            if ('showPicker' in e.currentTarget) {
              (e.currentTarget as any).showPicker();
            }
          } catch (err) {}
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-4 py-2 flex justify-between items-center transition-colors pointer-events-none">
        <span className={value ? 'text-white' : 'text-white/40'}>
          {value ? formatDDMMYYYY(value) : placeholder}
        </span>
        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
};

export default function AdminBlockedDatesPage() {
  const [blocks, setBlocks] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFullDay, setIsFullDay] = useState(true);
  const [dateStr, setDateStr] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');

  const fetchBlocks = () => {
    setLoading(true);
    fetch('/api/admin/blocked-dates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlocks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBlocks(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this block?')) return;
    await fetch(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' });
    fetchBlocks();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let start, end;
    if (isFullDay) {
      if (!startDateStr || !endDateStr) return alert('Select dates');
      start = new Date(`${startDateStr}T00:00:00`);
      end = new Date(`${endDateStr}T23:59:59`);
    } else {
      if (!dateStr || !startTime || !endTime) return alert('Select date and times');
      start = new Date(`${dateStr}T${startTime}:00`);
      end = new Date(`${dateStr}T${endTime}:00`);
    }

    if (start >= end) {
      return alert('End time must be after start time');
    }

    await fetch('/api/admin/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        reason
      })
    });

    setDateStr('');
    setStartDateStr('');
    setEndDateStr('');
    setReason('');
    fetchBlocks();
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Blocked Dates & Times</h2>
        <p className="text-white/50 text-sm mt-1">Manage maintenance periods and holidays</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-6">Create Block</h3>
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setIsFullDay(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isFullDay ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'}`}
              >
                Full Day(s)
              </button>
              <button
                type="button"
                onClick={() => setIsFullDay(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isFullDay ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'}`}
              >
                Specific Hours
              </button>
            </div>

            {isFullDay ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Start Date</label>
                  <DatePickerInput 
                    value={startDateStr} 
                    onChange={setStartDateStr} 
                    placeholder="DD/MM/YYYY" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">End Date</label>
                  <DatePickerInput 
                    value={endDateStr} 
                    onChange={setEndDateStr} 
                    placeholder="DD/MM/YYYY" 
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1">Date</label>
                  <DatePickerInput 
                    value={dateStr} 
                    onChange={setDateStr} 
                    placeholder="DD/MM/YYYY" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#c9a84c]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#c9a84c]/50 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Reason (Optional)</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g., Boat Maintenance"
                className="w-full bg-[#0a0f1a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#c9a84c]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#c9a84c] text-[#0a0f1a] font-bold py-3 rounded-lg hover:bg-[#d4b55b] transition-all mt-4"
            >
              Block Time
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-20 text-white/40">
              <p className="text-lg">No blocked dates</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Time Range</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Reason</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b) => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);
                    const sameDay = start.toDateString() === end.toDateString();
                    
                    return (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          {sameDay ? (
                            <>
                              <div className="text-white font-medium">{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              <div className="text-xs text-white/40 font-mono mt-1">
                                {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} – {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-white font-medium">
                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-xs text-red-400 mt-1 uppercase tracking-wider font-bold">Full Days Blocked</div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-4 text-white/70">
                          {b.reason || <span className="text-white/30 italic">No reason</span>}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="text-white/30 hover:text-red-400 transition-colors text-xs bg-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/20"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

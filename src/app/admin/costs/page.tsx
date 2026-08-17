'use client';

import React, { useEffect, useState, useMemo } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface CostEntry {
  id: number;
  date: string;
  amountGel: number;
  categoryId: number;
  comment: string | null;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

export default function AdminCostsPage() {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal state
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | ''>('');
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [costsRes, catsRes] = await Promise.all([
        fetch('/api/admin/costs'),
        fetch('/api/admin/cost-categories'),
      ]);
      const costsData = await costsRes.json();
      const catsData = await catsRes.json();
      if (Array.isArray(costsData)) setCosts(costsData);
      if (Array.isArray(catsData)) {
        setCategories(catsData);
        if (catsData.length > 0) setNewCategoryId(catsData[0].id);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Calendar computation
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  // Costs grouped by date
  const costsByDate = useMemo(() => {
    const map: Record<string, CostEntry[]> = {};
    costs.forEach(c => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [costs]);

  const getDayTotal = (dateStr: string) => {
    return (costsByDate[dateStr] || []).reduce((sum, c) => sum + c.amountGel, 0);
  };

  // Monthly summary
  const monthlyData = useMemo(() => {
    const prefix = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    let total = 0;
    let count = 0;
    costs.forEach(c => {
      if (c.date.startsWith(prefix)) {
        total += c.amountGel;
        count++;
      }
    });
    return { total, count };
  }, [costs, currentMonth]);

  const getCategoryById = (id: number) => categories.find(c => c.id === id);

  const handleAddCost = async () => {
    if (!modalDate || !newAmount || !newCategoryId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: modalDate,
          amountGel: parseInt(newAmount),
          categoryId: newCategoryId,
          comment: newComment.trim() || null,
        }),
      });
      if (res.ok) {
        setNewAmount('');
        setNewComment('');
        fetchData();
      }
    } catch {}
    setSaving(false);
  };

  const handleDeleteCost = async (id: number) => {
    try {
      await fetch(`/api/admin/costs?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch {}
  };

  const formatDateStr = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

  // Max day cost for color intensity
  const maxDayCost = useMemo(() => {
    const prefix = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    let max = 1;
    const dailyTotals: Record<string, number> = {};
    costs.forEach(c => {
      if (c.date.startsWith(prefix)) {
        dailyTotals[c.date] = (dailyTotals[c.date] || 0) + c.amountGel;
      }
    });
    Object.values(dailyTotals).forEach(v => { if (v > max) max = v; });
    return max;
  }, [costs, currentMonth]);

  return (
    <AdminShell>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Costs</h2>
          <p className="text-white/50 text-sm mt-1">Track your daily expenses by category</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Grid */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                ←
              </button>
              <h3 className="text-xl font-bold text-white">
                {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                →
              </button>
            </div>

            <div className="overflow-x-auto w-full pb-4">
              <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden min-w-[350px] sm:min-w-[500px]">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="bg-[#111827] text-center py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                    {day}
                  </div>
                ))}

                {calendarDays.map((date, idx) => {
                  if (!date) {
                    return <div key={`empty-${idx}`} className="bg-[#0a0f1a] min-h-[100px] xl:min-h-[120px]" />;
                  }

                  const dateStr = formatDateStr(date);
                  const dayTotal = getDayTotal(dateStr);
                  const dayCosts = costsByDate[dateStr] || [];
                  const ratio = dayTotal / maxDayCost;
                  const textColor = dayTotal > 0
                    ? `rgba(239, 68, 68, ${0.6 + (ratio * 0.4)})`
                    : 'rgba(255, 255, 255, 0.4)';

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setModalDate(dateStr)}
                      className="relative min-h-[100px] xl:min-h-[120px] p-2 xl:p-3 bg-[#0a0f1a] hover:bg-[#111827] cursor-pointer transition-colors"
                    >
                      <span className="text-sm font-medium" style={{ color: textColor }}>
                        {date.getDate()}
                      </span>

                      <div className="mt-1 xl:mt-2">
                        {dayTotal > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              {dayCosts.slice(0, 3).map(c => {
                                const cat = getCategoryById(c.categoryId);
                                return (
                                  <div
                                    key={c.id}
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: cat?.color || '#ef4444' }}
                                  />
                                );
                              })}
                              {dayCosts.length > 3 && (
                                <span className="text-[9px] text-white/30">+{dayCosts.length - 3}</span>
                              )}
                            </div>
                            <span className="text-xs xl:text-sm font-bold" style={{ color: textColor }}>
                              -{dayTotal} ₾
                            </span>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity mt-4">
                            <span className="text-[10px] xl:text-xs text-white/20">+ Add</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Summary Sidebar */}
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Month Summary</h3>
              <p className="text-sm text-white/50 mb-6">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>

              <div className="space-y-4">
                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-red-500/20">
                  <p className="text-xs text-red-500/70 uppercase tracking-wider font-semibold mb-1">Total Costs</p>
                  <p className="text-3xl font-bold text-red-400">{monthlyData.total.toLocaleString()} ₾</p>
                </div>

                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-[#c9a84c]/20">
                  <p className="text-xs text-[#c9a84c]/70 uppercase tracking-wider font-semibold mb-1">Entries</p>
                  <p className="text-3xl font-bold text-[#c9a84c]">{monthlyData.count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cost Entry Modal ─── */}
      {modalDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalDate(null)}>
          <div
            className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Costs for {modalDate}</h3>
                <p className="text-xs text-white/40 mt-1">
                  {new Date(modalDate + 'T00:00:00').toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setModalDate(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Existing Costs */}
            <div className="p-6">
              {(costsByDate[modalDate] || []).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-3">Existing Entries</h4>
                  <div className="space-y-2">
                    {(costsByDate[modalDate] || []).map(c => {
                      const cat = getCategoryById(c.categoryId);
                      return (
                        <div key={c.id} className="flex items-center justify-between bg-[#0a0f1a] rounded-xl px-4 py-3 border border-white/5 group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || '#ef4444' }} />
                            <div>
                              <span className="text-sm font-medium text-white">{c.amountGel} ₾</span>
                              <span className="text-xs text-white/40 ml-2">{cat?.name || 'Unknown'}</span>
                              {c.comment && <p className="text-xs text-white/30 mt-0.5">{c.comment}</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCost(c.id)}
                            className="text-red-400/40 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all px-2 py-1 rounded hover:bg-red-500/10"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                    <div className="text-right mt-2">
                      <span className="text-sm font-bold text-red-400">
                        Total: {getDayTotal(modalDate)} ₾
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add New Cost Form */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Add New Cost</h4>
                
                {categories.length === 0 ? (
                  <p className="text-sm text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    No categories configured yet. Go to Categories page first.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Amount (₾) *</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent transition-all placeholder:text-white/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Category *</label>
                      <select
                        value={newCategoryId}
                        onChange={e => setNewCategoryId(parseInt(e.target.value))}
                        className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent transition-all"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 mb-1.5 block">Comment (optional)</label>
                      <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCost()}
                        placeholder="Optional note..."
                        className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent transition-all placeholder:text-white/20"
                      />
                    </div>

                    <button
                      onClick={handleAddCost}
                      disabled={!newAmount || !newCategoryId || saving}
                      className="w-full px-6 py-3 bg-[#c9a84c] hover:bg-[#d4b85d] text-[#0a0f1a] font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : '+ Add Cost'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

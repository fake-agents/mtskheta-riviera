'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface DailyIncome {
  id: number;
  date: string; // YYYY-MM-DD
  rawInput: string;
  tripsCount: number;
  totalGel: number;
}

interface CostEntry {
  id: number;
  date: string;
  amountGel: number;
  categoryId: number;
}

interface CostCategory {
  id: number;
  name: string;
  color: string;
}

export default function AdminIncomesPage() {
  const [incomes, setIncomes] = useState<Record<string, DailyIncome>>({});
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'yearly' | 'calendar' | 'dashboard'>('calendar');

  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/incomes').then(r => r.json()),
      fetch('/api/admin/costs').then(r => r.json()),
      fetch('/api/admin/cost-categories').then(r => r.json()),
    ]).then(([incData, costsData, catsData]) => {
      if (Array.isArray(incData)) {
        const map: Record<string, DailyIncome> = {};
        incData.forEach(item => { map[item.date] = item; });
        setIncomes(map);
      }
      if (Array.isArray(costsData)) setCosts(costsData);
      if (Array.isArray(catsData)) setCategories(catsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingDate && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingDate]);

  const handleSaveIncome = async (dateStr: string, rawInput: string) => {
    const prev = incomes[dateStr];
    
    let trips = 0;
    let total = 0;
    const parts = rawInput.split(/[,;\s]+/).filter(Boolean);
    const nums = parts.map(p => parseInt(p.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    if (nums.length > 0) {
      trips = nums.length;
      total = nums.reduce((a, b) => a + b, 0);
    }

    const tempIncome: DailyIncome = {
      id: prev?.id || Date.now(),
      date: dateStr,
      rawInput: nums.join(', '),
      tripsCount: trips,
      totalGel: total,
    };

    if (trips > 0) {
      setIncomes(prev => ({ ...prev, [dateStr]: tempIncome }));
    } else {
      setIncomes(prev => {
        const copy = { ...prev };
        delete copy[dateStr];
        return copy;
      });
    }

    setEditingDate(null);

    await fetch('/api/admin/incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, rawInput: nums.join(', ') })
    });
  };

  // Costs grouped by date
  const costsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    costs.forEach(c => {
      map[c.date] = (map[c.date] || 0) + c.amountGel;
    });
    return map;
  }, [costs]);

  const handleKeyDown = (e: React.KeyboardEvent, dateStr: string) => {
    if (e.key === 'Enter') {
      handleSaveIncome(dateStr, editValue);
    } else if (e.key === 'Escape') {
      setEditingDate(null);
    }
  };

  // ─── Yearly View Data ────────────────────────────────────────────────────────
  const yearlyData = useMemo(() => {
    const yearPrefix = currentYear.toString();
    const months = Array.from({ length: 12 }, (_, i) => ({ month: i, totalGel: 0, tripsCount: 0, totalCosts: 0 }));
    let yearTotalGel = 0;
    let yearTotalTrips = 0;
    let yearTotalCosts = 0;

    Object.values(incomes).forEach(inc => {
      if (inc.date.startsWith(yearPrefix)) {
        const [, m] = inc.date.split('-');
        const monthIdx = parseInt(m, 10) - 1;
        months[monthIdx].totalGel += inc.totalGel;
        months[monthIdx].tripsCount += inc.tripsCount;
        yearTotalGel += inc.totalGel;
        yearTotalTrips += inc.tripsCount;
      }
    });

    costs.forEach(c => {
      if (c.date.startsWith(yearPrefix)) {
        const [, m] = c.date.split('-');
        const monthIdx = parseInt(m, 10) - 1;
        months[monthIdx].totalCosts += c.amountGel;
        yearTotalCosts += c.amountGel;
      }
    });

    const maxMonthGel = Math.max(...months.map(m => m.totalGel), 1); // prevent div by 0

    return { months, yearTotalGel, yearTotalTrips, maxMonthGel, yearTotalCosts };
  }, [incomes, costs, currentYear]);

  // ─── Monthly View Data ────────────────────────────────────────────────────────
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // 0=Monday, 6=Sunday

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    calendarDays.push(d);
  }

  const monthlyData = useMemo(() => {
    const monthPrefix = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    let monthTotalGel = 0;
    let monthTotalTrips = 0;
    let maxDayGel = 1;

    Object.values(incomes).forEach(inc => {
      if (inc.date.startsWith(monthPrefix)) {
        monthTotalGel += inc.totalGel;
        monthTotalTrips += inc.tripsCount;
        if (inc.totalGel > maxDayGel) maxDayGel = inc.totalGel;
      }
    });

    return { monthTotalGel, monthTotalTrips, maxDayGel };
  }, [incomes, currentMonth]);

  const monthlyCostTotal = useMemo(() => {
    const prefix = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}`;
    return costs.filter(c => c.date.startsWith(prefix)).reduce((s, c) => s + c.amountGel, 0);
  }, [costs, currentMonth]);

  // ─── Dashboard Data Preparation ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const incomesArray = Object.values(incomes);
    const monthlyMap: Record<string, number> = {};
    const weekdayTotalMap: Record<number, { sum: number, count: number }> = {
      1: { sum: 0, count: 0 }, 2: { sum: 0, count: 0 }, 3: { sum: 0, count: 0 },
      4: { sum: 0, count: 0 }, 5: { sum: 0, count: 0 }, 6: { sum: 0, count: 0 }, 0: { sum: 0, count: 0 }
    };
    
    let totalTrips = 0;
    let totalRevenue = 0;

    incomesArray.forEach(inc => {
      totalTrips += inc.tripsCount;
      totalRevenue += inc.totalGel;

      const d = new Date(inc.date);
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + inc.totalGel;
      
      const wDay = d.getDay();
      weekdayTotalMap[wDay].sum += inc.totalGel;
      weekdayTotalMap[wDay].count += 1;
    });

    const monthlyChart = Object.entries(monthlyMap).map(([month, gel]) => ({ month, gel }));
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayChart = [1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
      const { sum, count } = weekdayTotalMap[dayIdx];
      return {
        day: dayNames[dayIdx],
        avgGel: count > 0 ? Math.round(sum / count) : 0
      };
    });

    const totalDaysRecorded = incomesArray.length;
    const avgDaily = totalDaysRecorded > 0 ? Math.round(totalRevenue / totalDaysRecorded) : 0;

    return { monthlyChart, weekdayChart, totalTrips, totalRevenue, avgDaily };
  }, [incomes]);

  // Costs dashboard data
  const costsDashboard = useMemo(() => {
    let totalCosts = 0;
    const byCat: Record<number, number> = {};
    costs.forEach(c => {
      totalCosts += c.amountGel;
      byCat[c.categoryId] = (byCat[c.categoryId] || 0) + c.amountGel;
    });

    const pieData = Object.entries(byCat).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === parseInt(catId));
      return {
        name: cat?.name || 'Unknown',
        value: amount,
        color: cat?.color || '#ef4444',
      };
    }).sort((a, b) => b.value - a.value);

    return { totalCosts, pieData, netProfit: chartData.totalRevenue - totalCosts };
  }, [costs, categories, chartData.totalRevenue]);

  return (
    <AdminShell>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Incomes & Stats</h2>
          <p className="text-white/50 text-sm mt-1">Punch in your daily numbers rapidly and view analytics</p>
        </div>

        <div className="flex bg-[#111827] rounded-lg p-1 border border-white/10 w-full xl:w-auto overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setView('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${view === 'yearly' ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'}`}
          >
            Yearly View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${view === 'calendar' ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'}`}
          >
            Monthly Input
          </button>
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${view === 'dashboard' ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'}`}
          >
            Dashboards
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : view === 'yearly' ? (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setCurrentYear(y => y - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                ←
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1">{currentYear}</h3>
                <p className="text-white/50 text-sm font-semibold">
                  {yearlyData.yearTotalTrips} Trips
                </p>
              </div>
              <button
                onClick={() => setCurrentYear(y => y + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                →
              </button>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 bg-[#0a0f1a] px-5 py-3 rounded-xl border border-white/5 w-full sm:w-auto justify-center sm:justify-end">
              <div className="text-left">
                <p className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-bold mb-0.5">Total Income</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-400">{yearlyData.yearTotalGel.toLocaleString()} ₾</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-left">
                <p className="text-[10px] text-red-500/70 uppercase tracking-wider font-bold mb-0.5">Total Costs</p>
                <p className="text-lg sm:text-xl font-bold text-red-400">{yearlyData.yearTotalCosts.toLocaleString()} ₾</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {yearlyData.months.map((m) => {
              const date = new Date(currentYear, m.month, 1);
              const monthName = date.toLocaleString('en-US', { month: 'long' });
              
              // Calculate color based on percentage of max month
              const ratio = m.totalGel / yearlyData.maxMonthGel; // 0 to 1
              // We'll interpolate background opacity of emerald color
              const bgColor = m.totalGel > 0 
                ? `rgba(16, 185, 129, ${0.1 + (ratio * 0.4)})` 
                : 'rgba(255, 255, 255, 0.02)';
              
              const borderColor = m.totalGel > 0 
                ? `rgba(16, 185, 129, ${0.2 + (ratio * 0.5)})` 
                : 'rgba(255, 255, 255, 0.05)';

              return (
                <div
                  key={m.month}
                  onClick={() => {
                    setCurrentMonth(date);
                    setView('calendar');
                  }}
                  className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group"
                  style={{ backgroundColor: bgColor, borderColor: borderColor, borderWidth: 1 }}
                >
                  <h4 className="text-lg font-bold text-white mb-3 group-hover:text-[#c9a84c] transition-colors">{monthName}</h4>
                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex justify-between items-end">
                      <div className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Income ({m.tripsCount} trips)</div>
                      <div className="text-emerald-400 font-bold text-sm">{m.totalGel.toLocaleString()} ₾</div>
                    </div>
                    {m.totalCosts > 0 && (
                      <div className="flex justify-between items-end pt-1 border-t border-white/5">
                        <div className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Costs</div>
                        <div className="text-red-400 font-bold text-sm">-{m.totalCosts.toLocaleString()} ₾</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : view === 'calendar' ? (
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

                const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`;
                const income = incomes[dateStr];
                const dayCost = costsByDate[dateStr] || 0;
                const isEditing = editingDate === dateStr;

                // Color the day text based on % of max day in the month
                const ratio = income ? (income.totalGel / monthlyData.maxDayGel) : 0;
                const textColor = income && income.totalGel > 0 
                  ? `rgba(16, 185, 129, ${0.6 + (ratio * 0.4)})` // Bright green for high income
                  : 'rgba(255, 255, 255, 0.4)';

                return (
                  <div 
                    key={dateStr}
                    onClick={() => {
                      if (!isEditing) {
                        setEditingDate(dateStr);
                        setEditValue(income ? income.rawInput : '');
                      }
                    }}
                    className={`relative min-h-[100px] xl:min-h-[120px] p-2 xl:p-3 transition-colors ${
                      isEditing ? 'bg-[#1a2333] z-10 shadow-xl ring-2 ring-[#c9a84c]' : 'bg-[#0a0f1a] hover:bg-[#111827] cursor-pointer'
                    }`}
                  >
                    <span 
                      className={`text-sm font-medium transition-colors`}
                      style={{ color: isEditing ? '#c9a84c' : textColor }}
                    >
                      {date.getDate()}
                    </span>
                    
                    <div className="mt-1 xl:mt-2 h-full relative">
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          inputMode="decimal"
                          value={editValue}
                          onChange={e => {
                            const val = e.target.value.replace(/\./g, ',');
                            setEditValue(val);
                          }}
                          onBlur={() => handleSaveIncome(dateStr, editValue)}
                          onKeyDown={(e) => handleKeyDown(e, dateStr)}
                          placeholder="120, 150"
                          className="absolute z-30 top-0 left-1/2 -translate-x-1/2 w-20 sm:w-full sm:static sm:translate-x-0 bg-[#1a2333] sm:bg-black/30 border border-[#c9a84c] rounded p-1 text-xs xl:text-sm text-center sm:text-left text-white outline-none shadow-lg sm:shadow-none focus:ring-2 focus:ring-[#c9a84c]"
                        />
                      ) : income ? (
                        <div className="flex flex-col gap-0.5 xl:gap-1">
                          <span className="text-[10px] text-white/30 uppercase tracking-wider truncate">{income.rawInput}</span>
                          <div className="flex items-center justify-between mt-0.5 xl:mt-1">
                            <span className="text-[10px] xl:text-xs font-medium text-white/50">{income.tripsCount} trips</span>
                            <span className="text-xs xl:text-sm font-bold" style={{ color: textColor }}>{income.totalGel} ₾</span>
                          </div>
                          {dayCost > 0 && (
                            <div className="flex items-center justify-end mt-0.5">
                              <span className="text-[10px] xl:text-xs font-bold text-red-400">-{dayCost} ₾</span>
                            </div>
                          )}
                        </div>
                      ) : dayCost > 0 ? (
                        <div className="flex flex-col gap-0.5 mt-1">
                          <div className="flex items-center justify-end">
                            <span className="text-[10px] xl:text-xs font-bold text-red-400">-{dayCost} ₾</span>
                          </div>
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
                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-xs text-emerald-500/70 uppercase tracking-wider font-semibold mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-emerald-400">{monthlyData.monthTotalGel.toLocaleString()} ₾</p>
                </div>

                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-red-500/20">
                  <p className="text-xs text-red-500/70 uppercase tracking-wider font-semibold mb-1">Total Costs</p>
                  <p className="text-3xl font-bold text-red-400">{monthlyCostTotal.toLocaleString()} ₾</p>
                </div>
                
                <div className={`bg-[#0a0f1a] rounded-xl p-4 border ${(monthlyData.monthTotalGel - monthlyCostTotal) >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">Net Profit</p>
                  <p className={`text-3xl font-bold ${(monthlyData.monthTotalGel - monthlyCostTotal) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(monthlyData.monthTotalGel - monthlyCostTotal).toLocaleString()} ₾
                  </p>
                </div>

                <div className="bg-[#0a0f1a] rounded-xl p-4 border border-[#c9a84c]/20">
                  <p className="text-xs text-[#c9a84c]/70 uppercase tracking-wider font-semibold mb-1">Total Trips</p>
                  <p className="text-3xl font-bold text-[#c9a84c]">{monthlyData.monthTotalTrips.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setCurrentYear(currentMonth.getFullYear());
                setView('yearly');
              }}
              className="bg-[#111827] border border-white/10 hover:bg-white/5 transition-colors rounded-2xl p-4 text-center text-sm font-semibold text-white/70 hover:text-white"
            >
              ← Back to Yearly View
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-400">{chartData.totalRevenue.toLocaleString()} ₾</p>
            </div>
            <div className="bg-[#111827] border border-red-500/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 mb-1">Total Costs</p>
              <p className="text-2xl font-bold text-red-400">{costsDashboard.totalCosts.toLocaleString()} ₾</p>
            </div>
            <div className={`bg-[#111827] border rounded-2xl p-6 ${costsDashboard.netProfit >= 0 ? 'border-emerald-500/10' : 'border-red-500/10'}`}>
              <p className="text-sm text-white/50 mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${costsDashboard.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {costsDashboard.netProfit.toLocaleString()} ₾
              </p>
            </div>
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 mb-1">Total Trips</p>
              <p className="text-2xl font-bold text-white">{chartData.totalTrips.toLocaleString()}</p>
            </div>
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-[#c9a84c]">{chartData.avgDaily.toLocaleString()} ₾</p>
            </div>
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/50 mb-1">Profit Margin</p>
              <p className={`text-2xl font-bold ${costsDashboard.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {chartData.totalRevenue > 0 ? Math.round((costsDashboard.netProfit / chartData.totalRevenue) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 h-[400px]">
              <h3 className="text-lg font-bold text-white mb-6">Revenue per Month</h3>
              {chartData.monthlyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}₾`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="gel" fill="#10b981" radius={[6, 6, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30">No data available</div>
              )}
            </div>

            {/* Costs by Category Pie Chart */}
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 h-[400px]">
              <h3 className="text-lg font-bold text-white mb-6">Costs by Category</h3>
              {costsDashboard.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costsDashboard.pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    >
                      {costsDashboard.pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      formatter={(value) => [`${Number(value).toLocaleString()} ₾`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30">No cost data available</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 h-[400px]">
              <h3 className="text-lg font-bold text-white mb-6">Average Revenue by Weekday</h3>
              {chartData.weekdayChart.some(d => d.avgGel > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.weekdayChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}₾`} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#c9a84c', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="avgGel" fill="#c9a84c" radius={[6, 6, 0, 0]} name="Average Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30">No data available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

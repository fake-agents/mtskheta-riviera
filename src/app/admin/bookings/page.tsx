'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  priceGel: number;
  status: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [autoConfirm, setAutoConfirm] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchSettings = () => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.auto_confirm_bookings === 'true') {
          setAutoConfirm(true);
        }
      })
      .catch(() => {});
  };

  useEffect(() => { 
    fetchBookings(); 
    fetchSettings();
  }, []);

  const toggleAutoConfirm = async () => {
    const newVal = !autoConfirm;
    setAutoConfirm(newVal);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'auto_confirm_bookings', value: String(newVal) }),
    });
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  };

  const deleteBooking = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchBookings();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Bookings</h2>
          <p className="text-white/50 text-sm mt-1">Manage all customer bookings</p>
        </div>

        {/* Filter tabs and Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-white/70">Auto-Confirm New Bookings</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={autoConfirm} 
                onChange={toggleAutoConfirm} 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${autoConfirm ? 'bg-[#c9a84c]' : 'bg-white/10'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${autoConfirm ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>

          <div className="flex gap-1 bg-[#111827] rounded-xl p-1 border border-white/10">
            {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                  filter === f ? 'bg-[#c9a84c] text-[#0a0f1a]' : 'text-white/50 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg">No bookings found</p>
          <p className="text-sm mt-1">{filter !== 'all' ? `No ${filter} bookings` : 'Bookings will appear here once customers start booking'}</p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Guests</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-white/40 font-mono">
                        {new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        {' – '}
                        {new Date(booking.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{booking.customerName}</p>
                      <p className="text-xs text-white/40">{booking.customerPhone}</p>
                      {booking.customerEmail && <p className="text-xs text-white/30">{booking.customerEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-white">{booking.guestCount}</td>
                    <td className="px-4 py-3 text-[#c9a84c] font-bold">{booking.priceGel} ₾</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                        booking.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="px-3 py-1.5 text-xs bg-emerald-500/15 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-all"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="px-3 py-1.5 text-xs text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

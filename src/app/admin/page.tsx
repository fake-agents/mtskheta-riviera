'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  startTime: string;
  endTime: string;
  priceGel: number;
  status: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.startTime);
    return d >= today && d < tomorrow && b.status !== 'cancelled';
  });

  const upcomingBookings = bookings.filter(b => {
    const d = new Date(b.startTime);
    return d >= tomorrow && b.status !== 'cancelled';
  });

  const totalGuestsToday = todayBookings.reduce((acc, b) => acc + b.guestCount, 0);

  const StatCard = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
    <div className={`rounded-2xl p-6 border ${accent ? 'bg-[#c9a84c]/10 border-[#c9a84c]/30' : 'bg-[#111827] border-white/10'}`}>
      <p className="text-sm text-white/50 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? 'text-[#c9a84c]' : 'text-white'}`}>{value}</p>
    </div>
  );

  return (
    <AdminShell>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-white/50 text-sm mt-1">Overview of your boat booking activity</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Today's Bookings" value={todayBookings.length} accent />
            <StatCard label="Total Guests Today" value={totalGuestsToday} />
            <StatCard label="Upcoming Bookings" value={upcomingBookings.length} />
            <StatCard label="Total All-Time" value={bookings.filter(b => b.status !== 'cancelled').length} />
          </div>

          {/* Today's schedule */}
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today&apos;s Schedule</h3>
            {todayBookings.length === 0 ? (
              <p className="text-white/40 text-sm py-8 text-center">No bookings for today</p>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between bg-[#0a0f1a] rounded-xl px-4 py-3 border border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-mono text-[#c9a84c] font-bold">
                        {new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{booking.customerName}</p>
                        <p className="text-xs text-white/40">{booking.customerPhone} • {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#c9a84c]">{booking.priceGel} ₾</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' :
                        booking.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                        'bg-amber-500/15 text-amber-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminShell>
  );
}

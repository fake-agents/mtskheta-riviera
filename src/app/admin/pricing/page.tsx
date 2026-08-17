'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface PricingTier {
  id: number;
  minGuests: number;
  maxGuests: number;
  priceGel: number;
}

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ minGuests: 1, maxGuests: 5, priceGel: 150 });
  const [newTier, setNewTier] = useState({ minGuests: 1, maxGuests: 5, priceGel: 150 });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTiers = () => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTiers(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchTiers(); }, []);

  const addTier = async () => {
    await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTier),
    });
    setShowAddForm(false);
    setNewTier({ minGuests: 1, maxGuests: 5, priceGel: 150 });
    fetchTiers();
  };

  const updateTier = async (id: number) => {
    await fetch('/api/pricing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm }),
    });
    setEditingId(null);
    fetchTiers();
  };

  const deleteTier = async (id: number) => {
    if (!confirm('Remove this pricing tier?')) return;
    await fetch(`/api/pricing?id=${id}`, { method: 'DELETE' });
    fetchTiers();
  };

  const startEdit = (tier: PricingTier) => {
    setEditingId(tier.id);
    setEditForm({ minGuests: tier.minGuests, maxGuests: tier.maxGuests, priceGel: tier.priceGel });
  };

  const InputField = ({ label, value, onChange, min = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div>
      <label className="block text-xs text-white/40 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-[#0a0f1a] border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-all"
      />
    </div>
  );

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Pricing</h2>
          <p className="text-white/50 text-sm mt-1">Configure pricing based on guest count</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#d4b85d] text-[#0a0f1a] font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
        >
          + Add Tier
        </button>
      </div>

      {/* Add new tier form */}
      {showAddForm && (
        <div className="bg-[#111827] rounded-2xl border border-[#c9a84c]/30 p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider mb-4">New Pricing Tier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <InputField label="Min Guests" value={newTier.minGuests} onChange={(v) => setNewTier({ ...newTier, minGuests: v })} />
            <InputField label="Max Guests" value={newTier.maxGuests} onChange={(v) => setNewTier({ ...newTier, maxGuests: v })} />
            <InputField label="Price (GEL)" value={newTier.priceGel} onChange={(v) => setNewTier({ ...newTier, priceGel: v })} />
          </div>
          <div className="flex gap-2">
            <button onClick={addTier} className="px-4 py-2 bg-[#c9a84c] text-[#0a0f1a] font-bold text-sm rounded-lg transition-all hover:bg-[#d4b85d]">
              Save
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-white/50 text-sm hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tiers.length === 0 ? (
        <div className="text-center py-20 text-white/40">
          <p className="text-lg">No pricing tiers configured</p>
          <p className="text-sm mt-1">Click &quot;+ Add Tier&quot; to create your first pricing tier</p>
        </div>
      ) : (
        <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Guest Range</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Price (GEL)</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {editingId === tier.id ? (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          <input type="number" min={1} value={editForm.minGuests} onChange={(e) => setEditForm({ ...editForm, minGuests: parseInt(e.target.value) || 0 })} className="w-16 bg-[#0a0f1a] border border-white/15 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]" />
                          <span className="text-white/30">–</span>
                          <input type="number" min={1} value={editForm.maxGuests} onChange={(e) => setEditForm({ ...editForm, maxGuests: parseInt(e.target.value) || 0 })} className="w-16 bg-[#0a0f1a] border border-white/15 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]" />
                          <span className="text-white/30 text-xs">persons</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input type="number" min={0} value={editForm.priceGel} onChange={(e) => setEditForm({ ...editForm, priceGel: parseInt(e.target.value) || 0 })} className="w-24 bg-[#0a0f1a] border border-white/15 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#c9a84c]" />
                          <span className="text-[#c9a84c]">₾</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => updateTier(tier.id)} className="px-3 py-1.5 text-xs bg-[#c9a84c]/15 text-[#c9a84c] rounded-lg hover:bg-[#c9a84c]/25 transition-all">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-white/30 hover:text-white rounded-lg transition-all">Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{tier.minGuests} – {tier.maxGuests}</span>
                        <span className="text-white/40 text-xs ml-2">persons</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#c9a84c] font-bold text-lg">{tier.priceGel}</span>
                        <span className="text-[#c9a84c]/60 ml-1">₾</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => startEdit(tier)} className="px-3 py-1.5 text-xs text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">Edit</button>
                          <button onClick={() => deleteTier(tier.id)} className="px-3 py-1.5 text-xs text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview */}
      {tiers.length > 0 && (
        <div className="mt-8 bg-[#111827] rounded-2xl border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Preview (as customers see it)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="bg-[#0a0f1a] rounded-xl p-4 border border-[#c9a84c]/20 text-center">
                <p className="text-xs text-white/50 mb-1">
                  {tier.minGuests === tier.maxGuests ? `${tier.minGuests} person` : `${tier.minGuests}–${tier.maxGuests} persons`}
                </p>
                <p className="text-2xl font-bold text-[#c9a84c]">{tier.priceGel} <span className="text-sm font-normal">₾</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Category {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#f43f5e',
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#ef4444');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/cost-categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cost-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (res.ok) {
        setNewName('');
        setNewColor('#ef4444');
        fetchCategories();
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Costs using it will become invalid.')) return;
    try {
      await fetch(`/api/admin/cost-categories?id=${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch {}
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Cost Categories</h2>
        <p className="text-white/50 text-sm mt-1">Configure expense categories used when logging daily costs</p>
      </div>

      {/* Add New Category */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Add New Category</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2 block">Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Fuel, Maintenance..."
              className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-[#c9a84c] focus:border-transparent transition-all placeholder:text-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${newColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111827] scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || saving}
            className="px-6 py-3 bg-[#c9a84c] hover:bg-[#d4b85d] text-[#0a0f1a] font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {saving ? 'Adding...' : '+ Add Category'}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Existing Categories</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-white/30 text-sm py-8 text-center">No categories yet. Add your first one above!</p>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between bg-[#0a0f1a] rounded-xl px-5 py-4 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-md shadow-lg" style={{ backgroundColor: cat.color }} />
                  <span className="text-white font-medium">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-400/50 hover:text-red-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all px-3 py-1 rounded-lg hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

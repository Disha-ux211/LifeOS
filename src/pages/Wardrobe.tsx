import { useState } from 'react';
import { Plus, Trash2, Shirt } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';

type Category = 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear';

type WardrobeItem = {
  id: string;
  name: string;
  category: Category;
  color: string;
  brand: string;
  notes: string;
  created_at: string;
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'dress', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'outerwear', label: 'Outerwear' },
];

export default function Wardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>(() => loadList<WardrobeItem>(STORAGE_KEYS.wardrobe));
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', category: 'top' as Category, color: '', brand: '', notes: '' });

  const persist = (next: WardrobeItem[]) => {
    setItems(next);
    saveList(STORAGE_KEYS.wardrobe, next);
  };

  const saveItem = () => {
    if (!form.name.trim()) return;
    persist([{ id: uid(), name: form.name.trim(), category: form.category, color: form.color, brand: form.brand, notes: form.notes, created_at: nowISO() }, ...items]);
    setShowAdd(false);
    setForm({ name: '', category: 'top', color: '', brand: '', notes: '' });
  };

  const deleteItem = (id: string) => {
    persist(items.filter((i) => i.id !== id));
  };

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);
  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.value] = items.filter((i) => i.category === c.value).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{items.length} item{items.length !== 1 ? 's' : ''} in your wardrobe</p>
        <button onClick={() => { setForm({ name: '', category: 'top', color: '', brand: '', notes: '' }); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('all')}
          className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all', activeCategory === 'all' ? 'bg-ink-800 text-cream-50' : 'bg-white text-ink-500 border border-cream-200 hover:bg-cream-50')}>
          All ({items.length})
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setActiveCategory(c.value)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all', activeCategory === c.value ? 'bg-ink-800 text-cream-50' : 'bg-white text-ink-500 border border-cream-200 hover:bg-cream-50')}>
            {c.label} ({counts[c.value] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Shirt} title="Your wardrobe is empty"
          message="Add clothing items with names, colors, and brands to organize your wardrobe."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Item</button>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card overflow-hidden group hover:shadow-hover transition-all">
              <div className="aspect-square overflow-hidden bg-cream-100 flex items-center justify-center">
                <Shirt size={32} className="text-ink-300" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate">{item.name || 'Unnamed'}</p>
                    <p className="text-xs text-ink-400 capitalize">{item.category}</p>
                  </div>
                  <button onClick={() => setDeleteId(item.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                {(item.color || item.brand) && (
                  <p className="text-xs text-ink-400 mt-1">{[item.color, item.brand].filter(Boolean).join(' - ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Wardrobe Item">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input type="text" placeholder="Blue cotton shirt" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="input">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Color</label>
              <input type="text" placeholder="Blue" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Brand</label>
              <input type="text" placeholder="Zara" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input type="text" placeholder="Worn often, favorite piece..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveItem} className="btn-primary" disabled={!form.name.trim()}>Add Item</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteItem(deleteId)} title="Delete Item" message="This wardrobe item will be permanently deleted." />
    </div>
  );
}

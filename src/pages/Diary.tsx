import { useState } from 'react';
import { Plus, Search, Trash2, BookHeart, X, Save, Calendar as CalIcon } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { todayISO, formatDate, cn } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';

type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

type DiaryEntry = {
  id: string;
  entry_date: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const MOODS: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-sage-100 text-sage-600' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-cream-200 text-ink-600' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-cream-100 text-ink-500' },
  { value: 'low', label: 'Low', emoji: '😕', color: 'bg-lavender-100 text-lavender-600' },
  { value: 'bad', label: 'Bad', emoji: '😢', color: 'bg-blush-100 text-blush-600' },
];

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => loadList<DiaryEntry>(STORAGE_KEYS.diary));
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    entry_date: todayISO(), title: '', content: '', mood: 'good' as Mood, tags: '',
  });

  const persist = (next: DiaryEntry[]) => {
    setEntries(next);
    saveList(STORAGE_KEYS.diary, next);
  };

  const filtered = entries.filter((e) => {
    if (search) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.entry_date.localeCompare(a.entry_date));

  const openNew = () => {
    setForm({ entry_date: todayISO(), title: '', content: '', mood: 'good', tags: '' });
    setEditId(null);
    setShowEditor(true);
  };

  const openEdit = (entry: DiaryEntry) => {
    setForm({ entry_date: entry.entry_date, title: entry.title, content: entry.content, mood: entry.mood, tags: entry.tags.join(', ') });
    setEditId(entry.id);
    setShowEditor(true);
  };

  const saveEntry = () => {
    if (!form.content.trim() && !form.title.trim()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = { entry_date: form.entry_date, title: form.title, content: form.content, mood: form.mood, tags };

    if (editId) {
      persist(entries.map((e) => (e.id === editId ? { ...e, ...payload, updated_at: nowISO() } : e)));
    } else {
      persist([{ id: uid(), ...payload, created_at: nowISO(), updated_at: nowISO() }, ...entries]);
    }
    setShowEditor(false);
    setEditId(null);
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input type="text" placeholder="Search memories..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"><X size={14} /></button>}
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 justify-center"><Plus size={18} /> New Entry</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookHeart} title={search ? 'No memories found' : 'Your diary is empty'}
          message={search ? 'Try a different search.' : "Capture today's moments, thoughts, and feelings."}
          action={<button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Write Entry</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((entry) => {
            const mood = MOODS.find((m) => m.value === entry.mood)!;
            return (
              <div key={entry.id} className="card overflow-hidden group hover:shadow-hover transition-all">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-base', mood.color)}>{mood.emoji}</span>
                      <div>
                        <h3 className="font-serif font-semibold text-ink-800">{entry.title || 'Untitled'}</h3>
                        <p className="text-xs text-ink-400 flex items-center gap-1"><CalIcon size={10} /> {formatDate(entry.entry_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(entry)} className="text-xs text-ink-400 hover:text-ink-700 px-2 py-1 rounded transition-colors">Edit</button>
                      <button onClick={() => setDeleteId(entry.id)} className="text-ink-400 hover:text-blush-500 p-1 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-ink-600 line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => <span key={tag} className="badge bg-blush-50 text-blush-500">#{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editId ? 'Edit Memory' : 'New Memory'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Mood</label>
              <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value as Mood })} className="input">
                {MOODS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input type="text" placeholder="A memorable day..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Remarks</label>
            <textarea placeholder="What happened today? How did you feel?" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="input resize-none" />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input type="text" placeholder="travel, family, milestone" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowEditor(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveEntry} className="btn-primary flex items-center gap-2" disabled={!form.title.trim() && !form.content.trim()}>
              <Save size={16} /> {editId ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteEntry(deleteId)} title="Delete Memory" message="This diary entry will be permanently deleted." />
    </div>
  );
}

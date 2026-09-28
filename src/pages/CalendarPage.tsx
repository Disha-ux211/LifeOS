import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { getMonthDays, todayISO, formatDate, cn } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

type EventType = 'birthday' | 'exam' | 'assignment' | 'college' | 'personal' | 'important';

type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: EventType;
  color: string;
  created_at: string;
};

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'personal', label: 'Personal', color: '#c4b5a0' },
  { value: 'important', label: 'Important', color: '#d88a8a' },
  { value: 'birthday', label: 'Birthday', color: '#d4a0c0' },
  { value: 'exam', label: 'Exam', color: '#d88a8a' },
  { value: 'assignment', label: 'Assignment', color: '#b39dcd' },
  { value: 'college', label: 'College', color: '#9ab48d' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadList<CalendarEvent>(STORAGE_KEYS.events));
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', event_date: todayISO(), event_type: 'personal' as EventType, color: '#c4b5a0',
  });

  const persist = (next: CalendarEvent[]) => {
    setEvents(next);
    saveList(STORAGE_KEYS.events, next);
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const days = getMonthDays(year, month);
  const today = todayISO();

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    (acc[e.event_date] ??= []).push(e);
    return acc;
  }, {});

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));

  const openAddForDate = (date: string) => {
    setForm({ title: '', description: '', event_date: date, event_type: 'personal', color: '#c4b5a0' });
    setSelectedDate(date);
    setShowAdd(true);
  };

  const saveEvent = () => {
    if (!form.title.trim()) return;
    persist([{ id: uid(), title: form.title.trim(), description: form.description, event_date: form.event_date, event_type: form.event_type, color: form.color, created_at: nowISO() }, ...events]);
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => {
    persist(events.filter((e) => e.id !== id));
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl border border-cream-200 hover:bg-cream-100 flex items-center justify-center transition-colors"><ChevronLeft size={18} className="text-ink-500" /></button>
          <h3 className="text-lg font-serif font-semibold text-ink-800 w-40 text-center">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl border border-cream-200 hover:bg-cream-100 flex items-center justify-center transition-colors"><ChevronRight size={18} className="text-ink-500" /></button>
        </div>
        <button onClick={() => { setForm({ title: '', description: '', event_date: today, event_type: 'personal', color: '#c4b5a0' }); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Event</button>
      </div>

      <div className="card p-3 md:p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d) => <div key={d} className="text-center text-xs font-medium text-ink-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={i} className="aspect-square rounded-lg" />;
            const dayEvents = eventsByDate[date] ?? [];
            const isToday = date === today;
            const isSelected = date === selectedDate;
            return (
              <button key={date} onClick={() => setSelectedDate(date)} onDoubleClick={() => openAddForDate(date)}
                className={cn('aspect-square rounded-lg p-1.5 flex flex-col items-center gap-0.5 transition-all border',
                  isSelected ? 'border-ink-400 bg-cream-100' : 'border-transparent hover:bg-cream-50',
                  isToday && !isSelected && 'bg-blush-50 border-blush-100')}>
                <span className={cn('text-xs font-medium', isToday ? 'text-blush-600 font-bold' : 'text-ink-600')}>{parseInt(date.split('-')[2])}</span>
                <div className="flex flex-wrap gap-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((e) => <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-ink-800">{formatDate(selectedDate)}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => openAddForDate(selectedDate)} className="btn-ghost text-xs flex items-center gap-1"><Plus size={14} /> Add</button>
              <button onClick={() => setSelectedDate(null)} className="text-ink-400 hover:text-ink-700"><X size={16} /></button>
            </div>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">Nothing scheduled. Double-click a day to add an event.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 group">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-700">{e.title}</p>
                    {e.description && <p className="text-xs text-ink-400 mt-0.5">{e.description}</p>}
                  </div>
                  <span className="badge bg-cream-200 text-ink-500 capitalize">{e.event_type}</span>
                  <button onClick={() => setDeleteId(e.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 px-1">
        {EVENT_TYPES.map((t) => (
          <div key={t.value} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
            <span className="text-xs text-ink-500">{t.label}</span>
          </div>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Event">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input autoFocus type="text" placeholder="Event name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input type="text" placeholder="Add details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.event_type} onChange={(e) => {
                const t = EVENT_TYPES.find((t) => t.value === e.target.value);
                setForm({ ...form, event_type: e.target.value as EventType, color: t?.color ?? form.color });
              }} className="input">
                {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((t) => (
                <button key={t.value} onClick={() => setForm({ ...form, color: t.color, event_type: t.value })}
                  className={cn('w-8 h-8 rounded-lg transition-all', form.color === t.color && 'ring-2 ring-offset-2 ring-ink-400 scale-110')}
                  style={{ backgroundColor: t.color }} title={t.label} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveEvent} className="btn-primary" disabled={!form.title.trim()}>Create Event</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteEvent(deleteId)} title="Delete Event" message="This event will be permanently deleted." />
    </div>
  );
}

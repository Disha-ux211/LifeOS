import { useState } from 'react';
import { Plus, Trash2, Bell, BellOff, Check, Clock, Calendar as CalIcon } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { todayISO, formatDate, formatTime, isOverdue, cn } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';

type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly';

type Reminder = {
  id: string;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  repeat_option: RepeatOption;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

const REPEAT_OPTIONS: { value: RepeatOption; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(() => loadList<Reminder>(STORAGE_KEYS.reminders));
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const [form, setForm] = useState({
    title: '', description: '', reminder_date: todayISO(), reminder_time: '09:00', repeat_option: 'none' as RepeatOption,
  });

  const persist = (next: Reminder[]) => {
    setReminders(next);
    saveList(STORAGE_KEYS.reminders, next);
  };

  const requestNotifications = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
    }
  };

  const saveReminder = () => {
    if (!form.title.trim()) return;
    persist([{ id: uid(), title: form.title.trim(), description: form.description, reminder_date: form.reminder_date, reminder_time: form.reminder_time, repeat_option: form.repeat_option, completed: false, created_at: nowISO(), updated_at: nowISO() }, ...reminders]);
    setShowAdd(false);
  };

  const toggleComplete = (r: Reminder) => {
    persist(reminders.map((p) => (p.id === r.id ? { ...p, completed: !p.completed, updated_at: nowISO() } : p)));
  };

  const deleteReminder = (id: string) => {
    persist(reminders.filter((p) => p.id !== id));
  };

  const today = todayISO();
  const upcoming = reminders.filter((r) => !r.completed && r.reminder_date >= today).sort((a, b) => a.reminder_date.localeCompare(b.reminder_date));
  const completed = reminders.filter((r) => r.completed);
  const overdue = reminders.filter((r) => !r.completed && isOverdue(r.reminder_date));

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {notifPermission === 'granted' ? (
            <span className="badge bg-sage-100 text-sage-600"><Bell size={12} /> Notifications on</span>
          ) : notifPermission === 'denied' ? (
            <span className="badge bg-blush-100 text-blush-600"><BellOff size={12} /> Blocked</span>
          ) : notifPermission === 'unsupported' ? (
            <span className="badge bg-cream-200 text-ink-500"><BellOff size={12} /> Unsupported</span>
          ) : (
            <button onClick={requestNotifications} className="btn-outline text-xs flex items-center gap-1.5"><Bell size={14} /> Enable notifications</button>
          )}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 justify-center"><Plus size={18} /> New Reminder</button>
      </div>

      {overdue.length > 0 && (
        <div className="card p-4 border-blush-200 bg-blush-50/50">
          <h3 className="text-xs font-semibold text-blush-600 uppercase tracking-wide mb-3">Overdue</h3>
          <div className="space-y-2">
            {overdue.map((r) => <ReminderRow key={r.id} reminder={r} onToggle={toggleComplete} onDelete={setDeleteId} />)}
          </div>
        </div>
      )}

      {upcoming.length === 0 && completed.length === 0 ? (
        <EmptyState icon={Bell} title="No reminders yet" message="Set reminders for important dates, tasks, or events."
          action={<button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Reminder</button>} />
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Upcoming</h3>
              <div className="space-y-2">
                {upcoming.map((r) => <ReminderRow key={r.id} reminder={r} onToggle={toggleComplete} onDelete={setDeleteId} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Completed</h3>
              <div className="space-y-2">
                {completed.map((r) => <ReminderRow key={r.id} reminder={r} onToggle={toggleComplete} onDelete={setDeleteId} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Reminder">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input autoFocus type="text" placeholder="What to remember?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input type="text" placeholder="Add details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.reminder_date} onChange={(e) => setForm({ ...form, reminder_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Time</label>
              <input type="time" value={form.reminder_time} onChange={(e) => setForm({ ...form, reminder_time: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Repeat</label>
            <select value={form.repeat_option} onChange={(e) => setForm({ ...form, repeat_option: e.target.value as RepeatOption })} className="input">
              {REPEAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveReminder} className="btn-primary" disabled={!form.title.trim()}>Create</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteReminder(deleteId)} title="Delete Reminder" message="This reminder will be permanently deleted." />
    </div>
  );
}

function ReminderRow({ reminder, onToggle, onDelete }: { reminder: Reminder; onToggle: (r: Reminder) => void; onDelete: (id: string) => void }) {
  return (
    <div className={cn('card p-3.5 flex items-center gap-3 group hover:shadow-hover transition-all', reminder.completed && 'opacity-50')}>
      <button onClick={() => onToggle(reminder)}
        className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all', reminder.completed ? 'bg-ink-800 border-ink-800' : 'border-cream-300 hover:border-ink-500')}>
        {reminder.completed && <Check size={12} className="text-cream-50" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', reminder.completed ? 'line-through text-ink-400' : 'text-ink-800')}>{reminder.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-ink-400 flex items-center gap-1"><CalIcon size={10} /> {formatDate(reminder.reminder_date)}</span>
          <span className="text-xs text-ink-400 flex items-center gap-1"><Clock size={10} /> {formatTime(reminder.reminder_time)}</span>
          {reminder.repeat_option !== 'none' && <span className="badge bg-sage-100 text-sage-600 capitalize">{reminder.repeat_option}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(reminder.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 p-1 rounded transition-all"><Trash2 size={14} /></button>
    </div>
  );
}

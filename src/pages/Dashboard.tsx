import { useState, useEffect } from 'react';
import {
  BookHeart, CheckSquare, Calendar, Bell, FolderOpen, Plus, ArrowRight,
  Clock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import type { View } from '@/lib/supabase';
import { todayISO, formatDateShort, getGreeting, formatTime, isOverdue } from '@/lib/utils';
import { loadList, STORAGE_KEYS } from '@/lib/storage';

type Props = { onNavigate: (v: View) => void };

type Task = { id: string; title: string; due_date: string | null; priority: string; completed: boolean; category: string; description: string; created_at: string; updated_at: string; };
type CalendarEvent = { id: string; title: string; event_date: string; event_type: string; color: string; description: string; created_at: string; };
type Reminder = { id: string; title: string; reminder_date: string; reminder_time: string; repeat_option: string; completed: boolean; description: string; created_at: string; };
type DiaryEntry = { id: string; entry_date: string; title: string; content: string; mood: string; tags: string[]; created_at: string; updated_at: string; };

export default function Dashboard({ onNavigate }: Props) {
  const [tasks, setTasks] = useState<Task[]>(() => loadList<Task>(STORAGE_KEYS.tasks));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadList<CalendarEvent>(STORAGE_KEYS.events));
  const [reminders, setReminders] = useState<Reminder[]>(() => loadList<Reminder>(STORAGE_KEYS.reminders));
  const [diary, setDiary] = useState<DiaryEntry[]>(() => loadList<DiaryEntry>(STORAGE_KEYS.diary));
  const [profile, setProfile] = useState<{ display_name: string }>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      return raw ? JSON.parse(raw) : { display_name: 'Disha' };
    } catch { return { display_name: 'Disha' }; }
  });

  // Re-read from localStorage whenever the dashboard mounts (handles navigation back)
  useEffect(() => {
    setTasks(loadList<Task>(STORAGE_KEYS.tasks));
    setEvents(loadList<CalendarEvent>(STORAGE_KEYS.events));
    setReminders(loadList<Reminder>(STORAGE_KEYS.reminders));
    setDiary(loadList<DiaryEntry>(STORAGE_KEYS.diary));
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      if (raw) setProfile(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const today = todayISO();
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayTasks = pendingTasks.filter((t) => t.due_date === today);
  const upcomingTasks = pendingTasks.filter((t) => t.due_date && t.due_date > today).slice(0, 3);
  const upcomingEvents = events.filter((e) => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date)).slice(0, 5);
  const upcomingReminders = reminders.filter((r) => !r.completed && r.reminder_date >= today).sort((a, b) => a.reminder_date.localeCompare(b.reminder_date)).slice(0, 5);
  const recentDiary = [...diary].sort((a, b) => b.entry_date.localeCompare(a.entry_date)).slice(0, 3);
  const completedCount = tasks.filter((t) => t.completed).length;

  const quickActions = [
    { label: 'New Diary', icon: BookHeart, view: 'diary' as View, color: 'bg-blush-100 text-blush-600' },
    { label: 'Add Task', icon: CheckSquare, view: 'tasks' as View, color: 'bg-sage-100 text-sage-600' },
    { label: 'Add Event', icon: Calendar, view: 'calendar' as View, color: 'bg-lavender-100 text-lavender-600' },
    { label: 'Add Reminder', icon: Bell, view: 'reminders' as View, color: 'bg-cream-200 text-ink-600' },
    { label: 'Upload File', icon: FolderOpen, view: 'files' as View, color: 'bg-blush-100 text-blush-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in md:pt-0 pt-2">
      <div className="card p-6 bg-gradient-to-br from-cream-100 to-blush-50 border-cream-200">
        <p className="text-sm text-ink-400 mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-2xl font-serif font-bold text-ink-800">
          {getGreeting()}, {profile.display_name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-ink-500 mt-2">
          {todayTasks.length > 0
            ? `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today.`
            : 'No tasks due today. Enjoy the calm.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} onClick={() => onNavigate(action.view)}
              className="card-solid px-4 py-2.5 flex items-center gap-2 hover:shadow-hover transition-all active:scale-[0.98] group">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${action.color}`}>
                <Icon size={15} />
              </span>
              <span className="text-sm font-medium text-ink-700">{action.label}</span>
              <Plus size={14} className="text-ink-300 group-hover:text-ink-500 transition-colors" />
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-ink-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-sage-500" /> Today's Tasks
            </h3>
            <button onClick={() => onNavigate('tasks')} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 transition-colors">All <ArrowRight size={12} /></button>
          </div>
          {todayTasks.length === 0 && upcomingTasks.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No pending tasks. You're all caught up.</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 3).map((t) => <TaskMini key={t.id} task={t} />)}
              {upcomingTasks.slice(0, 2).map((t) => <TaskMini key={t.id} task={t} />)}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-ink-800 flex items-center gap-2">
              <Calendar size={18} className="text-lavender-500" /> Upcoming Events
            </h3>
            <button onClick={() => onNavigate('calendar')} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 transition-colors">Calendar <ArrowRight size={12} /></button>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No events in the coming days.</p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-50 transition-colors">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate">{e.title}</p>
                    <p className="text-xs text-ink-400">{formatDateShort(e.event_date)}</p>
                  </div>
                  <span className="badge bg-cream-100 text-ink-500 capitalize">{e.event_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-ink-800 flex items-center gap-2">
              <Bell size={18} className="text-blush-400" /> Reminders
            </h3>
            <button onClick={() => onNavigate('reminders')} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 transition-colors">All <ArrowRight size={12} /></button>
          </div>
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No upcoming reminders.</p>
          ) : (
            <div className="space-y-2">
              {upcomingReminders.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-50 transition-colors">
                  <Clock size={14} className="text-ink-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-700 truncate">{r.title}</p>
                    <p className="text-xs text-ink-400">{formatDateShort(r.reminder_date)} at {formatTime(r.reminder_time)}</p>
                  </div>
                  {r.repeat_option !== 'none' && <span className="badge bg-sage-100 text-sage-600 capitalize">{r.repeat_option}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-semibold text-ink-800 flex items-center gap-2">
              <BookHeart size={18} className="text-blush-400" /> Recent Memories
            </h3>
            <button onClick={() => onNavigate('diary')} className="text-xs text-ink-400 hover:text-ink-700 flex items-center gap-1 transition-colors">Diary <ArrowRight size={12} /></button>
          </div>
          {recentDiary.length === 0 ? (
            <p className="text-sm text-ink-400 py-6 text-center">No diary entries yet. Start writing today.</p>
          ) : (
            <div className="space-y-2">
              {recentDiary.map((d) => (
                <button key={d.id} onClick={() => onNavigate('diary')} className="w-full text-left p-2.5 rounded-xl hover:bg-cream-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink-700 truncate">{d.title || 'Untitled memory'}</p>
                    <span className="text-xs text-ink-400 shrink-0 ml-2">{formatDateShort(d.entry_date)}</span>
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5 line-clamp-1">{d.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskMini({ task }: { task: Task }) {
  const priorityColors: Record<string, string> = {
    high: 'bg-blush-100 text-blush-600',
    medium: 'bg-cream-200 text-ink-500',
    low: 'bg-sage-100 text-sage-600',
  };
  const overdue = isOverdue(task.due_date);
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cream-50 transition-colors">
      {overdue ? <AlertCircle size={14} className="text-blush-500 shrink-0" /> : <CheckCircle2 size={14} className="text-ink-300 shrink-0" />}
      <span className="text-sm text-ink-700 flex-1 truncate">{task.title}</span>
      <span className={`badge ${priorityColors[task.priority] ?? 'bg-cream-100 text-ink-500'} capitalize`}>{task.priority}</span>
      {task.due_date && <span className="text-xs text-ink-400 shrink-0">{formatDateShort(task.due_date)}</span>}
    </div>
  );
}

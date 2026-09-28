import { useState } from 'react';
import { Plus, Search, Trash2, Check, Flag, Calendar as CalIcon, X, CheckSquare, AlertCircle } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { cn, todayISO, isOverdue, formatDateShort } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';

type Priority = 'low' | 'medium' | 'high';

type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: Priority;
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

type Filter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
const CATEGORIES = ['general', 'work', 'study', 'personal', 'health', 'errands'];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadList<Task>(STORAGE_KEYS.tasks));
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', due_date: '', priority: 'medium' as Priority, category: 'general',
  });

  const persist = (next: Task[]) => {
    setTasks(next);
    saveList(STORAGE_KEYS.tasks, next);
  };

  const openAdd = () => {
    setForm({ title: '', description: '', due_date: '', priority: 'medium', category: 'general' });
    setEditId(null);
    setShowAdd(true);
  };

  const openEdit = (task: Task) => {
    setForm({ title: task.title, description: task.description, due_date: task.due_date ?? '', priority: task.priority, category: task.category });
    setEditId(task.id);
    setShowAdd(true);
  };

  const saveTask = () => {
    if (!form.title.trim()) return;
    const payload = { title: form.title.trim(), description: form.description, due_date: form.due_date || null, priority: form.priority, category: form.category };
    if (editId) {
      persist(tasks.map((t) => (t.id === editId ? { ...t, ...payload, updated_at: nowISO() } : t)));
    } else {
      persist([{ id: uid(), ...payload, completed: false, created_at: nowISO(), updated_at: nowISO() }, ...tasks]);
    }
    setShowAdd(false);
    setEditId(null);
  };

  const toggleTask = (task: Task) => {
    persist(tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed, updated_at: nowISO() } : t)));
  };

  const deleteTask = (id: string) => {
    persist(tasks.filter((t) => t.id !== id));
  };

  const today = todayISO();
  const filtered = tasks.filter((t) => {
    if (filter === 'today' && t.due_date !== today) return false;
    if (filter === 'upcoming' && (!t.due_date || t.due_date <= today || t.completed)) return false;
    if (filter === 'overdue' && (!isOverdue(t.due_date) || t.completed)) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (filter === 'all' && t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: tasks.filter((t) => !t.completed).length,
    today: tasks.filter((t) => t.due_date === today && !t.completed).length,
    upcoming: tasks.filter((t) => t.due_date && t.due_date > today && !t.completed).length,
    overdue: tasks.filter((t) => isOverdue(t.due_date) && !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'Pending', count: counts.all },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'completed', label: 'Done', count: counts.completed },
  ];

  const priorityColors: Record<string, string> = {
    high: 'bg-blush-100 text-blush-600',
    medium: 'bg-cream-200 text-ink-500',
    low: 'bg-sage-100 text-sage-600',
  };

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"><X size={14} /></button>}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 justify-center"><Plus size={18} /> New Task</button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all', filter === f.id ? 'bg-ink-800 text-cream-50' : 'bg-white text-ink-500 border border-cream-200 hover:bg-cream-50')}>
            {f.label}<span className={cn('ml-1.5 text-xs', filter === f.id ? 'text-cream-300' : 'text-ink-400')}>{f.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title={filter === 'completed' ? 'No completed tasks' : 'No tasks here'}
          message={filter === 'completed' ? 'Completed tasks will appear here.' : 'Create a task to get started.'}
          action={<button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Task</button>} />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div key={task.id} className={cn('card p-4 flex items-start gap-3 group hover:shadow-hover transition-all', task.completed && 'opacity-50')}>
              <button onClick={() => toggleTask(task)}
                className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all', task.completed ? 'bg-ink-800 border-ink-800' : 'border-cream-300 hover:border-ink-500')}>
                {task.completed && <Check size={12} className="text-cream-50" />}
              </button>
              <button onClick={() => openEdit(task)} className="flex-1 min-w-0 text-left">
                <p className={cn('text-sm font-medium', task.completed ? 'line-through text-ink-400' : 'text-ink-800')}>{task.title}</p>
                {task.description && <p className="text-xs text-ink-400 mt-1 line-clamp-2">{task.description}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={cn('badge', priorityColors[task.priority], 'capitalize')}><Flag size={10} /> {task.priority}</span>
                  <span className="badge bg-cream-100 text-ink-500">{task.category}</span>
                  {task.due_date && (
                    <span className={cn('badge', isOverdue(task.due_date) && !task.completed ? 'bg-blush-100 text-blush-600' : 'bg-cream-100 text-ink-500')}>
                      <CalIcon size={10} /> {formatDateShort(task.due_date)}
                    </span>
                  )}
                  {isOverdue(task.due_date) && !task.completed && <span className="badge bg-blush-50 text-blush-500"><AlertCircle size={10} /> Overdue</span>}
                </div>
              </button>
              <button onClick={() => setDeleteId(task.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 p-1 rounded transition-all"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editId ? 'Edit Task' : 'New Task'}>
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input autoFocus type="text" placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && saveTask()} className="input" />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea placeholder="Add details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={saveTask} className="btn-primary" disabled={!form.title.trim()}>{editId ? 'Save' : 'Add Task'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteTask(deleteId)} title="Delete Task" message="This task will be permanently deleted." />
    </div>
  );
}

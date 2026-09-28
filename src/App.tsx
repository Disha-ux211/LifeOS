import { useState } from 'react';
import {
  LayoutDashboard, BookHeart, CheckSquare, Calendar, Bell, FolderOpen,
  Sparkles, Shirt, Settings, LifeBuoy,
} from 'lucide-react';
import type { View } from '@/lib/supabase';
import { cn, initials } from '@/lib/utils';
import { loadValue, STORAGE_KEYS } from '@/lib/storage';
import Dashboard from '@/pages/Dashboard';
import Diary from '@/pages/Diary';
import Tasks from '@/pages/Tasks';
import CalendarPage from '@/pages/CalendarPage';
import Reminders from '@/pages/Reminders';
import Files from '@/pages/Files';
import Assistant from '@/pages/Assistant';
import Wardrobe from '@/pages/Wardrobe';
import SettingsPage from '@/pages/SettingsPage';

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'diary', label: 'Diary', icon: BookHeart },
  { id: 'tasks', label: 'To-Do', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
];

const MOBILE_NAV: View[] = ['dashboard', 'diary', 'tasks', 'calendar', 'reminders'];

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const profile = loadValue<{ display_name: string }>(STORAGE_KEYS.profile, { display_name: 'Disha' });

  const activeLabel = NAV_ITEMS.find((n) => n.id === view)?.label ?? '';

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-cream-100/60 border-r border-cream-200 shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-9 h-9 rounded-xl bg-ink-800 flex items-center justify-center">
            <LifeBuoy size={20} className="text-cream-50" />
          </div>
          <div>
            <h1 className="text-base font-serif font-bold text-ink-800 leading-tight">LifeOS</h1>
            <p className="text-[11px] text-ink-400 leading-tight">Your life companion</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn('nav-item w-full', active ? 'nav-item-active' : 'nav-item-inactive')}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-2 border-t border-cream-200 space-y-0.5">
          <button
            onClick={() => setView('settings')}
            className={cn('nav-item w-full', view === 'settings' ? 'nav-item-active' : 'nav-item-inactive')}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>

        {profile && (
          <div className="px-5 py-3 border-t border-cream-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sage-200 text-ink-700 flex items-center justify-center text-xs font-semibold">
                {initials(profile.display_name || 'Disha')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-700 truncate">{profile.display_name || 'Disha'}</p>
                <p className="text-[11px] text-ink-400 truncate">Personal account</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-cream-100/80 backdrop-blur-md border-b border-cream-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink-800 flex items-center justify-center">
              <LifeBuoy size={16} className="text-cream-50" />
            </div>
            <span className="font-serif font-bold text-ink-800">LifeOS</span>
          </div>
          <button
            onClick={() => setView('settings')}
            className={cn('w-8 h-8 rounded-full bg-sage-200 text-ink-700 flex items-center justify-center text-xs font-semibold', view === 'settings' && 'ring-2 ring-sage-400')}
          >
            {initials(profile?.display_name || 'U')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8">
          <div className="mb-5 hidden md:block">
            <h2 className="text-2xl font-serif font-bold text-ink-800">{activeLabel}</h2>
          </div>
          {view === 'dashboard' && <Dashboard onNavigate={setView} />}
          {view === 'diary' && <Diary />}
          {view === 'tasks' && <Tasks />}
          {view === 'calendar' && <CalendarPage />}
          {view === 'reminders' && <Reminders />}
          {view === 'files' && <Files />}
          {view === 'assistant' && <Assistant />}
          {view === 'wardrobe' && <Wardrobe />}
          {view === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-cream-100/90 backdrop-blur-md border-t border-cream-200">
        <div className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_NAV.map((id) => {
            const item = NAV_ITEMS.find((n) => n.id === id)!;
            const Icon = item.icon;
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors',
                  active ? 'text-ink-800' : 'text-ink-400'
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setView('wardrobe')}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg transition-colors',
              view === 'wardrobe' || view === 'files' || view === 'assistant' || view === 'settings'
                ? 'text-ink-800'
                : 'text-ink-400'
            )}
          >
            <Shirt size={20} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

import { useState } from 'react';
import { User, Bell, Palette, Shield, Save, Check, Trash2 } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { cn, initials } from '@/lib/utils';
import { loadValue, saveValue, removeKey, STORAGE_KEYS } from '@/lib/storage';
import ConfirmDialog from '@/components/ConfirmDialog';

type Section = 'profile' | 'appearance' | 'notifications' | 'privacy';

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('profile');
  const [displayName, setDisplayName] = useState(() => loadValue(STORAGE_KEYS.profile, { display_name: 'Disha' }).display_name ?? 'Disha');
  const [bio, setBio] = useState(() => loadValue(STORAGE_KEYS.profile, { display_name: 'Disha', bio: '' }).bio ?? '');
  const [saved, setSaved] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [showClearData, setShowClearData] = useState(false);

  const sections: { id: Section; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const handleSave = () => {
    saveValue(STORAGE_KEYS.profile, { display_name: displayName, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const requestNotifications = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotifEnabled(perm === 'granted');
    }
  };

  const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => removeKey(key));
    setDisplayName('Disha');
    setBio('');
    setShowClearData(false);
  };

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="grid md:grid-cols-[200px_1fr] gap-5">
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={cn('flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                  section === s.id ? 'bg-ink-800 text-cream-50 shadow-soft' : 'text-ink-500 hover:bg-cream-100')}>
                <Icon size={16} /> {s.label}
              </button>
            );
          })}
        </div>

        <div className="card p-5 md:p-6">
          {section === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-sage-200 text-ink-700 flex items-center justify-center text-xl font-semibold">
                  {initials(displayName || 'Disha')}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-ink-800">{displayName || 'Your Name'}</h3>
                  <p className="text-sm text-ink-400">Local account</p>
                </div>
              </div>
              <div>
                <label className="label">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." className="input resize-none" />
              </div>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}

          {section === 'appearance' && (
            <div className="space-y-5">
              <h3 className="font-serif font-semibold text-ink-800">Appearance</h3>
              <div>
                <p className="text-sm text-ink-600 mb-2">Theme</p>
                <div className="flex gap-3">
                  <div className="flex-1 p-4 rounded-xl border-2 border-ink-400 bg-cream-50 text-center">
                    <div className="w-full h-12 rounded-lg bg-cream-100 mb-2" />
                    <p className="text-xs font-medium text-ink-700">Cream (current)</p>
                  </div>
                  <div className="flex-1 p-4 rounded-xl border border-cream-200 bg-cream-50 text-center opacity-50 cursor-not-allowed">
                    <div className="w-full h-12 rounded-lg bg-ink-800 mb-2" />
                    <p className="text-xs font-medium text-ink-400">Dark (soon)</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-ink-400">Dark mode will be available in a future update.</p>
            </div>
          )}

          {section === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-serif font-semibold text-ink-800">Notifications</h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-cream-50">
                <div>
                  <p className="text-sm font-medium text-ink-700">Browser Notifications</p>
                  <p className="text-xs text-ink-400 mt-0.5">Get reminded about tasks and events in your browser.</p>
                </div>
                {notifEnabled ? (
                  <span className="badge bg-sage-100 text-sage-600"><Check size={12} /> Enabled</span>
                ) : (
                  <button onClick={requestNotifications} className="btn-outline text-xs">Enable</button>
                )}
              </div>
              <p className="text-xs text-ink-400">Notifications are checked every minute while the app is open. Make sure your browser allows notifications for this site.</p>
            </div>
          )}

          {section === 'privacy' && (
            <div className="space-y-5">
              <h3 className="font-serif font-semibold text-ink-800">Privacy</h3>
              <div className="p-4 rounded-xl bg-cream-50 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-sage-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-700">Your data is stored locally</p>
                    <p className="text-xs text-ink-400 mt-1">
                      All your data — diary entries, tasks, events, reminders, files, and wardrobe items — is stored in your browser's local storage.
                      Nothing is sent to any server. Your data stays on your device.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-blush-50 space-y-3">
                <div className="flex items-start gap-3">
                  <Trash2 size={18} className="text-blush-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink-700">Clear Local Data</p>
                    <p className="text-xs text-ink-400 mt-1">
                      Permanently delete all locally stored data including tasks, events, diary entries, reminders, files, chat history, and wardrobe items. This cannot be undone.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowClearData(true)} className="btn-outline text-blush-500 border-blush-200 hover:bg-blush-50 flex items-center gap-2">
                  <Trash2 size={16} /> Clear All Local Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog open={showClearData} onClose={() => setShowClearData(false)} onConfirm={clearAllData}
        title="Clear All Local Data" message="This will permanently delete ALL your locally stored data (tasks, events, diary, reminders, files, chat, wardrobe). This cannot be undone." />
    </div>
  );
}

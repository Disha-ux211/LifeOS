import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  storageKey: 'lifeos-auth',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  debug: false,
  },
});

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
};

export type DiaryEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'low' | 'bad';
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type DiaryPhoto = {
  id: string;
  diary_entry_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

export type DiaryEntryWithPhotos = DiaryEntry & { photos: DiaryPhoto[] };

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  event_type: 'birthday' | 'exam' | 'assignment' | 'college' | 'personal' | 'important';
  color: string;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reminder_date: string;
  reminder_time: string;
  repeat_option: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type FileItem = {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  created_at: string;
};

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessory' | 'outerwear';
  storage_path: string | null;
  color: string;
  brand: string;
  notes: string;
  created_at: string;
};

export type OutfitCombination = {
  id: string;
  user_id: string;
  name: string;
  item_ids: string[];
  notes: string;
  created_at: string;
};

export type ChatConversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export type View =
  | 'dashboard'
  | 'diary'
  | 'tasks'
  | 'calendar'
  | 'reminders'
  | 'files'
  | 'assistant'
  | 'wardrobe'
  | 'settings';

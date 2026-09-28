/*
# LifeOS — Complete Schema Rebuild with Authentication

This migration replaces the old single-tenant tables with a multi-user,
auth-scoped schema. The old tables (tasks, notes, habits, habit_entries,
journal_entries, goals) had 0 rows and are dropped safely.

## New Tables
1. profiles — extends auth.users with display name and avatar URL.
2. diary_entries — personal diary/memory entries with mood, tags, photos.
3. diary_photos — photo URLs attached to diary entries (Supabase Storage).
4. tasks — to-do items with priority, category, due date, completion.
5. calendar_events — events on the monthly calendar (birthdays, exams, etc.).
6. reminders — date/time reminders with repeat options and completion.
7. files — file metadata for uploaded documents/images (Supabase Storage).
8. wardrobe_items — clothing items with category, photo, metadata.
9. outfit_combinations — saved outfits combining wardrobe items.
10. chat_conversations — AI assistant conversation sessions.
11. chat_messages — individual messages within a conversation.

## Security
- All tables use RLS with owner-scoped policies (auth.uid() = user_id).
- user_id columns default to auth.uid() so client inserts omitting user_id succeed.
- Triggers auto-update updated_at columns on relevant tables.
- A trigger creates a profile row when a new auth.user signs up.
*/

-- Drop old tables (all had 0 rows, safe to remove)
DROP TABLE IF EXISTS habit_entries CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- DIARY ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  mood text DEFAULT 'good' CHECK (mood IN ('great','good','okay','low','bad')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, entry_date DESC);

DROP POLICY IF EXISTS "select_own_diary" ON diary_entries;
CREATE POLICY "select_own_diary" ON diary_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_diary" ON diary_entries;
CREATE POLICY "insert_own_diary" ON diary_entries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_diary" ON diary_entries;
CREATE POLICY "update_own_diary" ON diary_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_diary" ON diary_entries;
CREATE POLICY "delete_own_diary" ON diary_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DIARY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS diary_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id uuid NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diary_photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_diary_photos_entry ON diary_photos(diary_entry_id);

DROP POLICY IF EXISTS "select_own_diary_photos" ON diary_photos;
CREATE POLICY "select_own_diary_photos" ON diary_photos FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM diary_entries WHERE diary_entries.id = diary_photos.diary_entry_id AND diary_entries.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_diary_photos" ON diary_photos;
CREATE POLICY "insert_own_diary_photos" ON diary_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM diary_entries WHERE diary_entries.id = diary_photos.diary_entry_id AND diary_entries.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_diary_photos" ON diary_photos;
CREATE POLICY "delete_own_diary_photos" ON diary_photos FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM diary_entries WHERE diary_entries.id = diary_photos.diary_entry_id AND diary_entries.user_id = auth.uid())
  );

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  due_date date,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  category text NOT NULL DEFAULT 'general',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'personal' CHECK (event_type IN ('birthday','exam','assignment','college','personal','important')),
  color text NOT NULL DEFAULT '#c4b5a0',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_events_user_date ON calendar_events(user_id, event_date);

DROP POLICY IF EXISTS "select_own_events" ON calendar_events;
CREATE POLICY "select_own_events" ON calendar_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_events" ON calendar_events;
CREATE POLICY "insert_own_events" ON calendar_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_events" ON calendar_events;
CREATE POLICY "update_own_events" ON calendar_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_events" ON calendar_events;
CREATE POLICY "delete_own_events" ON calendar_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  reminder_date date NOT NULL,
  reminder_time time NOT NULL DEFAULT '09:00',
  repeat_option text NOT NULL DEFAULT 'none' CHECK (repeat_option IN ('none','daily','weekly','monthly')),
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reminders_user_date ON reminders(user_id, reminder_date);

DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- FILES
-- ============================================================
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  file_type text NOT NULL DEFAULT 'document',
  file_size bigint DEFAULT 0,
  mime_type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id, created_at DESC);

DROP POLICY IF EXISTS "select_own_files" ON files;
CREATE POLICY "select_own_files" ON files FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_files" ON files;
CREATE POLICY "insert_own_files" ON files FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_files" ON files;
CREATE POLICY "delete_own_files" ON files FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- WARDROBE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'top' CHECK (category IN ('top','bottom','dress','shoes','accessory','outerwear')),
  storage_path text,
  color text DEFAULT '',
  brand text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_cat ON wardrobe_items(user_id, category);

DROP POLICY IF EXISTS "select_own_wardrobe" ON wardrobe_items;
CREATE POLICY "select_own_wardrobe" ON wardrobe_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wardrobe" ON wardrobe_items;
CREATE POLICY "insert_own_wardrobe" ON wardrobe_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_wardrobe" ON wardrobe_items;
CREATE POLICY "update_own_wardrobe" ON wardrobe_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wardrobe" ON wardrobe_items;
CREATE POLICY "delete_own_wardrobe" ON wardrobe_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- OUTFIT COMBINATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS outfit_combinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Outfit',
  item_ids uuid[] NOT NULL DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE outfit_combinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outfits" ON outfit_combinations;
CREATE POLICY "select_own_outfits" ON outfit_combinations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_outfits" ON outfit_combinations;
CREATE POLICY "insert_own_outfits" ON outfit_combinations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_outfits" ON outfit_combinations;
CREATE POLICY "update_own_outfits" ON outfit_combinations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_outfits" ON outfit_combinations;
CREATE POLICY "delete_own_outfits" ON outfit_combinations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CHAT CONVERSATIONS & MESSAGES (AI Assistant)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_conversations" ON chat_conversations;
CREATE POLICY "select_own_conversations" ON chat_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_conversations" ON chat_conversations;
CREATE POLICY "insert_own_conversations" ON chat_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_conversations" ON chat_conversations;
CREATE POLICY "delete_own_conversations" ON chat_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);

DROP POLICY IF EXISTS "select_own_messages" ON chat_messages;
CREATE POLICY "select_own_messages" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_messages" ON chat_messages;
CREATE POLICY "insert_own_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','diary_entries','tasks','calendar_events','reminders','chat_conversations']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_%s_updated ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trigger_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

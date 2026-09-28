/*
# LifeOS — Core Schema (single-tenant, no auth)

1. New Tables
- `tasks` — to-do items with priority, due date, completion status, and tags.
  - id (uuid PK), title (text), notes (text), priority (text: low|medium|high), 
    due_date (date), completed (bool), tags (text[]), created_at, updated_at.
- `notes` — personal memory / knowledge capture with tags and pin.
  - id (uuid PK), title (text), content (text), tags (text[]), pinned (bool), created_at, updated_at.
- `habits` — recurring habits with frequency and target.
  - id (uuid PK), name (text), description (text), color (text), frequency (text: daily|weekly),
    target_per_week (int), created_at, archived (bool).
- `habit_entries` — daily check-in records for habits.
  - id (uuid PK), habit_id (FK habits), entry_date (date), completed (bool), created_at.
  - UNIQUE(habit_id, entry_date) to prevent duplicates.
- `journal_entries` — daily journal with mood and content.
  - id (uuid PK), entry_date (date), mood (text: great|good|okay|low|bad), title (text), content (text), created_at, updated_at.
- `goals` — long-term goals with progress and milestones.
  - id (uuid PK), title (text), description (text), category (text), target_date (date),
    progress (int 0-100), status (text: active|completed|paused), created_at, updated_at.

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated full CRUD (single-tenant, no sign-in screen).

3. Indexes
- tasks: due_date, completed, created_at
- notes: created_at, pinned
- habit_entries: habit_id, entry_date
- journal_entries: entry_date
- goals: status, created_at
*/

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  notes text DEFAULT '',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled',
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);

DROP POLICY IF EXISTS "anon_select_notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE TO anon, authenticated USING (true);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  color text NOT NULL DEFAULT '#3b82f6',
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekly')),
  target_per_week int NOT NULL DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  archived boolean NOT NULL DEFAULT false
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);

DROP POLICY IF EXISTS "anon_select_habits" ON habits;
CREATE POLICY "anon_select_habits" ON habits FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
CREATE POLICY "anon_insert_habits" ON habits FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_habits" ON habits;
CREATE POLICY "anon_update_habits" ON habits FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
CREATE POLICY "anon_delete_habits" ON habits FOR DELETE TO anon, authenticated USING (true);

-- Habit entries
CREATE TABLE IF NOT EXISTS habit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  completed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, entry_date)
);
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit ON habit_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(entry_date DESC);

DROP POLICY IF EXISTS "anon_select_habit_entries" ON habit_entries;
CREATE POLICY "anon_select_habit_entries" ON habit_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_habit_entries" ON habit_entries;
CREATE POLICY "anon_insert_habit_entries" ON habit_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_habit_entries" ON habit_entries;
CREATE POLICY "anon_update_habit_entries" ON habit_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_habit_entries" ON habit_entries;
CREATE POLICY "anon_delete_habit_entries" ON habit_entries FOR DELETE TO anon, authenticated USING (true);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  mood text DEFAULT 'good' CHECK (mood IN ('great','good','okay','low','bad')),
  title text DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(entry_date)
);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date DESC);

DROP POLICY IF EXISTS "anon_select_journal" ON journal_entries;
CREATE POLICY "anon_select_journal" ON journal_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_journal" ON journal_entries;
CREATE POLICY "anon_insert_journal" ON journal_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_journal" ON journal_entries;
CREATE POLICY "anon_update_journal" ON journal_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_journal" ON journal_entries;
CREATE POLICY "anon_delete_journal" ON journal_entries FOR DELETE TO anon, authenticated USING (true);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'personal',
  target_date date,
  progress int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created ON goals(created_at DESC);

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE TO anon, authenticated USING (true);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tasks_updated ON tasks;
CREATE TRIGGER trigger_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notes_updated ON notes;
CREATE TRIGGER trigger_notes_updated BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_journal_updated ON journal_entries;
CREATE TRIGGER trigger_journal_updated BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_goals_updated ON goals;
CREATE TRIGGER trigger_goals_updated BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

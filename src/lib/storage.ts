export function loadList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveList<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // localStorage might be full or unavailable; fail silently
  }
}

export function loadValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // fail silently
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
}

export function uid(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISODate(): string {
  return new Date().toISOString().split('T')[0];
}

export const STORAGE_KEYS = {
  tasks: 'lifeos_tasks',
  events: 'lifeos_events',
  diary: 'lifeos_diary',
  reminders: 'lifeos_reminders',
  files: 'lifeos_files',
  chat: 'lifeos_chat',
  wardrobe: 'lifeos_wardrobe',
  profile: 'lifeos_profile',
} as const;

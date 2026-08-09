import { type ThemeInfo } from '../types';

export const THEMES: ThemeInfo[] = [
  { id: 'tech', name: '科技', emoji: '💻' },
  { id: 'literature', name: '文学', emoji: '📚' },
  { id: 'art', name: '艺术', emoji: '🎨' },
  { id: 'entertainment', name: '娱乐', emoji: '🎬' },
  { id: 'food', name: '美食', emoji: '🍜' },
  { id: 'sports', name: '体育', emoji: '⚽' },
  { id: 'geography', name: '地理', emoji: '🌍' },
  { id: 'nature', name: '自然', emoji: '🌿' },
  { id: 'history', name: '历史', emoji: '🏛️' },
];

const CUSTOM_THEMES_KEY = 'quizparty_custom_themes';

export function loadCustomThemes(): ThemeInfo[] {
  const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
  if (raw) try { return JSON.parse(raw) as ThemeInfo[]; } catch { /* ignore */ }
  return [];
}

export function saveCustomThemes(themes: ThemeInfo[]): void {
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
}

export function addCustomTheme(name: string): ThemeInfo {
  const id = `custom_${Date.now()}`;
  const theme: ThemeInfo = { id, name, emoji: '📌' };
  const all = [...loadCustomThemes(), theme];
  saveCustomThemes(all);
  return theme;
}

export function removeCustomTheme(id: string): void {
  const all = loadCustomThemes().filter(t => t.id !== id);
  saveCustomThemes(all);
}

const HIDDEN_THEMES_KEY = 'quizparty_hidden_themes';

function loadHiddenThemes(): string[] {
  const raw = localStorage.getItem(HIDDEN_THEMES_KEY);
  if (raw) try { return JSON.parse(raw) as string[]; } catch { /* ignore */ }
  return [];
}

export function hideTheme(id: string): void {
  const hidden = loadHiddenThemes();
  if (!hidden.includes(id)) {
    hidden.push(id);
    localStorage.setItem(HIDDEN_THEMES_KEY, JSON.stringify(hidden));
  }
}

export function getAllThemes(): ThemeInfo[] {
  const hidden = loadHiddenThemes();
  return [...THEMES, ...loadCustomThemes()].filter(t => !hidden.includes(t.id));
}

const ENABLED_THEMES_KEY = 'quizparty_enabled_themes';

export function loadEnabledThemes(): string[] {
  const raw = localStorage.getItem(ENABLED_THEMES_KEY);
  if (raw) try { return JSON.parse(raw) as string[]; } catch { /* ignore */ }
  return getAllThemes().map(t => t.id);
}

export function saveEnabledThemes(ids: string[]): void {
  localStorage.setItem(ENABLED_THEMES_KEY, JSON.stringify(ids));
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
  6: '⭐⭐⭐⭐⭐⭐',
};

export const COIN_REWARDS: Record<number, number> = {
  1: 15,
  2: 25,
  3: 40,
  4: 60,
  5: 85,
  6: 120,
};

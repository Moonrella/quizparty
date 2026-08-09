import { type Question, type Difficulty } from '../types';
import { defaultQuestions } from '../data/defaultQuestions';

const STORAGE_KEY = 'quizparty_questions_v3';

export function loadQuestions(): Question[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw) as Question[]; } catch { return defaultQuestions; }
  }
  return defaultQuestions;
}

export function saveQuestions(questions: Question[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function addQuestion(questions: Question[], q: Omit<Question, 'id'>): Question[] {
  const newQ: Question = { ...q, id: crypto.randomUUID() };
  const updated = [...questions, newQ];
  saveQuestions(updated);
  return updated;
}

export function updateQuestion(questions: Question[], id: string, q: Omit<Question, 'id'>): Question[] {
  const updated = questions.map(item => item.id === id ? { ...q, id } : item);
  saveQuestions(updated);
  return updated;
}

export function deleteQuestion(questions: Question[], id: string): Question[] {
  const updated = questions.filter(item => item.id !== id);
  saveQuestions(updated);
  return updated;
}

export function getAvailableQuestion(
  questions: Question[],
  usedIds: string[],
  theme: string,
  difficulty: Difficulty,
): Question | null {
  const available = questions.filter(
    q => q.theme === theme && q.difficulty === difficulty && !usedIds.includes(q.id)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getRandomQuestion(
  questions: Question[],
  usedIds: string[],
  difficulty: Difficulty,
): Question | null {
  const available = questions.filter(
    q => q.difficulty === difficulty && !usedIds.includes(q.id)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function importQuestions(questions: Question[], json: string): Question[] {
  const imported = JSON.parse(json) as Omit<Question, 'id'>[];
  const newOnes = imported.map(q => ({ ...q, id: crypto.randomUUID() }));
  const updated = [...questions, ...newOnes];
  saveQuestions(updated);
  return updated;
}

export function exportQuestions(questions: Question[]): string {
  const data = questions.map(({ id: _id, ...rest }) => rest);
  return JSON.stringify(data, null, 2);
}

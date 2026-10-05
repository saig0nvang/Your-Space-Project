export type History<T> = { past: T[]; present: T; future: T[]; checkpoint: T | null };

const LIMIT = 50;

export const createHistory = <T>(initial: T): History<T> => ({ past: [], present: initial, future: [], checkpoint: null });

export function commit<T>(h: History<T>, next: T): History<T> {
  return { past: [...h.past, h.present].slice(-LIMIT), present: next, future: [], checkpoint: null };
}

export function replace<T>(h: History<T>, next: T): History<T> {
  return { ...h, present: next };
}

export function begin<T>(h: History<T>): History<T> {
  return { ...h, checkpoint: h.present };
}

export function end<T>(h: History<T>): History<T> {
  if (h.checkpoint === null || h.checkpoint === h.present) return { ...h, checkpoint: null };
  return { past: [...h.past, h.checkpoint].slice(-LIMIT), present: h.present, future: [], checkpoint: null };
}

export function undo<T>(h: History<T>): History<T> {
  const prev = h.past[h.past.length - 1];
  if (h.past.length === 0 || prev === undefined) return h;
  return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future], checkpoint: null };
}

export function redo<T>(h: History<T>): History<T> {
  const next = h.future[0];
  if (h.future.length === 0 || next === undefined) return h;
  return { past: [...h.past, h.present], present: next, future: h.future.slice(1), checkpoint: null };
}

export const canUndo = <T>(h: History<T>): boolean => h.past.length > 0;
export const canRedo = <T>(h: History<T>): boolean => h.future.length > 0;

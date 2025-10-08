import { Injectable, signal } from '@angular/core';
import { Note } from '../models/note.model';

const STORAGE_KEY = 'smart-notes';

function generateId() {
  // Use Web Crypto if available, else fallback
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private notesSignal = signal<Note[]>(this.load());
  notes = this.notesSignal.asReadonly();

  private save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notesSignal()));
      }
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }

  private load(): Note[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Note[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // PUBLIC_INTERFACE
  list(opts?: { starred?: boolean; trashed?: boolean; search?: string }): Note[] {
    /** Return notes filtered by flags and search, sorted by updatedAt desc. */
    const { starred, trashed, search } = opts ?? {};
    let arr = [...this.notesSignal()];
    if (typeof starred === 'boolean') {
      arr = arr.filter(n => n.starred === starred && !n.trashed);
    }
    if (typeof trashed === 'boolean') {
      arr = arr.filter(n => n.trashed === trashed);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q));
    }
    // If neither starred nor trashed specifically requested, exclude trashed by default
    if (starred === undefined && trashed === undefined) {
      arr = arr.filter(n => !n.trashed);
    }
    return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // PUBLIC_INTERFACE
  get(id: string): Note | undefined {
    /** Get a single note by id. */
    return this.notesSignal().find(n => n.id === id);
  }

  // PUBLIC_INTERFACE
  create(data: { title: string; content: string }): Note {
    /** Create and persist a new note with timestamps. */
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: data.title?.trim() || 'Untitled',
      content: data.content || '',
      starred: false,
      trashed: false,
      createdAt: now,
      updatedAt: now
    };
    this.notesSignal.update(prev => [note, ...prev]);
    this.save();
    return note;
  }

  // PUBLIC_INTERFACE
  update(id: string, patch: Partial<Pick<Note, 'title' | 'content' | 'starred' | 'trashed'>>) {
    /** Update note fields and persist. */
    this.notesSignal.update(prev =>
      prev.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
    this.save();
  }

  // PUBLIC_INTERFACE
  toggleStar(id: string) {
    /** Toggle the 'starred' flag for a note. */
    const note = this.get(id);
    if (note) {
      this.update(id, { starred: !note.starred });
    }
  }

  // PUBLIC_INTERFACE
  softDelete(id: string) {
    /** Move a note to Trash by setting trashed flag. */
    this.update(id, { trashed: true });
  }

  // PUBLIC_INTERFACE
  restore(id: string) {
    /** Restore a soft-deleted note. */
    this.update(id, { trashed: false });
  }

  // PUBLIC_INTERFACE
  deletePermanent(id: string) {
    /** Permanently remove a note from storage. */
    this.notesSignal.update(prev => prev.filter(n => n.id !== id));
    this.save();
  }
}

import { NotesService } from './notes.service';

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(() => {
    // Provide a simple localStorage mock for tests
    const store: Record<string, string> = {};
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; }
    };

    (globalThis as any).crypto = (globalThis as any).crypto ?? { randomUUID: undefined };

    localStorage.clear();
    service = new NotesService();
  });

  it('should create a note', () => {
    const note = service.create({ title: 'Test', content: 'Hello' });
    const list = service.list();
    expect(list.find(n => n.id === note.id)).toBeTruthy();
  });

  it('should update a note', () => {
    const note = service.create({ title: 'A', content: 'B' });
    service.update(note.id, { title: 'New' });
    const updated = service.get(note.id);
    expect(updated?.title).toBe('New');
  });

  it('should soft delete and restore', () => {
    const note = service.create({ title: 'A', content: 'B' });
    service.softDelete(note.id);
    expect(service.list().some(n => n.id === note.id)).toBeFalse();
    expect(service.list({ trashed: true }).some(n => n.id === note.id)).toBeTrue();
    service.restore(note.id);
    expect(service.list().some(n => n.id === note.id)).toBeTrue();
  });

  it('should search notes', () => {
    service.create({ title: 'Grocery', content: 'milk and eggs' });
    service.create({ title: 'Work', content: 'meeting notes' });
    const results = service.list({ search: 'groc' });
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Grocery');
  });

  it('should delete permanently', () => {
    const n = service.create({ title: 'X', content: 'Y' });
    service.deletePermanent(n.id);
    expect(service.get(n.id)).toBeUndefined();
  });
});

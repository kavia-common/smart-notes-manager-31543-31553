import { Routes } from '@angular/router';
import { NotesListComponent } from './pages/notes-list/notes-list.component';
import { NoteEditorComponent } from './pages/note-editor/note-editor.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  { path: 'notes', component: NotesListComponent },
  { path: 'notes/new', component: NoteEditorComponent },
  { path: 'notes/:id', component: NoteEditorComponent },
  { path: '**', redirectTo: 'notes' }
];

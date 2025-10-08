import { Component, effect, model, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink, DatePipe],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css'
})
export class NoteEditorComponent {
  id = signal<string | null>(null);
  title = model<string>('');    // enables [(ngModel)] binding
  content = model<string>('');  // enables [(ngModel)] binding
  note = signal<Note | null>(null);

  constructor(
    private svc: NotesService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    effect(() => {
      const id = this.route.snapshot.paramMap.get('id');
      this.id.set(id);
      if (id) {
        const existing = this.svc.get(id);
        if (existing) {
          this.note.set(existing);
          this.title.set(existing.title);
          this.content.set(existing.content);
        }
      }
    });
  }

  save() {
    if (this.id()) {
      this.svc.update(this.id()!, { title: this.title(), content: this.content() });
      this.toast.show('Note saved', 'success');
    } else {
      const n = this.svc.create({ title: this.title(), content: this.content() });
      this.toast.show('Note created', 'success');
      this.router.navigate(['/notes', n.id]);
    }
  }

  cancel() {
    if (this.id()) {
      this.router.navigate(['/notes', this.id()]);
    } else {
      this.router.navigate(['/notes']);
    }
  }

  toggleStar() {
    if (this.id()) {
      this.svc.toggleStar(this.id()!);
      const updated = this.svc.get(this.id()!);
      this.note.set(updated ?? null);
    }
  }

  delete() {
    if (this.id()) {
      this.svc.softDelete(this.id()!);
      this.toast.show('Moved to Trash', 'info');
    }
    this.router.navigate(['/notes']);
  }
}

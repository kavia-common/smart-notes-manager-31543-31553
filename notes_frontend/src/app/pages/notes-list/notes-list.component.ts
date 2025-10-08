import { Component, computed, effect, model, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, DatePipe, FormsModule],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css'
})
export class NotesListComponent {
  query = model<string>(''); // enables [(ngModel)]
  starred = signal<boolean | undefined>(undefined);
  trashed = signal<boolean | undefined>(undefined);

  notes = computed<Note[]>(() => {
    return this.svc.list({
      starred: this.starred(),
      trashed: this.trashed(),
      search: this.query()
    });
  });

  constructor(
    private svc: NotesService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    effect(() => {
      const qp = this.route.snapshot.queryParamMap;
      const starredParam = qp.get('starred');
      const trashedParam = qp.get('trashed');
      this.starred.set(starredParam ? true : undefined);
      this.trashed.set(trashedParam ? true : undefined);
    });
  }

  createNew() {
    this.router.navigate(['/notes/new']);
  }

  toggleStar(note: Note) {
    this.svc.toggleStar(note.id);
  }

  delete(note: Note) {
    if (this.trashed()) {
      this.svc.deletePermanent(note.id);
      this.toast.show('Note deleted permanently', 'error');
    } else {
      this.svc.softDelete(note.id);
      this.toast.show('Moved to Trash', 'info');
    }
  }

  restore(note: Note) {
    this.svc.restore(note.id);
    this.toast.show('Note restored', 'success');
  }

  trackById(_: number, n: Note) { return n.id; }
}

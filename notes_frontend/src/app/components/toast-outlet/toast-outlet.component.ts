import { Component, computed, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts()" class="toast" [ngClass]="t.type">{{ t.message }}</div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; z-index: 9999; }
    .toast { padding: 10px 12px; border-radius: 10px; color: #111827; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.12); border: 1px solid #e5e7eb; }
    .toast.success { border-color: #F59E0B; }
    .toast.error { border-color: #EF4444; }
  `]
})
export class ToastOutletComponent {
  private toast = inject(ToastService);
  toasts = computed(() => this.toast.toasts());
}

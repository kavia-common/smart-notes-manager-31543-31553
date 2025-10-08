import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 1;

  // PUBLIC_INTERFACE
  show(message: string, type: 'info' | 'success' | 'error' = 'info', timeout = 2500) {
    /** Show a toast message of a given type that auto-dismisses after timeout. */
    const id = this.counter++;
    const toast: Toast = { id, message, type, timeout };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(id), timeout);
  }

  // PUBLIC_INTERFACE
  dismiss(id: number) {
    /** Dismiss a toast by id. */
    this.toasts.update((list) => list.filter(t => t.id !== id));
  }
}

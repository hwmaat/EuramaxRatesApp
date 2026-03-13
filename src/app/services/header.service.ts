import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly defaultCaption = '';
  caption: WritableSignal<string> = signal(this.defaultCaption);

  setCaption(value: string | null | undefined) {
    this.caption.set(value ?? this.defaultCaption);
  }

  reset() {
    this.caption.set(this.defaultCaption);
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export type Constructor<T> = new (...args: any[]) => T;

export function WithDestroy<TBase extends Constructor<{}>>(Base: TBase = class {} as any) {
  return class extends Base implements OnDestroy {
    protected readonly destroy$ = new Subject<void>();

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
  };
}
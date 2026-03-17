// app/layout/menu.service.ts  (new file; adjust path to your structure)
import { Injectable, inject } from '@angular/core';
import { MenuItem, menuItems } from '@app/menu-items';
import { of } from 'rxjs';
import { AuthStateService } from './auth-state.service';



@Injectable({ providedIn: 'root' })
export class MenuService {
  auth = inject(AuthStateService);

  filteredMenuItems$ = of(this.filterMenuItems(menuItems));
  // Recompute whenever user’s groups change
  // filteredMenuItems$ = this.auth.currentUserGroups$.pipe(
  //   map(() => this.filterMenuItems(menuItems))
  // );

  private filterMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.hasAccess(item))
      .map(item => ({
        ...item,
        items: item.items ? this.filterMenuItems(item.items) : undefined
      }))
      .filter(item => !item.items || item.items.length > 0); // remove empty parents
  }

  private hasAccess(item: MenuItem): boolean {
    // If no access is defined, allow
    if (!item.access || item.access.length === 0) {
      return true;
    }
    //return this.auth.hasAccess(item.access);
    return (this.auth.status() === 'authenticated'); // Simplified for example
  }
}

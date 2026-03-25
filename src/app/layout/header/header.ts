import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { Topmenu } from '../topmenu/topmenu';
import { WithDestroy } from '@app/helpers/WithDestroy';
import { Router, NavigationEnd } from '@angular/router';
import { Globals } from '@app/services/globals.service';
import { filter, map, switchMap, of, takeUntil } from 'rxjs';
import { HeaderService } from '@app/services/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DxButtonModule, Topmenu],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header extends WithDestroy() {
  @Output() toggleMenu = new EventEmitter<void>();
  
  private headerService = inject(HeaderService);
  readonly caption = this.headerService.caption;
  router = inject(Router);

  logo = '';
  private globals = inject(Globals);
  readonly logoUrl = computed(() => {
    const cfg = this.globals.settings();
    const file = cfg?.logo ?? '';
    return file ? `assets/${file}` : '';
  });
  
  constructor() {
    super();
  }
  
  ngOnInit(): void {
    // update caption from route data on navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.routerState.root),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      switchMap(route => route.data ?? of({})),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      const txt = data?.caption ? ` - ${data.caption}` : this.headerService.defaultCaption;
      this.headerService.setCaption(txt);
    });
  }
    onMenuItemClick(e: any) {
    const item = e.itemData;
    if (item.path !== undefined) {
      this.router.navigateByUrl(item.path);
    }
  }
}

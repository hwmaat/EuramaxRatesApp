import { Component, computed, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { Topmenu } from '../topmenu/topmenu';
import { WithDestroy } from '@app/helpers/WithDestroy';
import { Router, NavigationEnd } from '@angular/router';
import { Globals } from '@app/services/globals.service';
import { filter, map, switchMap, of, takeUntil } from 'rxjs';
import { HeaderService } from '@app/services/header.service';
import { MenuClickEvent } from '@app/models/menu-events.model';

interface HeaderRouteData {
  caption?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DxButtonModule, Topmenu],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header extends WithDestroy() implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  
  private headerService = inject(HeaderService);
  readonly caption = this.headerService.caption;
  router = inject(Router);

  logo = '';
  private globals = inject(Globals);
  readonly logoUrl = computed(() => {
    const cfg = this.globals.settings();
    const file = cfg?.logo ?? 'EuramaxLogo_light.png';
    return `assets/${file}`;
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
    ).subscribe((data: HeaderRouteData) => {
      const txt = data?.caption ? ` - ${data.caption}` : this.headerService.defaultCaption;
      this.headerService.setCaption(txt);
    });
  }
    onMenuItemClick(e: MenuClickEvent) {
    const item = e.itemData;
    if (item.path !== undefined) {
      this.router.navigateByUrl(item.path);
    }
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthStateService } from '@app/services/auth-state.service';
import { ThemeService } from './services/theme.service';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { DxDrawerModule } from 'devextreme-angular';
import { SideMenuComponent } from './layout/side-menu/side-menu.component';
import { ServerDownBannerComponent } from './helpers/server-down-banner/server-down-banner.component';
import { GlobalErrorComponent } from './helpers/global-error/global-error.component';
import { MenuClickEvent } from '@app/models/menu-events.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, DxDrawerModule, SideMenuComponent, ServerDownBannerComponent, GlobalErrorComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  auth = inject(AuthStateService);
  themeService = inject(ThemeService);
  router = inject(Router);
  isDrawerOpen = false;

  ngOnInit(): void {

  }

  onMenuItemClick(e: MenuClickEvent) {
    const item = e.itemData;
    if (item.path !== undefined) {
      this.router.navigateByUrl(item.path);
    }
  }
  toggleDrawer():void { 
    this.isDrawerOpen = !this.isDrawerOpen;
  }

}

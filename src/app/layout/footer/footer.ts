import { Component, effect, inject } from '@angular/core';

import { DxSwitchModule, DxButtonModule } from 'devextreme-angular';
import { signal } from '@angular/core';
import { takeUntil } from 'rxjs';
import { Globals } from '@app/services/globals.service';
import { WithDestroy } from '@app/helpers/WithDestroy';
import { ThemeService } from '@app/services/theme.service';
import { AuthStateService } from '@app/services/auth-state.service';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [DxSwitchModule, DxButtonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class Footer extends WithDestroy() {
  currentYear = new Date().getFullYear();
  private themeService = inject(ThemeService)
  private globals = inject(Globals);
  auth = inject(AuthStateService);
  username = signal<string | null>(null);
  themeValue = true; // true for dark theme, false for light theme
  baseUrl='';
  version = '';

  constructor() {
    super();

    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => {
        this.themeValue = t === 'dark';
      });

    effect(() => {
    const s = this.globals.settings();   // IAppConfig | null
    if (s) {
      this.version = s.version;
    }

    const url = this.globals.apiBaseUrl(); // already trimmed & no trailing slash
    if (url) {
      this.baseUrl = url;
    }
    });
  }


  themeChange(value: boolean) {
    this.themeService.switchTheme(value);
  }

}

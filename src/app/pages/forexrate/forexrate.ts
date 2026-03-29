import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxToolbarModule } from 'devextreme-angular';
import { PageShell } from '@app/layout/page-shell/page-shell';
import { BaseCurrencySelect } from '@app/layout/base-currency-select/base-currency-select';

@Component({
  selector: 'app-forexrate',
  standalone: true,
  imports: [CommonModule, DxToolbarModule, DxButtonModule, PageShell, BaseCurrencySelect],
  templateUrl: './forexrate.html',
  styleUrl: './forexrate.scss'
})
export class Forexrate {
  refreshRates(): void {
    // Placeholder until Forexrate API integration is implemented.
  }
}

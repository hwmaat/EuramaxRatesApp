import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule } from 'devextreme-angular';
import { BaseCurrencyService } from '@app/services/base-currency.service';

@Component({
  selector: 'app-base-currency-select',
  standalone: true,
  imports: [CommonModule, DxSelectBoxModule],
  templateUrl: './base-currency-select.html',
  styleUrl: './base-currency-select.scss'
})
export class BaseCurrencySelect {
  private readonly baseCurrency = inject(BaseCurrencyService);

  @Output() currencyChanged = new EventEmitter<string>();

  readonly currencyOptions = this.baseCurrency.currencyOptions;
  readonly selectedCurrency = this.baseCurrency.selectedCurrency;

  onValueChanged(event: { value?: string }): void {
    const value = (event.value ?? '').toUpperCase();
    this.baseCurrency.setSelectedCurrency(value);
    this.currencyChanged.emit(this.selectedCurrency());
  }
}

import { Injectable, signal } from '@angular/core';

export interface BaseCurrencyOption {
  code: string;
  description: string;
  display: string;
}

const BASE_CURRENCY_SOURCE: ReadonlyArray<Omit<BaseCurrencyOption, 'display'>> = [
  { code: 'CAD', description: 'Canadian Dollar' },
  { code: 'CHF', description: 'Swiss Franc' },
  { code: 'DKK', description: 'Danish Krone' },
  { code: 'EUR', description: 'Euro' },
  { code: 'GBP', description: 'Pound Sterling' },
  { code: 'NOK', description: 'Norwegian Krone' },
  { code: 'SEK', description: 'Swedish Krona' },
  { code: 'TRY', description: 'Turkish Lira' },
  { code: 'USD', description: 'United States Dollar' }
];

export const BASE_CURRENCIES: ReadonlyArray<BaseCurrencyOption> = BASE_CURRENCY_SOURCE
  .map((item) => ({
    ...item,
    display: `${item.code} - ${item.description}`
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

@Injectable({ providedIn: 'root' })
export class BaseCurrencyService {
  readonly currencyOptions = BASE_CURRENCIES;
  readonly selectedCurrency = signal<string>('EUR');

  setSelectedCurrency(code: string): void {
    const normalized = (code || '').toUpperCase();
    if (!normalized) {
      return;
    }

    const isAllowed = this.currencyOptions.some((item) => item.code === normalized);
    if (isAllowed) {
      this.selectedCurrency.set(normalized);
    }
  }
}

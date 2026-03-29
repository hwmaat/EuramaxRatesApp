import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxChartModule, DxToolbarModule } from 'devextreme-angular';
import { HttpErrorResponse } from '@angular/common/http';
import { PageShell } from '@app/layout/page-shell/page-shell';
import { BaseCurrencySelect } from '@app/layout/base-currency-select/base-currency-select';
import { ApiService } from '@app/services/api.service';
import { BASE_CURRENCIES, BaseCurrencyService } from '@app/services/base-currency.service';
import { SHARED_METAL_SYMBOLS } from '@app/models/metal-symbols.model';
import { firstValueFrom } from 'rxjs';

interface MetalPriceLatestResponse {
  success?: boolean;
  base?: string;
  rates?: Record<string, number>;
  currencies?: Record<string, number>;
  metals?: Record<string, number>;
  error?: {
    statusCode?: number;
    message?: string;
  };
}

interface MetalPriceHourlyResponse {
  success?: boolean;
  base?: string;
  start_date?: string;
  end_date?: string;
  rates?: Array<{
    timestamp: number;
    rates: Record<string, number>;
  }>;
  error?: {
    statusCode?: number;
    message?: string;
  };
}

interface RateRow {
  code: string;
  description: string;
  value: number;
}

interface CommodityRow {
  code: string;
  description: string;
  value: number;
}

interface HourlyRateRow {
  timestamp: string;
  timestampDate: Date;
  value: number;
}

interface ChartTooltipInfo {
  argumentText?: string;
  valueText?: string;
}

const ALLOWED_CURRENCY_CODES = BASE_CURRENCIES.map((item) => item.code);
const REQUESTED_COMMODITY_CODES = SHARED_METAL_SYMBOLS.map((item) => item.code);
const CURRENCY_DESCRIPTION_BY_CODE = new Map(BASE_CURRENCIES.map((item) => [item.code, item.description]));

@Component({
  selector: 'app-metalprice',
  standalone: true,
  imports: [CommonModule, DxToolbarModule, DxButtonModule, DxChartModule, PageShell, BaseCurrencySelect],
  templateUrl: './metalprice.html',
  styleUrl: './metalprice.scss'
})
export class Metalprice {
  private readonly api = inject(ApiService);
  private readonly baseCurrency = inject(BaseCurrencyService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedBaseCurrency = this.baseCurrency.selectedCurrency;

  readonly currencies = signal<RateRow[]>([]);
  readonly commodities = signal<CommodityRow[]>([]);
  readonly selectedCurrencyRow = signal<string | null>(null);

  readonly hourlyLoading = signal(false);
  readonly hourlyError = signal<string | null>(null);
  readonly hourlyRates = signal<HourlyRateRow[]>([]);
  readonly chartVisualRange = signal<[Date, Date] | null>(null);

  readonly chartRates = computed(() => {
    const rows = this.hourlyRates();
    if (rows.length <= 1) {
      return [];
    }

    // Skip the last point as requested.
    return rows.slice(0, -1);
  });

  readonly customizeChartTooltip = (info: ChartTooltipInfo): { text: string } => ({
    text: `${info.argumentText ?? ''}\n${this.selectedCurrencyRow() ?? 'Value'}: ${info.valueText ?? ''}`
  });

  async ngOnInit(): Promise<void> {
    await this.reloadLatest();
  }

  async onBaseCurrencyChanged(code: string): Promise<void> {
    if (code) {
      this.baseCurrency.setSelectedCurrency(code);
      await this.reloadLatest();
      this.clearHourly();
    }
  }

  refreshRates(): void {
    void this.reloadLatest();
  }

  private async reloadLatest(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const baseCurrency = this.selectedBaseCurrency();
      const requestedSymbols = [...ALLOWED_CURRENCY_CODES, ...REQUESTED_COMMODITY_CODES].join(',');

      const query = new Map<string, string>([
        ['baseCurrency', baseCurrency],
        ['currencies', requestedSymbols]
      ]);

      const response = await firstValueFrom(
        this.api.get<MetalPriceLatestResponse>('metal-prices/latest', query)
      );

      if (response?.success === false || response?.error) {
        throw new Error(response?.error?.message || 'Metalprice API returned an error.');
      }

      const source = this.resolveRatesSource(response);
      this.currencies.set(this.toRows(source, ALLOWED_CURRENCY_CODES));
      this.commodities.set(this.toCommodityRows(source));
    } catch (error) {
      this.error.set(this.resolveErrorMessage(error));
      this.commodities.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as {
        error?: { message?: string };
        message?: string;
      } | null;

      if (payload?.error?.message) {
        return payload.error.message;
      }

      if (payload?.message) {
        return payload.message;
      }

      return error.message || 'Failed to load metal price data.';
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Failed to load metal price data.';
  }

  private resolveRatesSource(response: MetalPriceLatestResponse): Record<string, number> {
    if (response?.rates) {
      return response.rates;
    }

    if (response?.currencies || response?.metals) {
      return {
        ...(response.currencies ?? {}),
        ...(response.metals ?? {})
      };
    }

    return {};
  }

  private toRows(source: Record<string, number>, codes: string[]): RateRow[] {
    const normalized = new Map<string, number>();

    for (const [key, value] of Object.entries(source ?? {})) {
      normalized.set(key.toUpperCase(), value);
    }

    const rows: RateRow[] = [];
    for (const code of codes) {
      const value = normalized.get(code);
      if (value !== undefined) {
        rows.push({
          code,
          description: CURRENCY_DESCRIPTION_BY_CODE.get(code) ?? code,
          value
        });
      }
    }

    return rows;
  }

  private toCommodityRows(source: Record<string, number>): CommodityRow[] {
    const normalized = new Map<string, number>();
    for (const [key, value] of Object.entries(source ?? {})) {
      normalized.set(key.toUpperCase(), value);
    }

    const rows: CommodityRow[] = [];
    for (const commodity of SHARED_METAL_SYMBOLS) {
      const value = this.resolveCommodityValue(normalized, commodity.sourceKeys);
      if (value !== undefined) {
        rows.push({
          code: commodity.code,
          description: commodity.description,
          value
        });
      }
    }

    return rows;
  }

  private resolveCommodityValue(source: Map<string, number>, sourceKeys: string[]): number | undefined {
    for (const key of sourceKeys) {
      const value = source.get(key.toUpperCase());
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  selectCurrencyRow(code: string): void {
    this.selectedCurrencyRow.set(code);
  }

  loadHourlyFromButton(event: { event?: { stopPropagation?: () => void } }, code: string): void {
    event?.event?.stopPropagation?.();
    this.selectedCurrencyRow.set(code);
    void this.loadHourlyRates(code);
  }

  private async loadHourlyRates(currency: string): Promise<void> {
    this.hourlyLoading.set(true);
    this.hourlyError.set(null);

    try {
      const base = this.selectedBaseCurrency();
      let endDate = this.formatDateForApi(new Date());
      let response = await this.fetchHourly(base, currency, endDate);

      if ((response?.success === false || response?.error) && this.isFutureDateError(response?.error?.message)) {
        endDate = this.shiftDateByDays(endDate, -1);
        response = await this.fetchHourly(base, currency, endDate);
      }

      if (response?.success === false || response?.error) {
        throw new Error(response?.error?.message || 'Metalprice hourly API returned an error.');
      }

      const rows = (response.rates ?? [])
        .map((entry) => ({
          timestamp: this.toDisplayTimestamp(entry.timestamp),
          timestampDate: new Date(entry.timestamp * 1000),
          value: this.resolveHourlyValue(entry.rates, currency, base)
        }))
        .filter((row): row is HourlyRateRow => row.value !== undefined);

      this.hourlyRates.set(rows);
      this.chartVisualRange.set(this.buildInitialVisualRange(rows));
    } catch (error) {
      this.hourlyError.set(this.resolveErrorMessage(error));
      this.hourlyRates.set([]);
      this.chartVisualRange.set(null);
    } finally {
      this.hourlyLoading.set(false);
    }
  }

  private async fetchHourly(base: string, currency: string, endDate: string): Promise<MetalPriceHourlyResponse> {
    const startDate = this.shiftDateByDays(endDate, -1);
    const query = new Map<string, string>([
      ['base', base],
      ['currency', currency],
      ['start_date', startDate],
      ['end_date', endDate]
    ]);

    return await firstValueFrom(
      this.api.get<MetalPriceHourlyResponse>('metal-prices/hourly', query)
    );
  }

  private isFutureDateError(message?: string): boolean {
    return (message ?? '').toLowerCase().includes('future date');
  }

  private shiftDateByDays(dateText: string, days: number): string {
    const [year, month, day] = dateText.split('-').map((value) => Number(value));
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    return this.formatDateForApi(d);
  }

  private buildInitialVisualRange(rows: HourlyRateRow[]): [Date, Date] | null {
    if (rows.length < 2) {
      return null;
    }

    const source = rows.length > 1 ? rows.slice(0, -1) : rows;
    if (source.length === 0) {
      return null;
    }

    const windowSize = Math.min(24, source.length);
    const start = source[source.length - windowSize].timestampDate;
    const end = source[source.length - 1].timestampDate;
    return [start, end];
  }

  private resolveHourlyValue(rates: Record<string, number>, currency: string, base: string): number | undefined {
    const normalized = new Map<string, number>();
    for (const [key, value] of Object.entries(rates ?? {})) {
      normalized.set(key.toUpperCase(), value);
    }

    const direct = normalized.get(currency.toUpperCase());
    if (direct !== undefined) {
      return direct;
    }

    const pair = normalized.get(`${base}${currency}`.toUpperCase());
    if (pair !== undefined) {
      return pair;
    }

    return normalized.get(`${currency}${base}`.toUpperCase());
  }

  private toDisplayTimestamp(unixSeconds: number): string {
    const d = new Date(unixSeconds * 1000);
    const yy = String(d.getFullYear() % 100).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yy}-${mm}-${dd} ${hh}:${mi}`;
  }

  private formatDateForApi(date: Date): string {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private clearHourly(): void {
    this.selectedCurrencyRow.set(null);
    this.hourlyError.set(null);
    this.hourlyRates.set([]);
    this.chartVisualRange.set(null);
  }
}

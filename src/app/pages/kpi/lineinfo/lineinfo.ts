import { Component, OnDestroy, OnInit, computed, effect, input, output, signal } from '@angular/core';
import { DxDropDownButtonModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { WithDestroy } from '@app/helpers/WithDestroy';
import { CommonModule } from '@angular/common';
import { interval, takeUntil } from 'rxjs';
import { MenuClickEvent } from '@app/models/menu-events.model';

export interface GridDataDto {
  sets: GridDataSetDto[];
}

export interface GridDataSetDto {
  set: number;
  rows: GridRowDto[];
}

export interface GridRowDto {
  material: string;
  campaign: number;
  client: string;
  order: number;
  dimset: string;
}

@Component({
  selector: 'app-lineinfo',
  imports: [CommonModule,DxDropDownButtonModule, DxLoadIndicatorModule],
  templateUrl: './lineinfo.html',
  styleUrl: './lineinfo.scss',
})

export class Lineinfo extends WithDestroy() implements OnInit, OnDestroy {
  remove = output<void>();
  lineId = input<string | undefined>();
  mtrsStartValue = input<number>(70);
  mtrsEndValue = input<number>(7810);
  status = input<'running' | 'stop' | 'random'>('running');
  minRandomMs = input<number>(10_000);
  maxRandomMs = input<number>(15_000);
  useMockDataSet = input<number>(1);

  public mockGridData: GridDataDto = {
  sets: [
    {
      set: 1,
      rows: [
        {
          material: 'ALU',
          campaign: 343099,
          client: 'Prefa GmbH',
          order: 980665,
          dimset: '650X0,67 00R4103.25',
        },
        {
          material: 'ALU',
          campaign: 343099,
          client: 'Prefa Aluminiumprodukte GmbH',
          order: 200645,
          dimset: '1200x1,18 00R4103.25',
        },
        {
          material: 'ALU',
          campaign: 343099,
          client: 'Elementbau Gunzner GmbH',
          order: 129652,
          dimset: '1455X0,50 F-8887F HAM.1 in PEH',
        },
      ],
    },
    {
      set: 2,
      rows: [
        {
          material: 'ALU',
          campaign: 343086,
          client: 'Tegos GmbH & Co. KG',
          order: 130507,
          dimset: '1750X0,80 90H0110.70 FOIL',
        },
        {
          material: 'ALU',
          campaign: 343086,
          client: 'Prefa Aluminiumprodukte GmbH',
          order: 130545,
          dimset: '2400X0,80 90H0925.90 FOLIE',
        },
        {
          material: 'ALU',
          campaign: 343086,
          client: 'Carthago Proizvodnja',
          order: 127444,
          dimset: '2416X0,80 70H1099.90 FOLIE',
        },
      ],
    },
    
  ],
};
  private readonly metersStep = 3;
  private readonly minStopHoldMs = 10_000;
  private readonly autoStopRange = { min: 250, max: 253 };
  private readonly autoStopDurationMs = 20_000;
  mtrs = signal(0);
  private mockRowIndex = signal(0);
  private statusOverride = signal<'running' | 'stop' | null>(null);
  private overrideTimeout: ReturnType<typeof setTimeout> | null = null;
  private randomStatus = signal<'running' | 'stop'>('running');
  progressPercent = computed(() => {
    const start = this.mtrsStartValue();
    const end = this.mtrsEndValue();
    const current = this.mtrs();
    const range = end - start;
    if (range <= 0) {
      return 0;
    }
    const ratio = (current - start) / range;
    const clamped = Math.max(0, Math.min(1, ratio));
    return clamped * 100;
  });
  displayStatus = computed(() => {
    const override = this.statusOverride();
    if (override) {
      return override;
    }
    const currentStatus = this.status();
    if (currentStatus === 'random') {
      return this.randomStatus();
    }
    return currentStatus;
  });

  loading = true;
  rows: { label: string; value: string | number | null; color?: string }[] = [];
  menuItems = [
    { id: 'configure', text: 'Configure' },
    { id: 'remove', text: 'Remove' }
  ];
  
 constructor() {
   super();
 
      effect((onCleanup) => {
        if (this.status() !== 'random') {
          this.randomStatus.set('running');
          return;
        }

        this.randomStatus.set('running');
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const scheduleToggle = () => {
          const delay = this.nextRandomDelayMs(this.randomStatus());
          timeoutId = setTimeout(() => {
            this.randomStatus.update((current) => (current === 'running' ? 'stop' : 'running'));
            scheduleToggle();
          }, delay);
        };

        scheduleToggle();

        onCleanup(() => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        });
      });

   effect(() => {
     this.rows = this.mapRows();
   });
  }

  ngOnInit():void {
    this.loading = false;
    this.mtrs.set(this.mtrsStartValue());
    this.startMetersTicker();
  }

  handleMenuItemClick(e: MenuClickEvent): void {
    const id = e?.itemData?.id;
    if (id === 'remove') this.remove.emit();
    if (id === 'configure') {
      return;
    }
  }

  private mapRows() {
    const rows = this.getMockRows();
    const row = rows.length > 0 ? rows[this.mockRowIndex() % rows.length] : undefined;
    return [
      { label: 'Campaign', value: row?.campaign ?? '—' },
      { label: 'Client', value: row?.client ?? '—' },
      { label: 'Order', value: row?.order ?? '—' },
      { label: 'Dimset', value: row?.dimset ?? '—' },
    ];
  }

  private startMetersTicker(): void {
    interval(500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.displayStatus() === 'stop') {
          return;
        }
        const startValue = this.mtrsStartValue();
        const endValue = this.mtrsEndValue();
        const current = this.mtrs();
        const nextValue = current + this.metersStep;

        if (this.shouldTriggerAutoStop(current, nextValue)) {
          this.applyAutoStop(current);
          return;
        }

        if (current >= endValue) {
          this.mtrs.set(startValue);
          this.advanceMockRowIndex();
          return;
        }
        this.mtrs.set(nextValue);
      });
  }

  private shouldTriggerAutoStop(currentValue: number, nextValue: number): boolean {
    if (this.statusOverride() === 'stop') {
      return false;
    }
    const { min, max } = this.autoStopRange;
    const id = this.lineId();
    const enteringRange = currentValue < min && nextValue >= min && nextValue <= max;
    return enteringRange && id?.toUpperCase() === 'WPL';
  }

  private applyAutoStop(currentValue: number): void {
    this.mtrs.set(currentValue+5);
    this.statusOverride.set('stop');
    this.clearOverrideTimeout();
    this.overrideTimeout = setTimeout(() => {
      this.statusOverride.set(null);
      this.overrideTimeout = null;
    }, this.autoStopDurationMs);
  }

  private clearOverrideTimeout(): void {
    if (this.overrideTimeout) {
      clearTimeout(this.overrideTimeout);
      this.overrideTimeout = null;
    }
  }

  private randomDelayMs(): number {
    const min = this.minRandomMs();
    const max = this.maxRandomMs();
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const range = safeMax - safeMin;
    return Math.floor(Math.random() * (range + 1)) + safeMin;
  }

  private nextRandomDelayMs(currentStatus: 'running' | 'stop'): number {
    const delay = this.randomDelayMs();
    if (currentStatus === 'stop') {
      return Math.max(delay, this.minStopHoldMs);
    }
    return delay;
  }

  private getMockRows(): GridRowDto[] {
    const setId = this.useMockDataSet();
    return this.mockGridData.sets.find((set) => set.set === setId)?.rows ?? [];
  }

  private advanceMockRowIndex(): void {
    const rows = this.getMockRows();
    if (rows.length === 0) {
      this.mockRowIndex.set(0);
      return;
    }
    this.mockRowIndex.update((index) => (index + 1) % rows.length);
  }

  override ngOnDestroy(): void {
    this.clearOverrideTimeout();
    super.ngOnDestroy();
  }
}

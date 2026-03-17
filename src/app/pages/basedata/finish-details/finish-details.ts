import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { FinishDto, FinishPaintLayerDto } from '@app/models/finish.model';
import { ApiService } from '@services/api.service';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxPopupModule } from 'devextreme-angular';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '@app/helpers/WithDestroy';

interface FinishForm {
  id: number | null;
  finishCode: string;
  paintLine: string;
  customer: string;
  customerNumber: string;
  substrate: string;
  surfaceTreatment: string;
  surfaceQuality: string;
  preTreatment: string;
  runs: number | null;
  side: string;
  maxSpeedRun1: number | null;
  maxSpeedRun2: number | null;
  maxSpeedRun3: number | null;
  state: string;
  version: string;
  layerCount: number;
}

@Component({
  selector: 'app-finish-details',
  imports: [CommonModule, AmsLoadPanelComponent, DxFormModule, DxPopupModule, DxButtonModule, DxDataGridModule],
  templateUrl: './finish-details.html',
  styleUrl: './finish-details.scss',
})
export class FinishDetails extends WithDestroy() {
  visible = input<boolean>(false);
  paintLayerRecipeId = input<number | null>(null);
  closed = output<void>();

  private api = inject(ApiService);
  finish = signal<FinishDto | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  form = signal<FinishForm>(this.emptyForm());

  constructor() {
    super();

    effect(() => {
      if (!this.visible()) {
        this.finish.set(null);
        this.form.set(this.emptyForm());
        this.errorMessage.set(null);
        this.loading.set(false);
        return;
      }

      const requestId = this.paintLayerRecipeId();
      if (requestId === null) {
        this.finish.set(null);
        this.form.set(this.emptyForm());
        this.errorMessage.set('No layer recipe id provided.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.errorMessage.set(null);

      this.api.get<FinishDto>(`paintlayer-recipes/${requestId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            const value = data ?? null;
            this.finish.set(value);
            this.form.set(this.toForm(value));
            this.loading.set(false);
          },
          error: (err) => {
            console.error('finish-details load failed', err);
            this.errorMessage.set('Failed to load finish details.');
            this.loading.set(false);
          }
        });
    });
  }

  handleClose(): void {
    this.closed.emit();
  }

  onCancel(): void {
    this.handleClose();
   }
  onSave(): void {
    this.handleClose();
   }
  private emptyForm(): FinishForm {
    return {
      id: null,
      finishCode: '',
      paintLine: '',
      customer: '',
      customerNumber: '',
      substrate: '',
      surfaceTreatment: '',
      surfaceQuality: '',
      preTreatment: '',
      runs: null,
      side: '',
      maxSpeedRun1: null,
      maxSpeedRun2: null,
      maxSpeedRun3: null,
      state: '',
      version: '',
      layerCount: 0,
    };
  }

  private toForm(data: FinishDto | null): FinishForm {
    if (!data) {
      return this.emptyForm();
    }

    return {
      id: data.id ?? null,
      finishCode: data.finishCode ?? '',
      paintLine: data.paintLine ?? '',
      customer: data.customer ?? '',
      customerNumber: data.customerNumber ?? '',
      substrate: data.substrate ?? '',
      surfaceTreatment: data.surfaceTreatment ?? '',
      surfaceQuality: data.surfaceQuality ?? '',
      preTreatment: data.preTreatment ?? '',
      runs: data.runs ?? null,
      side: data.side ?? '',
      maxSpeedRun1: data.maxSpeedRun1 ?? null,
      maxSpeedRun2: data.maxSpeedRun2 ?? null,
      maxSpeedRun3: data.maxSpeedRun3 ?? null,
      state: data.state ?? '',
      version: data.version ?? '',
      layerCount: data.paintLayers?.length ?? 0,
    };
  }

  paintLayerRows(): FinishPaintLayerDto[] {
    return this.finish()?.paintLayers ?? [];
  }

}

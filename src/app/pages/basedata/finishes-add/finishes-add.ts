import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import { LookupsService } from '@app/services/lookups.service';

interface CreateLayerForm {
  layerNumber: number;
  paintCode: string;
  layerThickness: number;
}

interface CreateRecipeForm {
  finishCode: string;
  paintLine: string;
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
  paintLayers: CreateLayerForm[];
}

interface CreateRecipePayload {
  finishCode: string;
  paintLine: string;
  customerNumber: string;
  substrate: string;
  surfaceTreatment: string;
  surfaceQuality: string;
  preTreatment: string;
  runs: number | null;
  side: string;
  maxSpeedRun1?: number;
  maxSpeedRun2?: number;
  maxSpeedRun3?: number;
  state: string;
  paintLayers: CreateLayerForm[];
}

interface InitNewLayerRowEvent {
  data?: CreateLayerForm;
}

@Component({
  selector: 'app-finishes-add',
  standalone: true,
  imports: [CommonModule, DxPopupModule, DxFormModule, DxButtonModule, DxDataGridModule, DxSelectBoxModule],
  templateUrl: './finishes-add.html',
  styleUrl: './finishes-add.scss',
})
export class FinishesAdd {
  visible = input<boolean>(false);

  closed = output<void>();
  saved = output<void>();

  loading = false;
  paintLineOptions: string[] = [];
  substrateOptions: string[] = [];
  stateOptions: string[] = ['Trial', 'Released', 'Blocked', 'Archived'];
  sideOptions: string[] = ['FrontSide', 'BackSide', 'BothSides'];

  model: CreateRecipeForm = this.createEmptyRecipe();

  constructor(private api: ApiService, private lookups: LookupsService) {
    this.lookups.getProductionLineNames().subscribe((items) => {
      this.paintLineOptions = items ?? [];
    });

    this.lookups.getSubstrates().subscribe((items) => {
      this.substrateOptions = items ?? [];
    });
  }

  onCancel(): void {
    this.model = this.createEmptyRecipe();
    this.closed.emit();
  }

  onSave(): void {
    const validationErrors = this.validate();
    if (validationErrors.length > 0) {
      notify(validationErrors.join('\n'), 'error', 5000);
      return;
    }

    this.loading = true;
    const payload = this.toCreatePayload(this.model);

    firstValueFrom(this.api.post('paintlayer-recipes', payload))
      .then(() => {
        this.model = this.createEmptyRecipe();
        this.saved.emit();
      })
      .catch((err) => {
        console.error('Create finish failed', err);
        notify('Creating finish failed.', 'error', 4000);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  onInitNewLayerRow(e: InitNewLayerRowEvent): void {
    e.data = {
      layerNumber: (this.model.paintLayers?.length ?? 0) + 1,
      paintCode: '',
      layerThickness: 1,
    } as CreateLayerForm;
  }

  private createEmptyRecipe(): CreateRecipeForm {
    return {
      finishCode: '',
      paintLine: '',
      customerNumber: '',
      substrate: '',
      surfaceTreatment: '',
      surfaceQuality: '',
      preTreatment: '',
      runs: 1,
      side: 'FrontSide',
      maxSpeedRun1: null,
      maxSpeedRun2: null,
      maxSpeedRun3: null,
      state: 'Trial',
      paintLayers: [],
    };
  }

  private toCreatePayload(source: CreateRecipeForm): CreateRecipePayload {
    const maxSpeedRun1 = this.normalizeOptionalSpeed(source.maxSpeedRun1);
    const maxSpeedRun2 = this.normalizeOptionalSpeed(source.maxSpeedRun2);
    const maxSpeedRun3 = this.normalizeOptionalSpeed(source.maxSpeedRun3);

    return {
      finishCode: source.finishCode,
      paintLine: source.paintLine,
      customerNumber: source.customerNumber,
      substrate: source.substrate,
      surfaceTreatment: source.surfaceTreatment,
      surfaceQuality: source.surfaceQuality,
      preTreatment: source.preTreatment,
      runs: source.runs,
      side: source.side,
      ...(maxSpeedRun1 !== undefined ? { maxSpeedRun1 } : {}),
      ...(maxSpeedRun2 !== undefined ? { maxSpeedRun2 } : {}),
      ...(maxSpeedRun3 !== undefined ? { maxSpeedRun3 } : {}),
      state: source.state,
      paintLayers: (source.paintLayers ?? []).map((layer) => ({
        layerNumber: layer.layerNumber,
        paintCode: layer.paintCode,
        layerThickness: layer.layerThickness,
      })),
    };
  }

  private normalizeOptionalSpeed(value: number | null | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value >= 1 && value <= 100 ? value : undefined;
  }

  private validate(): string[] {
    const errors: string[] = [];

    if (!this.model.finishCode?.trim()) errors.push('Finish code is mandatory.');
    if (!this.model.paintLine?.trim()) errors.push('Paint line is mandatory.');
    if (!this.model.substrate?.trim()) errors.push('Substrate is mandatory.');
    if (!this.model.preTreatment?.trim()) errors.push('Pre treatment is mandatory.');
    if (this.model.runs === null || this.model.runs === undefined) errors.push('Runs is mandatory.');
    if (!this.model.side?.trim()) errors.push('Side is mandatory.');
    if (!this.model.state?.trim()) errors.push('State is mandatory.');

    if (!this.model.paintLayers?.length) {
      errors.push('At least one paint layer is mandatory.');
    }

    (this.model.paintLayers ?? []).forEach((layer, index) => {
      const row = index + 1;
      if (layer.layerNumber === null || layer.layerNumber === undefined) {
        errors.push(`Paint layer ${row}: layer number is mandatory.`);
      }
      if (!layer.paintCode?.trim()) {
        errors.push(`Paint layer ${row}: paint code is mandatory.`);
      }
      if (layer.layerThickness === null || layer.layerThickness === undefined) {
        errors.push(`Paint layer ${row}: layer thickness is mandatory.`);
      }
    });

    return errors;
  }
}

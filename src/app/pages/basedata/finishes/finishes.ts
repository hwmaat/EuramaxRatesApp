import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { FinishDto, FinishPaintLayerDto, FinishPaintDto, FinishPaintSystemDto, ManufacturerDto, PaintLayerSide, State, UpdatePaintLayerRecipeDto } from '@app/models/finish.model';
import { DeleteRecordEvent, RowRemovingEvent, SelectionChangedEvent } from '@app/models/grid-events.model';
import { FinishesAdd } from '@app/pages/basedata/finishes-add/finishes-add';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxPopupModule, DxSelectBoxModule, DxToolbarModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';

interface RawPaintLayerRecipe {
  id?: number;
  finishCode?: string;
  paintLine?: string;
  customer?: string;
  customerNumber?: string;
  substrate?: string;
  surfaceTreatment?: string;
  surfaceQuality?: string;
  preTreatment?: string;
  runs?: number;
  side?: string;
  maxSpeedRun1?: number;
  maxSpeedRun2?: number;
  maxSpeedRun3?: number;
  state?: string;
  version?: string;
  paintLayers?: RawPaintLayer[];
}

interface RawPaintLayer {
  id?: number;
  layerNumber?: number;
  side?: string;
  paintCode?: string;
  paintDescription?: string;
  layerThickness?: number;
  paintSystem?: string;
  manufacturer?: string;
  metallicType?: string;
  nonWhite?: boolean;
  aluNatur?: boolean;
  volumeFractionOfSolid?: number;
  isPrimer?: boolean;
  isWrinkle?: boolean;
  isTransparentOrClearCoat?: boolean;
}

@Component({
  selector: 'app-finishes',
  imports: [
    CommonModule,
    AmsLoadPanelComponent,
    DxToolbarModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxSelectBoxModule,
    FinishesAdd,
  ],
  templateUrl: './finishes.html',
  styleUrl: './finishes.scss',
})
export class Finishes extends BaseGrid<FinishDto> implements OnInit, AfterViewInit {
  readonly EditMode = EditMode;
  loadingMessage = 'loading....';
  selectedRowKeys: number[] = [];
  isAddPopupVisible = false;
  isUpdatePopupVisible = false;
  stateOptions: string[] = ['Trial', 'Released', 'Blocked', 'Archived'];
  updateModel: {
    id: number;
    state: string;
    maxSpeedRun1: number | null;
    maxSpeedRun2: number | null;
    maxSpeedRun3: number | null;
  } = this.createEmptyUpdateModel();

  constructor() {
    super();
    this.entityEndpoint = 'paintlayer-recipes';
    this.entityName = 'FinishDto';
    this.recordIdField = 'id';
    this.showColumnLinesSwitch = true;
    this.showInlineEditButton = false;
    this.showGridCaption = false;
    this.showAddButton = true;
    this.showTreeButton = true;
    this.showMultiSelect = false;
  }

  ngOnInit(): void {
    // Base grid loads data via toolbar actions.
  }

  ngAfterViewInit(): void {
    this.showExportButton = true;
    this.showTreeButton = true;
    this.editInline = false;
  }

  public override refresh(): void {
    this.loading = true;
    this.records = [];

    this.api.get<RawPaintLayerRecipe[]>(this.entityEndpoint)
      .subscribe({
        next: (result) => {
          this.records = (result ?? []).map((item) => this.mapToFinishDto(item));
          this.loading = false;
        },
        error: (err) => {
          console.error('Loading finishes failed', err);
          this.loading = false;
        }
      });
  }

  onSelectionChanged(e: SelectionChangedEvent<number>): void {
    this.selectedRowKeys = e.selectedRowKeys ?? [];
  }

  onRowRemoving(e: RowRemovingEvent<unknown>): void {
    const result = firstValueFrom(this.api.delete(`${this.entityEndpoint}/${e.key}`));
    e.cancel = new Promise<boolean>((resolve, reject) => {
      result
        .then(() => {
          resolve(false);
        })
        .catch((err) => {
          console.error('Deleting failed', err);
          reject(err?.message || 'Unknown error');
        });
    });
  }

  ResetEdit(): void {
    this.editMode = EditMode.Read;
  }

  SaveRecord = (_e?: unknown): void => {
    this.gridx.instance.saveEditData();
  }

  public override addRecord(): void {
    this.editMode = EditMode.Add;
    this.isAddPopupVisible = true;
  }

  EditRecord = (e: DeleteRecordEvent<Partial<FinishDto>, unknown>): void => {
    this.editMode = EditMode.Edit;
    this.updateModel = {
      id: e.data?.id ?? 0,
      state: e.data?.state ?? 'Trial',
      maxSpeedRun1: e.data?.maxSpeedRun1 ?? null,
      maxSpeedRun2: e.data?.maxSpeedRun2 ?? null,
      maxSpeedRun3: e.data?.maxSpeedRun3 ?? null,
    };
    this.isUpdatePopupVisible = true;
  }

  DeleteRecord = (e: DeleteRecordEvent<Partial<FinishDto>, unknown>): void => {
    const recordId = e.data?.id ?? e.key;
    const result = confirm(`Are you sure you want to delete record #${recordId}?`, 'Confirm Delete');
    result.then((dialogResult) => {
      if (dialogResult) {
        this.editMode = EditMode.Delete;
        this.gridx.instance.deleteRow(e.row.rowIndex);
        this.editMode = EditMode.Read;
      }
    });
  }

  CancelEdit = (_e?: unknown): void => {
    this.gridx.instance.cancelEditData();
    this.editMode = EditMode.Read;
  }

  onAddPopupClosed(): void {
    this.isAddPopupVisible = false;
    this.editMode = EditMode.Read;
  }

  onAddPopupSaved(): void {
    this.isAddPopupVisible = false;
    this.editMode = EditMode.Read;
    this.refresh();
  }

  onUpdatePopupClosed(): void {
    this.isUpdatePopupVisible = false;
    this.updateModel = this.createEmptyUpdateModel();
    this.editMode = EditMode.Read;
  }

  onUpdatePopupSaved(): void {
    if (!this.updateModel.id) {
      return;
    }

    const validationErrors = this.validateUpdateModel();
    if (validationErrors.length > 0) {
      notify(validationErrors.join('\n'), 'error', 5000);
      return;
    }

    this.loading = true;
    const payload = this.toUpdatePayload(this.updateModel);

    firstValueFrom(this.api.patch<FinishDto>(`${this.entityEndpoint}/${this.updateModel.id}`, payload))
      .then(() => {
        this.isUpdatePopupVisible = false;
        this.updateModel = this.createEmptyUpdateModel();
        this.editMode = EditMode.Read;
        this.refresh();
      })
      .catch((err) => {
        console.error('Saving finish failed', err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private toUpdatePayload(source: {
    state: string;
    maxSpeedRun1: number | null;
    maxSpeedRun2: number | null;
    maxSpeedRun3: number | null;
  }): Partial<UpdatePaintLayerRecipeDto> {
    const payload: Partial<UpdatePaintLayerRecipeDto> = {
      state: this.normalizeState(source.state),
    };

    const maxSpeedRun1 = this.normalizeOptionalSpeed(source.maxSpeedRun1);
    const maxSpeedRun2 = this.normalizeOptionalSpeed(source.maxSpeedRun2);
    const maxSpeedRun3 = this.normalizeOptionalSpeed(source.maxSpeedRun3);

    if (maxSpeedRun1 !== undefined) payload.maxSpeedRun1 = maxSpeedRun1;
    if (maxSpeedRun2 !== undefined) payload.maxSpeedRun2 = maxSpeedRun2;
    if (maxSpeedRun3 !== undefined) payload.maxSpeedRun3 = maxSpeedRun3;

    return payload;
  }

  private normalizeOptionalSpeed(value: number | null | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value >= 1 && value <= 100 ? value : undefined;
  }

  paintLayerCount(data: FinishDto): number {
    return data.paintLayers?.length ?? 0;
  }

  paintLayerRows(data: FinishDto): FinishPaintLayerDto[] {
    return data.paintLayers ?? [];
  }

  private createEmptyUpdateModel(): {
    id: number;
    state: string;
    maxSpeedRun1: number | null;
    maxSpeedRun2: number | null;
    maxSpeedRun3: number | null;
  } {
    return {
      id: 0,
      state: 'Trial',
      maxSpeedRun1: null,
      maxSpeedRun2: null,
      maxSpeedRun3: null,
    };
  }

  private validateUpdateModel(): string[] {
    const errors: string[] = [];

    if (!this.updateModel.state?.trim()) {
      errors.push('State is mandatory.');
    }

    this.validateOptionalSpeed('Max Speed Run 1', this.updateModel.maxSpeedRun1, errors);
    this.validateOptionalSpeed('Max Speed Run 2', this.updateModel.maxSpeedRun2, errors);
    this.validateOptionalSpeed('Max Speed Run 3', this.updateModel.maxSpeedRun3, errors);

    return errors;
  }

  private validateOptionalSpeed(label: string, value: number | null, errors: string[]): void {
    if (value === null || value === undefined) {
      return;
    }

    if (value < 1 || value > 100) {
      errors.push(`${label} must be between 1 and 100.`);
    }
  }

  private mapToFinishDto(source: RawPaintLayerRecipe): FinishDto {
    return {
      id: source.id ?? 0,
      finishCode: source.finishCode ?? '',
      paintLine: source.paintLine ?? '',
      customer: source.customer ?? '',
      customerNumber: source.customerNumber ?? '',
      substrate: source.substrate ?? '',
      surfaceTreatment: source.surfaceTreatment ?? '',
      surfaceQuality: source.surfaceQuality ?? '',
      preTreatment: source.preTreatment ?? '',
      runs: source.runs ?? 0,
      side: this.normalizeSide(source.side),
      maxSpeedRun1: source.maxSpeedRun1 ?? 0,
      maxSpeedRun2: source.maxSpeedRun2 ?? 0,
      maxSpeedRun3: source.maxSpeedRun3 ?? 0,
      state: this.normalizeState(source.state),
      version: source.version ?? '',
      paintLayers: (source.paintLayers ?? []).map((layer) => this.mapToFinishPaintLayerDto(layer)),
    };
  }

  private mapToFinishPaintLayerDto(source: RawPaintLayer): FinishPaintLayerDto {
    const manufacturer: ManufacturerDto = {
      id: null,
      name: source.manufacturer ?? null,
    };

    const paintSystem: FinishPaintSystemDto = {
      id: null,
      name: source.paintSystem ?? null,
      manufacturer,
    };

    const paint: FinishPaintDto = {
      id: null,
      paintCode: source.paintCode ?? null,
      paintDescription: source.paintDescription ?? null,
      metallicType: source.metallicType ?? null,
      nonWhite: source.nonWhite ?? null,
      aluNatur: source.aluNatur ?? null,
      volumeFractionOfSolid: source.volumeFractionOfSolid ?? null,
      isPrimer: source.isPrimer ?? null,
      isWrinkle: source.isWrinkle ?? null,
      isTransparentOrClearCoat: source.isTransparentOrClearCoat ?? null,
      paintSystemId: null,
    };

    return {
      id: source.id ?? 0,
      layerNumber: source.layerNumber ?? 0,
      side: this.normalizeSide(source.side),
      layerThickness: source.layerThickness ?? 0,
      paint,
      paintSystem,
    };
  }

  private normalizeSide(value: string | undefined): PaintLayerSide {
    if (value === 'BackSide' || value === 'BothSides' || value === 'FrontSide') {
      return value;
    }
    return 'FrontSide';
  }

  private normalizeState(value: string | undefined): State {
    if (value === 'Released' || value === 'Blocked' || value === 'Archived' || value === 'Trial') {
      return value;
    }
    return 'Trial';
  }


}

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { DeleteRecordEvent, InlineEditEvent, RowRemovingEvent, SelectionChangedEvent } from '@app/models/grid-events.model';
import { OvenSettingDto, OvenSettingsPatchDto, OvenSettingState } from '@app/models/ovensetting.model';
import { ProductionLine } from '@app/models/productionlines.options';
import { LookupsService } from '@app/services/lookups.service';
import { DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxToolbarModule } from 'devextreme-angular';
import { firstValueFrom } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-ovensettings',
  imports: [CommonModule, AmsLoadPanelComponent, DxToolbarModule, DxDataGridModule, DxButtonModule, DxSelectBoxModule],
  templateUrl: './ovensettings.html',
  styleUrl: './ovensettings.scss',
})
export class Ovensettings extends BaseGrid<OvenSettingDto> implements OnInit, AfterViewInit{
readonly EditMode = EditMode;
loadingMessage = "loading....";
selectedRowKeys: number[] = [];
private pendingInsertedRowId: number | null = null;
readonly stateOptions: OvenSettingState[] = ['Trial', 'Released', 'Blocked', 'Archived'];
paintLineOptions: ProductionLine[] = [];
substrateOptions: string[] = [];
readonly paintLineEditorOptions: Record<string, unknown> = {
  items: this.paintLineOptions,
  displayExpr: 'productionLine',
  valueExpr: 'id',
  searchEnabled: true,
  showClearButton: true,
  placeholder: 'Geen productielijnen beschikbaar',
};
readonly substrateEditorOptions: Record<string, unknown> = {
  items: this.substrateOptions,
  searchEnabled: true,
  showClearButton: true,
  placeholder: 'Geen substrates beschikbaar',
};
readonly stateEditorOptions: Record<string, unknown> = {
  items: this.stateOptions,
};
readonly lineSpeedEditorOptions: Record<string, unknown> = {
  showSpinButtons: true,
  step: 1,
  format: '#,##0',
};
readonly zoneEditorOptions: Record<string, unknown> = {
  showSpinButtons: true,
  step: 1,
  format: '#,##0',
};
private lookups = inject(LookupsService);
private readonly addOnlyEditableFields = new Set(['productionLineId', 'thickness', 'lineSpeed', 'substrate']);


  constructor(){
    super();
    this.entityEndpoint = 'ovensettings';
    this.entityName = 'OvenSettingDto';
    this.recordIdField = "id";
    this.showColumnLinesSwitch=true;
    this.showInlineEditButton = false;
    this.showGridCaption=false;
    this.showAddButton=true;
    this.showTreeButton=true;
    this.showMultiSelect=false;
}

 ngOnInit(): void {
   this.loadPaintLineOptions();
   this.loadSubstrateOptions();
   this.refresh();
 }

 private loadPaintLineOptions(): void {
   firstValueFrom(this.lookups.getProductionLines()).then((items) => {
    this.paintLineOptions.splice(0, this.paintLineOptions.length, ...(items ?? []));
   });
 }

 private loadSubstrateOptions(): void {
   firstValueFrom(this.lookups.getSubstrates()).then((items) => {
    this.substrateOptions.splice(0, this.substrateOptions.length, ...(items ?? []));
   });
 }

 public ngAfterViewInit(): void {
    this.showExportButton=true;
    this.showTreeButton=true;
   this.editInline = false;
 }
  public override refresh(): void {
    this.records = [];
    const spParams = new Map();
    this.loadDataDirect(spParams);
  }

  onSelectionChanged(e: SelectionChangedEvent<number>) {
    this.selectedRowKeys = e.selectedRowKeys ?? [];
  }
  onRowRemoving(e: RowRemovingEvent<unknown>){
      const id = e.key;
      const result = firstValueFrom(this.api.delete(`${this.entityEndpoint}/${id}`));

      e.cancel = new Promise<boolean>((resolve, reject) => {
        result.then(() => {
          resolve(false);
          this.editMode = EditMode.Read;
        })
        .catch((err) => {
          console.error('Deleting failed', err);
          reject(err?.message || 'Unknown error');
          this.editMode = EditMode.Read;
        });
      });
  }

  ResetEdit() {
      this.editMode = EditMode.Read;
  }

  SaveRecord = (_e?: unknown) => {
    this.gridx.instance.saveEditData();
  }
  public override addRecord(): void {
    const loadLookups = Promise.all([
      this.paintLineOptions.length > 0
        ? Promise.resolve(this.paintLineOptions)
        : firstValueFrom(this.lookups.getProductionLines()),
      this.substrateOptions.length > 0
        ? Promise.resolve(this.substrateOptions)
        : firstValueFrom(this.lookups.getSubstrates()),
    ]);

    loadLookups.then(([paintLines, substrates]) => {
      this.paintLineOptions.splice(0, this.paintLineOptions.length, ...(paintLines ?? []));
      this.substrateOptions.splice(0, this.substrateOptions.length, ...(substrates ?? []));

      this.editMode = EditMode.Add;
      this.gridx.instance.addRow();
    });
  }

  onRowInserted(e?: { key?: unknown; data?: { id?: number | null } }): void {
    this.editMode = EditMode.Read;

    const insertedId = (typeof e?.key === 'number' ? e.key : null)
      ?? (typeof e?.data?.id === 'number' ? e.data.id : null)
      ?? this.pendingInsertedRowId;

    if (insertedId === null || insertedId === undefined) {
      this.pendingInsertedRowId = null;
      return;
    }

    this.pendingInsertedRowId = null;
    this.selectedRowKeys = [insertedId];
    this.navigateAndFocusRow(insertedId);
  }

  onInitNewRow(_e?: unknown): void {
    this.editMode = EditMode.Add;
  }

  onEditingStart(e: { data?: { id?: unknown } }): void {
    if (e?.data?.id) {
      this.editMode = EditMode.Edit;
    }
  }

  onRowValidating(e: {
    newData?: Partial<OvenSettingDto>;
    oldData?: Partial<OvenSettingDto>;
    isValid?: boolean;
    errorText?: string;
  }): void {
    const merged: Partial<OvenSettingDto> = {
      ...(e.oldData ?? {}),
      ...(e.newData ?? {}),
    };

    const validationErrors: string[] = [];

    const paintLine = (merged.productionLineId ?? '');
    if (!paintLine) {
      validationErrors.push('Paint line is required.');
    }

    const substrate = (merged.substrate ?? '').trim();
    if (!substrate) {
      validationErrors.push('Substrate is required.');
    } else if (substrate.length > 50) {
      validationErrors.push('Substrate can be at most 50 characters.');
    }

    if (typeof merged.thickness !== 'number' || Number.isNaN(merged.thickness) || merged.thickness < 0.01 || merged.thickness > 5.0) {
      validationErrors.push('Thickness must be between 0.01 and 5.0.');
    }

    if (!this.isIntegerInRange(merged.lineSpeed, 1, 2147483647)) {
      validationErrors.push('Line speed must be an integer between 1 and 2147483647.');
    }

    if (!this.isIntegerInRange(merged.zone1, 0, 500)) {
      validationErrors.push('Zone 1 must be an integer between 0 and 500.');
    }

    if (!this.isIntegerInRange(merged.zone2, 0, 500)) {
      validationErrors.push('Zone 2 must be an integer between 0 and 500.');
    }

    if (!this.isIntegerInRange(merged.zone3, 0, 500)) {
      validationErrors.push('Zone 3 must be an integer between 0 and 500.');
    }

    if (!merged.state || !this.stateOptions.includes(merged.state)) {
      validationErrors.push('State must be Trial, Released, Blocked, or Archived.');
    }

    if (typeof merged.version === 'string' && merged.version.length > 50) {
      validationErrors.push('Version can be at most 50 characters.');
    }

    if (validationErrors.length > 0) {
      e.isValid = false;
      e.errorText = validationErrors.join('\n');
      return;
    }

    e.isValid = true;
  }

  onEditorPreparing(e: {
    dataField?: string;
    row?: { isNewRow?: boolean };
    editorName?: string;
    editorOptions?: Record<string, unknown>;
  }): void {
    if (!e?.dataField) return;

    const isNewRow = !!e.row?.isNewRow || this.editMode === EditMode.Add;

    if (e.dataField === 'productionLineId') {
      e.editorName = 'dxSelectBox';
      e.editorOptions = e.editorOptions || {};
      e.editorOptions['items'] = this.paintLineOptions;
      e.editorOptions['displayExpr'] = 'productionLine';
      e.editorOptions['valueExpr'] = 'id';
      e.editorOptions['searchEnabled'] = true;
      e.editorOptions['showClearButton'] = true;
      e.editorOptions['placeholder'] = this.paintLineOptions.length > 0
        ? 'Selecteer productielijn'
        : 'Geen productielijnen beschikbaar';
    }

    if (e.dataField === 'substrate') {
      e.editorName = 'dxSelectBox';
      e.editorOptions = e.editorOptions || {};
      e.editorOptions['items'] = this.substrateOptions;
      e.editorOptions['searchEnabled'] = true;
      e.editorOptions['showClearButton'] = true;
      e.editorOptions['placeholder'] = this.substrateOptions.length > 0
        ? 'Selecteer substrate'
        : 'Geen substrates beschikbaar';
    }

    if (e.dataField === 'lineSpeed') {
      e.editorName = 'dxNumberBox';
      e.editorOptions = {
        ...(e.editorOptions || {}),
        showSpinButtons: true,
        step: 1,
        format: '#,##0',
      };
    }

    if (e.dataField === 'zone1' || e.dataField === 'zone2' || e.dataField === 'zone3') {
      e.editorName = 'dxNumberBox';
      e.editorOptions = {
        ...(e.editorOptions || {}),
        showSpinButtons: true,
        step: 1,
        format: '#,##0',
      };
    }

    if (this.addOnlyEditableFields.has(e.dataField)) {
      e.editorOptions = e.editorOptions || {};
      e.editorOptions['readOnly'] = !isNewRow;
    }
  }

  public override rowInserting = (e: {
    data: Partial<OvenSettingDto>;
    cancel?: boolean | PromiseLike<boolean> | PromiseLike<void>;
  }): void => {
    const payload = this.toCreatePayload(e.data);
    const result = firstValueFrom(this.api.post<OvenSettingDto>(this.entityEndpoint, payload));

    e.cancel = new Promise<boolean>((resolve) => {
      result.then((created) => {
        resolve(false);
        e.data = created;
        this.pendingInsertedRowId = created.id;
        this.editMode = EditMode.Read;
      })
      .catch(() => {
        this.pendingInsertedRowId = null;
        resolve(true);
      });
    });
  }

  public override rowUpdating(e: {
    oldData: Partial<OvenSettingDto>;
    newData: Partial<OvenSettingDto>;
    cancel?: boolean | PromiseLike<boolean> | PromiseLike<void>;
  }): void {
    const updated: Partial<OvenSettingDto> = { ...e.oldData, ...e.newData };

    if (updated.id === undefined || updated.id === null) {
      const createPayload = this.toCreatePayload(updated);
      const createResult = firstValueFrom(this.api.post<OvenSettingDto>(this.entityEndpoint, createPayload));

      e.cancel = new Promise<boolean>((resolve) => {
        createResult.then((created) => {
          resolve(false);
          e.newData = created;
          this.editMode = EditMode.Read;
        })
        .catch(() => {
          resolve(true);
        });
      });
      return;
    }

    const patchDto: OvenSettingsPatchDto = {
      state: updated.state,
      zone1: updated.zone1 ?? null,
      zone2: updated.zone2 ?? null,
      zone3: updated.zone3 ?? null,
    };

    const result = firstValueFrom(this.api.patch<OvenSettingDto>(`${this.entityEndpoint}/${updated.id}`, patchDto));

    e.cancel = new Promise<boolean>((resolve) => {
      result.then((patched) => {
        resolve(false);
        e.newData = patched;
        this.editMode = EditMode.Read;
      })
      .catch(() => {
        resolve(true);
      });
    });
  }

  EditRecord = (e: InlineEditEvent<{ option: (name: string, value: string) => void; editRow: (rowIndex: number) => void }>) => {
    this.startInlineEdit(e);
  }

  startInlineEdit(e: InlineEditEvent<{ option: (name: string, value: string) => void; editRow: (rowIndex: number) => void }>) {
    const rowIndex = e.rowIndex;
    const grid = e.component;
    this.editMode = EditMode.Edit;
    grid.editRow(rowIndex);
  }

    DeleteRecord = (e: DeleteRecordEvent<{ id?: unknown }>) => {
      const result = confirm(`Are you sure you want to delete record #${e.data?.id}?`, 'Confirm Delete');
     result.then((dialogResult) => {
       if (dialogResult) {
        this.editMode = EditMode.Delete;
        this.gridx.instance.deleteRow(e.row.rowIndex);
        this.editMode = EditMode.Read;
       }
     });
  }
  CancelEdit = (_e?: unknown) => {
    this.gridx.instance.cancelEditData();
    this.editMode = EditMode.Read;
  }

  private isIntegerInRange(value: unknown, min: number, max: number): boolean {
    return typeof value === 'number'
      && Number.isInteger(value)
      && value >= min
      && value <= max;
  }

  private toCreatePayload(source: Partial<OvenSettingDto>): Omit<OvenSettingDto, 'id'> {
    return {
      productionLineId: (source.productionLineId ?? null),
      thickness: source.thickness ?? 0,
      lineSpeed: source.lineSpeed ?? 0,
      zone1: source.zone1 ?? 0,
      zone2: source.zone2 ?? 0,
      zone3: source.zone3 ?? 0,
      substrate: (source.substrate ?? '').trim(),
      state: (source.state ?? 'Trial') as OvenSettingState,
      ...(source.version !== undefined ? { version: source.version } : {}),
    };
  }
}

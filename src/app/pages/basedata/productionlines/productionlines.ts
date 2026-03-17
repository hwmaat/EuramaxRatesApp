import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { DeleteRecordEvent, InlineEditEvent, RowRemovingEvent, SelectionChangedEvent } from '@app/models/grid-events.model';
import { CreateProductionLineDto, ProductionLineDto, UpdateProductionLineDto } from '@app/models/productionline.model';
import { DxButtonModule, DxDataGridModule, DxToolbarModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-productionlines',
  imports: [CommonModule, DxToolbarModule, DxDataGridModule, DxButtonModule],
  templateUrl: './productionlines.html',
  styleUrl: './productionlines.scss',
})
export class Productionlines extends BaseGrid<ProductionLineDto> implements OnInit, AfterViewInit {
  readonly EditMode = EditMode;
  loadingMessage = 'loading....';
  selectedRowKeys: number[] = [];
  editingMode: 'row' | 'popup' = 'row';

  constructor() {
    super();
    this.entityEndpoint = 'production-lines';
    this.entityName = 'ProductionLineDto';
    this.recordIdField = 'id';
    this.showColumnLinesSwitch = true;
    this.showInlineEditButton = true;
    this.showGridCaption = false;
    this.showAddButton = true;
    this.showTreeButton = true;
    this.showMultiSelect = false;
  }

  ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
    this.showExportButton = true;
    this.showTreeButton = true;
    this.editInline = true;
  }

  public override refresh(): void {
    this.records = [];
    const spParams = new Map();
    this.loadDataDirect(spParams);
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
          this.editMode = EditMode.Read;
        })
        .catch((err) => {
          console.error('Deleting failed', err);
          reject(err?.message || 'Unknown error');
          this.editMode = EditMode.Read;
        });
    });
  }

  public override rowInserting = (e: { data: Partial<ProductionLineDto>; cancel?: boolean | PromiseLike<boolean> | PromiseLike<void> }): void => {
    const payload = this.toCreatePayload(e.data);
    const result = firstValueFrom(this.api.post<ProductionLineDto>(this.entityEndpoint, payload));

    e.cancel = new Promise<boolean>((resolve, reject) => {
      result.then((created) => {
        resolve(false);
        e.data = created;
        this.editMode = EditMode.Read;
      })
      .catch((err) => {
        console.error('productionlines rowInserting failed', err);
        const message = err?.error?.detail || err?.error?.title || err?.message || 'Saving production line failed.';
        notify(message, 'error', 5000);
        reject(err?.message || 'Unknown error');
        this.editMode = EditMode.Read;
        this.editingMode = 'row';
      });
    });
  }

  public override rowUpdating(e: {
    oldData: Partial<ProductionLineDto>;
    newData: Partial<ProductionLineDto>;
    cancel?: boolean | PromiseLike<boolean> | PromiseLike<void>;
  }): void {
    const updated: Partial<ProductionLineDto> = { ...e.oldData, ...e.newData };
    const payload = this.toPatchPayload(updated, e.oldData as ProductionLineDto);

    if (Object.keys(payload).length === 0) {
      e.cancel = true;
      this.editMode = EditMode.Read;
      return;
    }

    const result = firstValueFrom(this.api.patch<ProductionLineDto>(`${this.entityEndpoint}/${updated.id}`, payload));

    e.cancel = new Promise<boolean>((resolve, reject) => {
      result.then((saved) => {
        resolve(false);
        e.newData = saved;
        this.editMode = EditMode.Read;
      })
      .catch((err) => {
        console.error('productionlines rowUpdating failed', err);
        const message = err?.error?.detail || err?.error?.title || err?.message || 'Updating production line failed.';
        notify(message, 'error', 5000);
        reject(err?.message || 'Unknown error');
        this.editMode = EditMode.Read;
      });
    });
  }

  ResetEdit(): void {
    this.editMode = EditMode.Read;
    this.editingMode = 'row';
  }

  SaveRecord = (_e?: unknown): void => {
    this.gridx.instance.saveEditData();
  }

  public override addRecord(): void {
    this.editMode = EditMode.Add;
    this.editingMode = 'popup';
    this.gridx.instance.addRow();
  }

  onInitNewRow(_e?: unknown): void {
    this.editMode = EditMode.Add;
    this.editingMode = 'popup';
  }

  onEditingStart(e: { data?: { id?: unknown } }): void {
    if (e?.data?.id) {
      this.editMode = EditMode.Edit;
      this.editingMode = 'row';
    }
  }

  onRowInserted(_e?: unknown): void {
    this.editMode = EditMode.Read;
    this.editingMode = 'row';
  }

  EditRecord = (e: InlineEditEvent): void => {
    if (this.editInline) {
      this.startInlineEdit(e);
    }
  }

  startInlineEdit(e: InlineEditEvent): void {
    const rowIndex = e.rowIndex;
    const grid = e.component;
    this.editMode = EditMode.Edit;
    this.editingMode = 'row';
    grid.editRow(rowIndex);
  }

  DeleteRecord = (e: DeleteRecordEvent<{ id?: unknown }>): void => {
    const result = confirm(`Are you sure you want to delete record #${e.data?.id}?`, 'Confirm Delete');
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

  private toCreatePayload(source: Partial<ProductionLineDto>): CreateProductionLineDto {
    return {
      name: source.name ?? null,
      maxSpeed: source.maxSpeed ?? null,
      maxOvenTemp: source.maxOvenTemp ?? null,
    };
  }

  private toPatchPayload(source: Partial<ProductionLineDto>, original: Partial<ProductionLineDto>): UpdateProductionLineDto {
    const payload: UpdateProductionLineDto = {};
    if ((source.name ?? null) !== (original.name ?? null)) {
      payload.name = source.name ?? null;
    }

    if ((source.maxSpeed ?? null) !== (original.maxSpeed ?? null)) {
      payload.maxSpeed = source.maxSpeed ?? null;
    }

    if ((source.maxOvenTemp ?? null) !== (original.maxOvenTemp ?? null)) {
      payload.maxOvenTemp = source.maxOvenTemp ?? null;
    }

    return payload;
  }

}

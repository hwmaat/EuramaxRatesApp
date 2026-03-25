import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { DeleteRecordEvent, InlineEditEvent, RowRemovingEvent, SelectionChangedEvent } from '@app/models/grid-events.model';
import { PmtOffsetDto } from '@app/models/ovensetting.model';
import { DxButtonModule, DxDataGridModule, DxToolbarModule } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-peakmetaltemp',
  imports: [CommonModule, AmsLoadPanelComponent, DxToolbarModule, DxDataGridModule, DxButtonModule],
  templateUrl: './peakmetaltemp.html',
  styleUrl: './peakmetaltemp.scss',
})
export class Peakmetaltemp extends BaseGrid<PmtOffsetDto> implements OnInit, AfterViewInit {
  readonly EditMode = EditMode;
  loadingMessage = 'loading....';
  selectedRowKeys: number[] = [];

  constructor() {
    super();
    this.entityEndpoint = 'pmt-offsets';
    this.entityName = 'PmtOffsetDto';
    this.recordIdField = 'id';
    this.showColumnLinesSwitch = true;
    this.showInlineEditButton = true;
    this.showGridCaption = false;
    this.showAddButton = false;
    this.showTreeButton = true;
    this.showMultiSelect = false;
  }

  ngOnInit(): void {
    this.refresh();
  }

  ngAfterViewInit(): void {
    this.showExportButton = true;
    this.showTreeButton = true;
    this.editInline = true;
  }

  public override refresh(): void {
    this.records = [];
    const spParams = new Map();
    this.loadDataDirect(spParams);
  }

  onSelectionChanged(e: SelectionChangedEvent): void {
    this.selectedRowKeys = e.selectedRowKeys ?? [];
  }

  onRowRemoving(e: RowRemovingEvent): void {
    const spParams = new Map();
    spParams.set(this.recordIdField, e.key);
    const result = firstValueFrom(this.api.delete(this.entityEndpoint, spParams));
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
    this.gridx.instance.addRow();
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
    grid.editRow(rowIndex);
  }

  DeleteRecord = (e: DeleteRecordEvent<Record<string, unknown>>): void => {
    const recordId = e.data?.[this.recordIdField] ?? e.key;
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

}

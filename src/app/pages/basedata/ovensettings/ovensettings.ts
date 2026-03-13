import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { OvenSettingDto, OvenSettingsPatchDto, OvenSettingState } from '@app/models/ovensetting.model';
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
readonly stateOptions: OvenSettingState[] = ['Trial', 'Released', 'Blocked', 'Archived'];
paintLineOptions: string[] = [];
substrateOptions: string[] = [];
readonly paintLineEditorOptions: any = {
  items: this.paintLineOptions,
  searchEnabled: true,
  showClearButton: true,
  placeholder: 'Geen productielijnen beschikbaar',
};
readonly substrateEditorOptions: any = {
  items: this.substrateOptions,
  searchEnabled: true,
  showClearButton: true,
  placeholder: 'Geen substrates beschikbaar',
};
readonly stateEditorOptions: any = {
  items: this.stateOptions,
};
private lookups = inject(LookupsService);
private readonly addOnlyEditableFields = new Set(['paintLine', 'thickness', 'lineSpeed', 'substrate']);


  constructor(){
    super();
    this.entityEndpoint = 'ovensettings';
    this.entityName = 'OvenSettingDto';
    this.recordIdField = "id";
    this.showColumnLinesSwitch=true;
    this.showInlineEditButton = true;
    this.showGridCaption=false;
    this.showAddButton=true;
    this.showTreeButton=true;
    this.showMultiSelect=false;
}

 ngOnInit(): void {
   this.loadPaintLineOptions();
   this.loadSubstrateOptions();
 }

 private loadPaintLineOptions(): void {
   firstValueFrom(this.lookups.getProductionLineNames()).then((items) => {
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
    this.editInline = true;
 }
  public override refresh(e: any): void {
    this.records = [];
    const spParams = new Map();
    this.loadDataDirect(spParams);
  }

  onSelectionChanged(e: any) {
    this.selectedRowKeys = e.selectedRowKeys;
  }
  onRowRemoving(e:any){
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
      this.gridx?.instance.option('editing.mode', 'row');
  }

  SaveRecord = (e: any) => {
    this.gridx.instance.saveEditData();
  }
  public override addRecord(e: any): void {
    const loadLookups = Promise.all([
      this.paintLineOptions.length > 0
        ? Promise.resolve(this.paintLineOptions)
        : firstValueFrom(this.lookups.getProductionLineNames()),
      this.substrateOptions.length > 0
        ? Promise.resolve(this.substrateOptions)
        : firstValueFrom(this.lookups.getSubstrates()),
    ]);

    loadLookups.then(([paintLines, substrates]) => {
      this.paintLineOptions.splice(0, this.paintLineOptions.length, ...(paintLines ?? []));
      this.substrateOptions.splice(0, this.substrateOptions.length, ...(substrates ?? []));

      this.editMode = EditMode.Add;
      this.gridx.instance.option('editing.mode', 'popup');
      this.gridx.instance.addRow();
    });
  }

  onRowInserted(e: any): void {
    this.editMode = EditMode.Read;
    this.gridx?.instance.option('editing.mode', 'row');
  }

  onInitNewRow(e: any): void {
    this.editMode = EditMode.Add;
    this.gridx?.instance.option('editing.mode', 'popup');
  }

  onEditingStart(e: any): void {
    if (e?.data?.id) {
      this.editMode = EditMode.Edit;
      this.gridx?.instance.option('editing.mode', 'row');
    }
  }

  onEditorPreparing(e: any): void {
    if (!e?.dataField) return;

    const isNewRow = !!e.row?.isNewRow || this.editMode === EditMode.Add;

    if (e.dataField === 'paintLine') {
      e.editorName = 'dxSelectBox';
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.items = this.paintLineOptions;
      e.editorOptions.searchEnabled = true;
      e.editorOptions.showClearButton = true;
      e.editorOptions.placeholder = this.paintLineOptions.length > 0
        ? 'Selecteer productielijn'
        : 'Geen productielijnen beschikbaar';
    }

    if (e.dataField === 'substrate') {
      e.editorName = 'dxSelectBox';
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.items = this.substrateOptions;
      e.editorOptions.searchEnabled = true;
      e.editorOptions.showClearButton = true;
      e.editorOptions.placeholder = this.substrateOptions.length > 0
        ? 'Selecteer substrate'
        : 'Geen substrates beschikbaar';
    }

    if (this.addOnlyEditableFields.has(e.dataField)) {
      e.editorOptions = e.editorOptions || {};
      e.editorOptions.readOnly = !isNewRow;
    }
  }

  public override rowUpdating(e: any): void {
    const updated: OvenSettingDto = { ...e.oldData, ...e.newData };
    const patchDto: OvenSettingsPatchDto = {
      state: updated.state,
      zone1: updated.zone1 ?? null,
      zone2: updated.zone2 ?? null,
      zone3: updated.zone3 ?? null,
    };

    const result = firstValueFrom(this.api.patch<OvenSettingDto>(`${this.entityEndpoint}/${updated.id}`, patchDto));

    e.cancel = new Promise<boolean>((resolve, reject) => {
      result.then((patched) => {
        resolve(false);
        e.newData = patched;
        this.editMode = EditMode.Read;
      })
      .catch((err) => {
        console.error('ovensettings rowUpdating Patch failed', err);
        reject(err?.message || 'Unknown error');
        this.editMode = EditMode.Read;
      });
    });
  }

  EditRecord = (e:any) => {
    
    if (this.editInline){
      this.startInlineEdit(e);
    } else {
        // this.euravibDovetailImport = { ...e.row?.data };
        // this.popupVisible = true;
    }
  }

  startInlineEdit(e: any) {
    const rowIndex = e.rowIndex;
    const grid = e.component;
    this.editMode = EditMode.Edit;
    grid.option('editing.mode', 'row');
    grid.editRow(rowIndex);
  }

  DeleteRecord = (e:any) => {
     const result = confirm(`Are you sure you want to delete record #${e.data.id}?`, 'Confirm Delete');
     result.then((dialogResult) => {
       if (dialogResult) {
        this.editMode = EditMode.Delete;
        this.gridx.instance.deleteRow(e.row.rowIndex);
        this.editMode = EditMode.Read;
       }
     });
  }
  CancelEdit = (e: any) => {
    this.gridx.instance.cancelEditData();
    this.editMode = EditMode.Read;
  }
}

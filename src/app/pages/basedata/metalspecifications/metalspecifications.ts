import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { DxButtonModule, DxDataGridModule, DxToolbarModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { firstValueFrom } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';
import { MetalSpecificationDto } from '@app/models/metalspecifications.model';

@Component({
  selector: 'app-metalspecifications',
  imports: [CommonModule, AmsLoadPanelComponent, DxToolbarModule, DxDataGridModule, DxButtonModule],
  templateUrl: './metalspecifications.html',
  styleUrl: './metalspecifications.scss',
})
export class Metalspecifications extends BaseGrid<MetalSpecificationDto> implements OnInit, AfterViewInit{
readonly EditMode = EditMode;
loadingMessage = "loading....";
selectedRowKeys: number[] = [];


  constructor(){
    super();
    this.entityEndpoint = 'metal-specifications';
    this.entityName = 'MetalSpecificationDto';
    this.recordIdField = "id";
    this.showColumnLinesSwitch=true;
    this.showInlineEditButton = true;
    this.showGridCaption=false;
    this.showAddButton=false;
    this.showTreeButton=true;
    this.showMultiSelect=false;
}

 ngOnInit(): void {

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
       const spParams = new Map();
          spParams.set('id', e.key);  
          let result = firstValueFrom(this.api.delete(this.entityEndpoint,spParams));
          e.cancel = new Promise<boolean>((resolve, reject) => {
            result.then((result) => {
            resolve(false);
            })
              .catch((err) => {
                console.error('Deleting failed', err);
                reject(err?.message || 'Unknown error');
              });
          });
  }

  ResetEdit() {
      this.editMode = EditMode.Read;
  }

  SaveRecord = (e: any) => {
    this.gridx.instance.saveEditData();
  }
  public override addRecord(e: any): void {
    this.editMode = EditMode.Add;
    this.gridx.instance.addRow();
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

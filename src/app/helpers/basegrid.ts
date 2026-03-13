import { Component, effect, inject, ViewChild } from "@angular/core";
import { WithDestroy } from "./WithDestroy";
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxSwitchModule } from "devextreme-angular";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Workbook } from "exceljs";
import { saveAs } from 'file-saver';
import { ThemeService } from "@app/services/theme.service";
import { firstValueFrom, lastValueFrom, Observable, take, takeUntil } from "rxjs";
import { ApiService } from "@services/api.service";
import notify from "devextreme/ui/notify";
import { Globals } from "@app/services/globals.service";
import { EditMode } from "@app/models/enum";




@Component({
    template: '',
    standalone:true,
    imports: [DxSwitchModule, DxButtonModule, DxDataGridModule]
  })

export class BaseGrid<T> extends WithDestroy() {
@ViewChild('gridContainer', {static: false}) gridx: DxDataGridComponent;
private themeService = inject(ThemeService);
protected api = inject(ApiService);
protected globals = inject(Globals);


editMode = EditMode.Read
rowIndex = -1;
rowFilter:boolean = false;
columnLines:boolean = false;
subTotals: boolean = false;
headerFilter:boolean = false;
pagingEnabled = true;
expanded = true;
hoverIndex = -1;
focusedRowIndex = -1;
colorMode='';
themeclass = 'dark-theme';
defaultBaanAdministration = '';
networkLocation:string;
recordIdField:string;
editInline = true;
page = 1;
pageSize = 25;

public info = ' ';
public showclearFilterSwitch:boolean=true;
public showColumnLinesSwitch:boolean=true;
public showHeaderFilterSwitch:boolean=true;
public showRowFilterSwitch:boolean=true;
public showGridCaption:boolean=false;
public showAddButton:boolean = false;
public showRefreshButton:boolean  = true;
public showSubTotalsSwitch:boolean = false;
public showTreeButton:boolean = false;
public showInlineEditButton:boolean = false;
public addButtonLocation:string='after';
public refreshButtonLocation:string='after';
public showColumnChooserButton:boolean = false;
public showMultiSelect:boolean = false;
public multiSelect:boolean = false;
public selectionMode = "single"

headerfilterText='header filter';
rowfilterText = 'row filter';
clearFilterText = 'clear filter';
columnLinesText = 'column lines';

editingRowIndex = -1; 

// Delete support
dialogVisible = false;
deleteTarget: { id: number; name: string } | null = null;
entityName = 'record';
entityEndpoint = 'entities';

// Save support
record!: T & { id?: number };
loading = false;
records: T[] = [];
validationMessage = '';
popupVisible = false;

@ViewChild('formRef') formRef: any;

euroformat = { style: 'currency',  currency: 'EUR', useGrouping: true, minimumIntegerDigits:1 ,minimumFractionDigits: 4, maximumFractionDigits:4 };
euroformat2 = { style: 'currency',  currency: 'EUR', useGrouping: true, minimumIntegerDigits:1 ,minimumFractionDigits: 2, maximumFractionDigits:2 };
fixedformat = { type:'fixedPoint', useGrouping: true, precision: 4};
fixedformat2 = { type:'fixedPoint', useGrouping: true, precision: 2};
fixedformat0 = { type:'fixedPoint', useGrouping: true, precision: 0};
private storageKey = '';

constructor() {
    super();
    this.themeService.currentTheme$
    .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        if(theme === 'light'){
          this.themeclass='light-theme';
        } else {
          this.themeclass='dark-theme';
        }
      });
      
    effect(() => {
      try {
        const s = this.globals.settings();
          if (!s) return; // not loaded yet
          this.defaultBaanAdministration = s.defaultBaanAdministration ?? '';
          
        } catch (err) {
          console.error('BaseGrid effect error:', err);
        }
      }); 
    }

    onToolbarPreparing(e:any) {
      e.toolbarOptions.items.unshift(
        {
          location: 'before',
          template: 'headercaption',
          visible: this.showGridCaption
        },
        {
          location: 'before',
          widget: 'dxButton',
          cssClass: 'informer',
          visible: this.showTreeButton,
          options: {
                    icon: 'mdi mdi-expand-all',
                    stylingMode: 'text',
                    onClick: this.expandAll.bind(this),
                    visible: true
                  }
        },
        {
          location: 'after',
          text: "multiselect",
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible: this.showMultiSelect,
          options: {
            value: this.multiSelect,
            onValueChanged: this.ShowMultiSelect.bind(this),
            hint: 'show multiSelect',
            visible: this.showMultiSelect,
          }
        },         
        {
          location: 'after',
          text: "subtotals",
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible: this.showSubTotalsSwitch,
          options: {
            value: this.subTotals,
            onValueChanged: this.ShowSubtotals.bind(this),
            hint: 'show subtotals',
            visible: this.showSubTotalsSwitch
          }
        },
       
        {
          location: 'after',
          text: "inline edit",
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible: this.showInlineEditButton,
          options: {
            value: this.editInline,
            onValueChanged: this.setInlineEdit.bind(this),
            hint: 'inline edit',
            visible: this.showInlineEditButton
          }
        },        
        {
          location: 'after',
          text: this.columnLinesText,
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible: this.showColumnLinesSwitch,
          options: {
            value: this.columnLines,
            onValueChanged: this.ShowColumnLines.bind(this),
            hint: 'column lines',
            visible: this.showColumnLinesSwitch
          }
        },
        {
          location: 'after',
          text: this.headerfilterText,
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible: this.showHeaderFilterSwitch,
          options: {
            value: this.headerFilter,
            onValueChanged: this.ShowHeaderFilter.bind(this),
            hint: 'header filters',
            visible: this.showHeaderFilterSwitch
          }
        },
        {
          location: 'after',
          text: this.rowfilterText,
          widget: 'dxSwitch',
          cssClass: 'informer infcheckbox',
          visible:  this.showRowFilterSwitch,
          options: {
            value: this.rowFilter,
            onValueChanged: this.ShowRowFilter.bind(this),
            hint: 'row filters',
            visible: this.showRowFilterSwitch
          }
        },
        {
          location: 'after',
          text: this.clearFilterText,
          
          widget: 'dxButton',
          cssClass: 'informer infcheckbox',
          visible: this.showclearFilterSwitch,
          options: {
                    icon: 'mdi mdi-filter-remove-outline',
                    stylingMode: 'text',
                    onClick: this.clearFilterA.bind(this),
                    hint: 'reset filters',
                    visible: this.showclearFilterSwitch
                  }
        },
        {
          location: this.addButtonLocation,
          widget: 'dxButton',
          cssClass: 'informer',
          visible: this.showAddButton,
          options: {
                    icon: 'add',
                    stylingMode: 'outline',
                    type:'default',
                    onClick: this.addRecord.bind(this),
                    hint: 'add new record',
                    visible: this.showAddButton
                  }
        },
        {
          location: this.refreshButtonLocation,
          widget: 'dxButton',
          cssClass: 'informer',
          visible: this.showRefreshButton,
          options: {
                    icon: 'refresh',
                    stylingMode: 'outline',
                    type:'default',
                    onClick: this.refresh.bind(this),
                    hint: 'reload data',
                    visible: this.showRefreshButton
                  }
        } ,  
        {
          location: 'after',
          text: "",
          widget: 'dxButton',
          cssClass: 'informer infcheckbox',
          visible: this.showColumnChooserButton,
          options: {
            icon: 'mdi mdi-reorder-vertical',
            stylingMode: 'outline',
            type:'default',
            onClick: this.ShowColumnChooser.bind(this),
            hint: 'show column chooser',
            visible: this.showColumnChooserButton
          }
        }, 
        );
    }

  saveColumnLayout(): void {
    if (this.gridx?.instance && this.storageKey) {
      try {
        const state = this.gridx.instance.state();
        localStorage.setItem(`grid-state-${this.storageKey}`, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save grid state:', error);
      }
    }
  }

  loadColumnLayout(): void {
    if (!this.gridx?.instance || !this.storageKey) {
      //console.log('Cannot load - gridx or storageKey missing:', !!this.gridx?.instance, this.storageKey);
      return;
    }

    const savedState = localStorage.getItem(`grid-state-${this.storageKey}`);
    if (!savedState) {
      //console.log('No saved state found for:', this.storageKey);
      return;
    }

    try {
      const state = JSON.parse(savedState);
      //console.log('Loading grid state for:', this.storageKey, state);
      
      // Check if grid is ready before applying state
      if (this.gridx.instance.getDataSource() && this.gridx.instance.getDataSource().isLoaded()) {
        this.gridx.instance.beginUpdate();
        
        try {
          this.gridx.instance.state(state);
          this.gridx.instance.endUpdate();
          //console.log('State applied successfully');
        } catch (stateError) {
          console.error('Failed to apply grid state, clearing saved state:', stateError);
          localStorage.removeItem(`grid-state-${this.storageKey}`);
          this.gridx.instance.endUpdate();
          
          this.gridx.instance.refresh();
        }
      } else {
        // If data source is not loaded yet, wait a bit more
        setTimeout(() => {
          this.loadColumnLayout();
        }, 200);
      }
    } catch (error) {

      localStorage.removeItem(`grid-state-${this.storageKey}`);
    }
  }

    setStorageKey(key: string): void {
      this.storageKey = key;
  }

    public setInlineEdit(e: any) {
      this.editInline = e.value;
      // if (this.editInline) {
      //   this.gridx.instance.option('editing.mode', 'row');
      // } 
    }

    public ShowColumnChooser(e: any) {
      if (this.gridx?.instance) {
        this.gridx.instance.showColumnChooser();  
      }
    }   
    public addRecord(e: any){

    }

    afterSave(): void {
      // Hook for child components to override
    }
    
    public refresh(e:any) {
      
    }

    onCellHoverChanged  (e:any)  {
      if(e.rowType==="data"){
        this.hoverIndex = e.rowIndex;
      } else {
        this.hoverIndex = -1;
      }
    }
    
    getRowIndex(data: { rowType: string; key: any; }): number {
      if (data.rowType==="data"){
        this.rowIndex = this.gridx.instance.getRowIndexByKey(data.key);
        return this.rowIndex;}
      else
        return 0;
    }

    /* 
    Laad data vanuit rechstreekse json array
    */
    loadDataDirect(spParams?: Map<string, string>): void {
      this.loading = true;
      this.records = [];
      this.api.get<T[]>(`${this.entityEndpoint}`,spParams)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            console.log('basegrid ==> loadDataDirect', result);
            this.records = result;
            this.loading = false;
          },
          error: (err) => {
            console.error(`basegrid: loadData: Error loading ${this.entityName} records`, err);
            this.loading = false;
          }
        });
    }

    loadDataFromUrl(url:string,spParams?: Map<string, string>): void {
      this.loading = true;
      this.records = [];
      this.api.get<T[]>(url,spParams)
        .pipe(take(1))
        .subscribe({
          next: (result) => {
            this.records = result;
            console.log('basegrid ==> loadDataFromUrl', result);
            this.loading = false;
          },
          error: (err) => {
            console.error(`basegrid: loadData: Error loading ${this.entityName} records`, err);
            this.loading = false;
          }
        });
    }

    rowUpdating (e: any) {
      const updated = { ...e.oldData, ...e.newData };
      let result = firstValueFrom(this.api.put<T>(`${this.entityEndpoint}/${updated.id}`, updated));

      e.cancel = new Promise<boolean>((resolve, reject) => {
        result.then((result) => {
          resolve(false);
          e.newData = result;
          this.editMode = EditMode.Read;
        })
          .catch((err) => {
            console.error('basegrid rowUpdating Update failed', err);
            reject(err?.message || 'Unknown error');
            this.editMode = EditMode.Read;
          });
      })
    }
 

  rowInserting= (e: any) => {
    let insertRecord= <T>{};
    const inserted = { ...insertRecord, ...e.data };
    //console.log('basegrid ==> procname', inserted);
    let result = firstValueFrom(this.api.post<T>(`${this.entityEndpoint}`, inserted))

    e.cancel = new Promise<boolean>((resolve, reject) => {
      result.then((result) => {
        console.log('basegrid ==> rowInserting', result);
        resolve(false);
        e.data=result;
        this.editMode = EditMode.Read;
      })
        .catch((err) => {
          console.error('basegrid Inserting failed', err);
          reject(err?.message || 'Unknown error');
          this.editMode = EditMode.Read;
        });
    })
  }

 rowRemoving = (e: any) => {
    const id = e.key;
    let result = firstValueFrom(this.api.delete(`${this.entityEndpoint}/${id}`));
    e.cancel = new Promise<boolean>((resolve, reject) => {
      result.then((result) => {
        resolve(false)
        this.editMode = EditMode.Read;
        
      })
        .catch((err) => {
          console.error('basegrid Deleting failed', err);
          reject(err?.message || 'Unknown error');
          this.editMode = EditMode.Read;
        });
    })
  }

    //Toolbar switches ==================================================================
    ShowColumnLines = (e:any) => {
      this.columnLines = e.value;
      this.gridx.instance.option('showColumnLines', e.value);
   }

    clearFilterA= () => {
      this.gridx.instance.clearFilter();
    }
  
    ShowSubtotals = (e:any) => {
      this.subTotals = e.value;
    }

    ShowMultiSelect = (value: boolean) => {
      this.multiSelect = value;
      
      if (this.multiSelect) {
        this.selectionMode = "multiple";
      } else {
        this.selectionMode = "single";
      }
      this.gridx.instance.option('selection.mode', this.selectionMode);
      this.gridx.instance.repaint();
    }
    ShowHeaderFilter= (e:any) => {
      this.headerFilter=e.value;
      this.gridx.instance.option('headerFilter.visible', e.value);
    }
  
    ShowRowFilter = (e:any) => {
      this.rowFilter=e.value;
      this.gridx.instance.option('filterRow.visible', e.value);
    }
  
    set showExportButton(e: boolean) {
      this.gridx.instance.option('export.enabled',e);
    }
    showSearchPanel(e: boolean) {
      this.gridx.instance.option('searchPanel.visible',e);
    }
    showGroupPanel(e: boolean) {
      this.gridx.instance.option('groupPanel.visible',e);
    }

    expandAll(){
      this.expanded = !this.expanded;
      if (this.expanded) {
        this.gridx.instance.expandAll();
      }
      if (!this.expanded) {
        this.gridx.instance.collapseAll();
      }
    }  

    //events=============================================================================
    onExporting(e: any, sheetName:string) {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet(sheetName);
  
    exportDataGrid({
          component: e.component,
          worksheet,
          autoFilterEnabled: true,
        }).then(() => {
          workbook.xlsx.writeBuffer().then((buffer) => {
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), sheetName+'.xlsx');
          });
        });
        e.cancel = true;
    }



}



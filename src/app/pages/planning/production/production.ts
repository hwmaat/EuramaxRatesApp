import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, computed, inject, signal } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { EditMode } from '@app/models/enum';
import { DeleteRecordEvent, InlineEditEvent, RowRemovingEvent, SelectionChangedEvent } from '@app/models/grid-events.model';
import { FinishDetails } from '@app/pages/basedata/finish-details/finish-details';
import { DxButtonModule, DxDataGridModule, DxLoadIndicatorModule, DxPopupModule, DxSelectBoxModule, DxTabPanelModule, DxTagBoxModule, DxToolbarModule } from 'devextreme-angular';
import { firstValueFrom } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';
import { ProductionOrderDto } from '@app/models/productionorder.model';
import { ProductionLine } from '@app/models/productionlines.options';
import { DateFunctionsService } from '@app/services/datefunctions.service';
import { LookupsService } from '@app/services/lookups.service';
import dayjs from 'dayjs';
import { CampaignDto } from '@app/models/campaignDto';
import notify from 'devextreme/ui/notify';
import { finalize } from 'rxjs/operators';

interface WeekOption {
  week: number;
  label: string;
  start: Date;
  end: Date;
}

interface TransformationEntry {
  key: string;
  value: string;
}

@Component({
  selector: 'app-production',
  imports: [CommonModule, AmsLoadPanelComponent, FinishDetails, DxToolbarModule, DxDataGridModule, DxButtonModule,
    DxSelectBoxModule, DxTagBoxModule, DxTabPanelModule, DxPopupModule, DxLoadIndicatorModule
  ],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production extends BaseGrid<ProductionOrderDto> implements OnInit, AfterViewInit{
private readonly STORAGE_KEY = 'productionapp_filters';
readonly EditMode = EditMode;
private dateFunctions = inject(DateFunctionsService);
private lookups = inject(LookupsService);
loadingMessage = "loading....";
selectedRowKeys: number[] = [];
productionLines :ProductionLine []=[];
selectedProdLineId = 0;
selectedProdLine = '';
weeks: WeekOption[] = [];
selectedWeeks: number[] = []; 
weekStartDate: Date | null = null;
weekEndDate: Date | null = null;
campaignNumbers:CampaignDto[] = [];
selectedCampaignNumbers:number[] = [];
isCampaignNumbersLoading = false;

transformationDetailsVisible = signal(false);
selectedTransformation = signal<unknown>(null);
readonly transformationEntries = computed<TransformationEntry[]>(() => {
  const data = this.selectedTransformation();
  if (data === null || typeof data !== 'object') {
    return [];
  }
  const entries = Object.entries(data as Record<string, unknown>);
  return entries.map<TransformationEntry>(([key, value]) => ({
    key,
    value: this.formatTransformationValue(value),
  }));
});

yearOptions: { value: number; name: string }[] = [];
selectedYear = new Date().getFullYear();

messagesCount = (rowData: ProductionOrderDto): number => {
  const messages = rowData.messages ?? [];
  return messages.length;
};

finishDetailsVisible = signal(false);
selectedPaintLayerRecipeId = signal<number | null>(null);

  constructor(){
    super();
    this.entityEndpoint = 'production-orders';
    this.entityName = 'ProductionOrderDto';
    this.recordIdField = "id";
    this.showColumnLinesSwitch=true;
    this.showInlineEditButton = true;
    this.showGridCaption=false;
    this.showAddButton=false;
    this.showTreeButton=true;
    this.showMultiSelect=false;
}

 ngOnInit(): void {
   const currentYear = new Date().getFullYear();
   for (let i = 5; i >= 0; i--) {
    const year = currentYear - i;
    this.yearOptions.push({value: year, name: year.toString()});
    }
    this.selectedYear = new Date().getFullYear();
    this.loadFiltersFromStorage();
    this.weeks = this.generateWeekOptions(currentYear);
     this.loadProductionLines();
 }

   private loadProductionLines(): void {
     firstValueFrom(this.lookups.getProductionLines()).then((lines) => {
      this.productionLines = lines;
      const selected = this.productionLines.find(pl => pl.id === this.selectedProdLineId);
      this.selectedProdLine = selected?.productionLine ?? '';
      if (this.selectedProdLineId > 0) {
        this.getCampaignNumbersForSelectedProdLine();
      }
     });
   }
  
  onCellPrepared(e: { rowType?: string; data?: { messages?: unknown[] }; cellElement?: HTMLElement }) {
    if (!e || e.rowType !== 'data') {
      return;
    }
    const hasMessages = (e.data?.messages?.length ?? 0) > 0;
    if (hasMessages) {
      const el = e.cellElement as HTMLElement;
        //el.style.backgroundColor = 'rgb(250, 33, 0)';
        el.style.color = 'rgb(250, 33, 0)';
    }
  }

  private getReadableTextColor(hex: string): string {
    try {
      const h = hex.replace('#','');
      const r = parseInt(h.substring(0,2),16);
      const g = parseInt(h.substring(2,4),16);
      const b = parseInt(h.substring(4,6),16);
      // relative luminance formula
      const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
      return luminance > 0.6 ? '#000' : '#fff';
    } catch {
      return '#000';
    }
  }

  public ngAfterViewInit(): void {
      this.showExportButton=true;
      this.showTreeButton=true;
      this.editInline = true;
  }

  public override refresh(): void {
    if ((this.selectedCampaignNumbers?.length ?? 0) === 0) {
      notify({
        message: 'Select at least one campaign number before refreshing.',
        type: 'warning',
        displayTime: 4000,
        position: {
          my: 'center',
          at: 'center',
          of: window,
        },
      });
      return;
    }
    this.records = [];
    const selectedString = this.selectedCampaignNumbers.map(_ => `campaignnumbers=${_}`).join('&');
    const spParams = new Map<string, string>();
    this.loadDataFromUrl(`${this.entityEndpoint}?${selectedString}`,  spParams);
  }

  onLayerRecipePopup(layer: { paintLayerRecipeId?: number | null } | null | undefined): void {
    this.selectedPaintLayerRecipeId.set(layer?.paintLayerRecipeId ?? null);
    this.finishDetailsVisible.set(true);
  }
  
  onTransformationPopup(transformation: unknown): void {
    if (!transformation) {
      this.selectedTransformation.set(null);
      this.transformationDetailsVisible.set(false);
      return;
    }
    this.selectedTransformation.set(transformation);
    this.transformationDetailsVisible.set(true);
  }

  closeTransformationPopup(): void {
    this.transformationDetailsVisible.set(false);
    this.selectedTransformation.set(null);
  }

  private formatTransformationValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.formatTransformationValue(item)).join(', ');
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return value.toString();
      }
    }
    return String(value);
  }

  closeFinishDetails(): void {
    this.finishDetailsVisible.set(false);
  }

  getCampaignNumbersForSelectedProdLine(): void {
    if (!this.canLoadCampaignNumbers()) {
      this.isCampaignNumbersLoading = false;
      return;
    }

    const spParams = new Map<string, string>();
    const productionLine = this.productionLines.find(pl => pl.id === this.selectedProdLineId)?.productionLine ?? '';
    if (!productionLine) {
      this.isCampaignNumbersLoading = false;
      return;
    }

    this.isCampaignNumbersLoading = true;
    spParams.set('productionLine', productionLine);
    spParams.set('startDate', dayjs(this.weekStartDate as Date).format('YYYY-MM-DD'));
    spParams.set('endDate', dayjs(this.weekEndDate as Date).format('YYYY-MM-DD'));
    this.api.get<CampaignDto[]>(`production-orders/campaigns`, spParams).pipe(
      finalize(() => {
        this.isCampaignNumbersLoading = false;
      })
    ).subscribe({
      next: (numbers) => {
        this.campaignNumbers = (numbers ?? []).map((c) => ({
          ...c,
          description: `${c.campaignNumber}: (${c.productionOrderCount})`,
        }));
      },
      error: () => {
        this.campaignNumbers = [];
      },
    });
  }

  onSelectionChanged(e: SelectionChangedEvent<number>) {
    this.selectedRowKeys = e.selectedRowKeys ?? [];
  }

  onRowRemoving(e: RowRemovingEvent<unknown>){
       const spParams = new Map();
          spParams.set('id', e.key);  
          const result = firstValueFrom(this.api.delete(this.entityEndpoint,spParams));
          e.cancel = new Promise<boolean>((resolve, reject) => {
            result.then(() => {
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

  SaveRecord = (_e?: unknown) => {
    this.gridx.instance.saveEditData();
  }

  public override addRecord(): void {
    this.editMode = EditMode.Add;
    this.gridx.instance.addRow();
  }

  EditRecord = (e: InlineEditEvent) => {
    
    if (this.editInline){
      this.startInlineEdit(e);
    } else {
        // this.euravibDovetailImport = { ...e.row?.data };
        // this.popupVisible = true;
    }
  }

  startInlineEdit(e: InlineEditEvent) {
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

  onYearChanged(e: { value?: number }): void {
    if (typeof e.value !== 'number') {
      return;
    }
    this.selectedYear = e.value;
    this.weeks = this.generateWeekOptions(this.selectedYear);
    this.updateWeekDates();
    this.clearCampaignNumbers();
    this.saveFiltersToStorage();
    this.records = [];
  }

  onProdLineChanged(e: { value?: number }): void {
    if (typeof e.value !== 'number') {
      return;
    }
    const selected = this.productionLines.find(pl => pl.id === e.value);
    this.selectedProdLine = selected?.productionLine ?? '';
    this.selectedProdLineId = selected ? selected.id : 0;
    this.saveFiltersToStorage();
    this.clearCampaignNumbers();
    this.getCampaignNumbersForSelectedProdLine();
    this.records = [];
  }

  onWeeksChanged(e: { value?: number }): void {
    if (typeof e.value !== 'number') {
      return;
    }
    this.selectedWeeks =[e.value];
    this.clearCampaignNumbers();
    this.updateWeekDates();
    this.saveFiltersToStorage();
    this.records = [];
  }


  onCampaignNumbersChanged(e: { value?: unknown }): void {
    this.selectedCampaignNumbers = Array.isArray(e.value) ? e.value : [];
    this.saveFiltersToStorage();
    this.records = [];
  }

  // Save current filter state to localStorage
  private saveFiltersToStorage(): void {
    const filters = {
      prodLine: this.selectedProdLineId,
      weeks: this.selectedWeeks,
      year: this.selectedYear,
      campaignNumbers: this.selectedCampaignNumbers
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
  }

  private loadFiltersFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const filters = JSON.parse(stored);
        this.selectedYear = filters.year ?? new Date().getFullYear();
        this.selectedProdLineId =  filters.prodLine ?? 0;;
        this.selectedWeeks = Array.isArray(filters.weeks) ? filters.weeks : [];
        this.selectedCampaignNumbers = Array.isArray(filters.campaignNumbers) ? filters.campaignNumbers : [];
        this.selectedProdLine = '';

        this.updateWeekDates();
        this.clearCampaignNumbers();

      } else {
        // Set defaults if no storage
        this.selectedYear = new Date().getFullYear();
      }
    } catch {
      // Fallback to defaults
      this.selectedYear = new Date().getFullYear();
    }
  }

  private generateWeekOptions(year: number): WeekOption[] {
    const totalWeeks = this.dateFunctions.getIsoWeeksInYear(year);
    const options: WeekOption[] = [];
    for (let week = 1; week <= totalWeeks; week += 1) {
      const { start, end } = this.dateFunctions.getIsoWeekRange(year, week);
      const label = `${week}: (${this.dateFunctions.formatDateDDMMYY(start)}=>${this.dateFunctions.formatDateDDMMYY(end)})`;
      options.push({
        week,
        label,
        start,
        end
      });
    }
    return options;
  }

  private updateWeekDates(): void {
    const selectedWeek = this.selectedWeeks.at(0);
    if (typeof selectedWeek === 'number') {
      const { start, end } = this.dateFunctions.getIsoWeekRange(this.selectedYear, selectedWeek);
      this.weekStartDate = start;
      this.weekEndDate = end;
      this.getCampaignNumbersForSelectedProdLine();
    } else {
      this.weekStartDate = null;
      this.weekEndDate = null;
    }
  }

  private clearCampaignNumbers(): void {
      this.campaignNumbers = [];
      this.selectedCampaignNumbers = [];
      return;
  }

  private canLoadCampaignNumbers(): boolean {
    return this.selectedProdLineId > 0 && this.weekStartDate !== null && this.weekEndDate !== null;
  }
}

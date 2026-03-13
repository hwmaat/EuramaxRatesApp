import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AmsLoadPanelComponent } from '@app/helpers/ams-load-panel/ams-load-panel.component';
import { BaseGrid } from '@app/helpers/basegrid';
import { PaintDto, SpecMetrixExceptionDto } from '@app/models/paint.model';
import { DxDataGridModule, DxToolbarModule } from 'devextreme-angular';

@Component({
  selector: 'app-paints',
  imports: [CommonModule, AmsLoadPanelComponent, DxToolbarModule, DxDataGridModule],
  templateUrl: './paints.html',
  styleUrl: './paints.scss',
})
export class Paints extends BaseGrid<PaintDto> implements OnInit, AfterViewInit {
  loadingMessage = 'loading....';
  selectedRowKeys: number[] = [];

  constructor() {
    super();
    this.entityEndpoint = 'paints';
    this.entityName = 'PaintDto';
    this.recordIdField = 'id';
    this.showColumnLinesSwitch = true;
    this.showInlineEditButton = false;
    this.showGridCaption = false;
    this.showAddButton = false;
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

  public override refresh(e: any): void {
    this.records = [];
    const spParams = new Map();
    this.loadDataDirect(spParams);
  }

  onSelectionChanged(e: any): void {
    this.selectedRowKeys = e.selectedRowKeys;
  }

  specMetrixExceptionCount = (data: PaintDto): number => {
    return data.specMetrixExceptions?.length ?? 0;
  };

  specMetrixRows(data: PaintDto): SpecMetrixExceptionDto[] {
    return data.specMetrixExceptions ?? [];
  }

}

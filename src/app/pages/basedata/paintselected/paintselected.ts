import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ApiService } from '@services/api.service';
import { DxButtonModule, DxDataGridModule, DxPopupModule } from 'devextreme-angular';

export interface PaintSelectionDto {
  id: number;
  paintCode: string | null;
  paintDescription: string | null;
  paintSystem?: {
    name?: string | null;
    manufacturer?: {
      name?: string | null;
    } | null;
  } | null;
}

@Component({
  selector: 'paintselected',
  standalone: true,
  imports: [CommonModule, DxPopupModule, DxDataGridModule, DxButtonModule],
  templateUrl: './paintselected.html',
  styleUrl: './paintselected.scss',
})
export class PaintSelectedComponent {
  visible = input<boolean>(false);

  closed = output<void>();
  selected = output<PaintSelectionDto>();

  paints: PaintSelectionDto[] = [];
  loading = false;
  selectedRowKeys: number[] = [];

  constructor(private api: ApiService) {}

  onShowing(): void {
    this.loadPaints();
  }

  onSelectionChanged(e: { selectedRowKeys?: number[] }): void {
    this.selectedRowKeys = e.selectedRowKeys ?? [];
  }

  onOk(): void {
    const selectedId = this.selectedRowKeys.at(0);
    if (typeof selectedId !== 'number') {
      return;
    }

    const selectedPaint = this.paints.find((x) => x.id === selectedId);
    if (!selectedPaint) {
      return;
    }

    this.selected.emit(selectedPaint);
    this.onCancel();
  }

  onCancel(): void {
    this.selectedRowKeys = [];
    this.closed.emit();
  }

  private loadPaints(): void {
    this.loading = true;

    this.api.get<PaintSelectionDto[]>('paints').subscribe({
      next: (items) => {
        console.log('paintselected ==> procname', items);
        this.paints = items ?? [];
        this.loading = false;
      },
      error: () => {
        this.paints = [];
        this.loading = false;
      },
    });
  }
}

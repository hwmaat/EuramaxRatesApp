import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/services/api.service';
import { ProductionLine } from '@app/models/productionlines.options';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

interface ProductionLineDto {
  id: number;
  code: string | null;
  name: string | null;
  maxSpeed: number | null;
  maxOvenTemp: number | null;
  created: string;
  updated: string;
}

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private api = inject(ApiService);
  private substrates$?: Observable<string[]>;
  private productionLines$?: Observable<ProductionLine[]>;
  private productionLineNames$?: Observable<string[]>;

  getSubstrates(forceRefresh = false): Observable<string[]> {
    if (!this.substrates$ || forceRefresh) {
      this.substrates$ = this.api.get<string[]>('metal-specifications/substrate').pipe(
        map((items) => (items ?? []).filter((x) => !!x).sort((a, b) => a.localeCompare(b))),
        shareReplay(1)
      );
    }

    return this.substrates$;
  }

  getProductionLines(forceRefresh = false): Observable<ProductionLine[]> {
    if (!this.productionLines$ || forceRefresh) {
      this.productionLines$ = this.api.get<ProductionLineDto[]>('production-lines').pipe(
        map((items) =>
          (items ?? [])
            .map((x) => ({ id: x.id, productionLine: (x.code ?? '').trim() }))
            .filter((x) => !!x.productionLine)
            .sort((a, b) => a.productionLine.localeCompare(b.productionLine))
        ),
        shareReplay(1)
      );
    }

    return this.productionLines$;
  }

  getProductionLineNames(forceRefresh = false): Observable<string[]> {
    if (!this.productionLineNames$ || forceRefresh) {
      this.productionLineNames$ = this.getProductionLines(forceRefresh).pipe(
        map((items) =>
          (items ?? [])
            .map((x) => x.productionLine)
            .filter((x) => !!x)
            .sort((a, b) => a.localeCompare(b))
        ),
        shareReplay(1)
      );
    }

    return this.productionLineNames$;
  }
}

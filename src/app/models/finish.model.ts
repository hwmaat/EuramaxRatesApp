//PaintLayerRecipe
export interface FinishDto {
  id: number;
  finishCode: string;
  productionLineId: number | null;
  productionLineCode: string | null;
  customer: string;
  customerNumber: string;
  substrate: string;
  surfaceTreatment: string;
  surfaceQuality: string;
  preTreatment: string;
  runs: number;
  side: PaintLayerSide; // e.g. "FrontSide"
  maxSpeedRun1: number;
  maxSpeedRun2: number;
  maxSpeedRun3: number;
  state: State; // e.g. "Released"
  paintLayers: FinishPaintLayerDto[];
  version: string;
}

export interface FinishPaintLayerDto {
  id: number;
  layerNumber: number;
  layerThickness: number;
  paint: FinishPaintDto | null;
  paintSystem: FinishPaintSystemDto | null;
}
export interface FinishPaintDto{
  id: number | null;
  paintCode: string | null;
  paintDescription: string | null;
  metallicType: string | null; // e.g. "Unknown"
  nonWhite: boolean | null;
  aluNatur: boolean | null;
  volumeFractionOfSolid: number | null;
  isPrimer: boolean | null;
  isWrinkle: boolean | null;
  isTransparentOrClearCoat: boolean | null;
  paintSystemId: number | null;
}

export interface FinishPaintSystemDto {
  id: number | null;
  name: string | null;
  manufacturer: ManufacturerDto | null;
}

export interface ManufacturerDto{
  id: number | null;
  name: string | null;
}

export type PaintLayerSide = 'FrontSide' | 'BackSide' | 'BothSides';
export type State = 'Trial' | 'Released' | 'Blocked' | 'Archived';

export interface CreatePaintLayerRecipeDto {
  FinishCode?: string;
  PaintLine?: string;
  CustomerNumber?: string;
  Substrate?: string;
  SurfaceTreatment?: string;
  SurfaceQuality?: string;
  PreTreatment?: string;
  Runs?: number;
  Side?: PaintLayerSide;
  MaxSpeedRun1?: number;
  MaxSpeedRun2?: number;
  MaxSpeedRun3?: number;
  State?: State;
  PaintLayers: CreatePaintLayerDto[];
}

export interface CreatePaintLayerDto {
  LayerNumber: number;
  PaintCode?: string;
  LayerThickness: number;
}
export interface UpdatePaintLayerRecipeDto {
  state: State;
  maxSpeedRun1: number;
  maxSpeedRun2: number;
  maxSpeedRun3: number;
}




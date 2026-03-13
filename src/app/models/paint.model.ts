export interface PaintDto {
  id: number;
  paintCode: string | null;
  paintDescription: string | null;
  productionLine: string | null;
  paintSystem: string | null;
  manufacturer: string | null;
  metallicType: string | null;
  nonWhite: boolean;
  aluNatur: boolean;
  volumeFractionOfSolid: number | null;
  isPrimer: boolean;
  isWrinkle: boolean;
  isTransparentOrClearCoat: boolean;
  specMetrixExceptions: SpecMetrixExceptionDto[];
}

export interface SpecMetrixExceptionDto {
  id: number;
  paintId: number;
  recipeDryId: number | null;
  recipeDryCode: string | null;
  recipeWetId: number | null;
  recipeWetCode: string | null;
  version: string | null;
  created: string;
  updated: string;
}

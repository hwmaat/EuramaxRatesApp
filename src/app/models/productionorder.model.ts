export interface ProductionOrderDto {
  id: number;
  orderNumber: number | null;
  manufacturerOrderNumber: number | null;
  campaignNumber: number | null;
  campaignSequenceNumber: number | null;
  campaignDate: string | null;
  productionType: string | null;
  productionStage: string | null;
  customerName: string | null;
  dimensionSetInId: string | null;
  dimensionSetOutId: string | null;
  dimensionSetDescription: string | null;
  finishedProductId: number | null;
  finishedProduct: FinishedProductDto;
  paintLineConfiguration: PaintLineConfigurationDto;
  productionReady: boolean;
  messages: ProductionOrderMessageDto[] | null;
}

export interface FinishedProductDto {
  id: number;
  coatingSystem: string | null;
  metalSpecifications: MetalSpecificationsDto;
  transformations: TransformationDto[] | null;
  chemicalPretreatments: FinishedProductPretreatmentDto[] | null;
  coatingLayerRecipes: FinishedProductPaintLayerRecipeDto[] | null;
}

export interface MetalSpecificationsDto {
  id: number;
  width: number;
  thickness: number;
  material: string;
  substrate: string;
  hardness: string;
  alloyType: string;
  nonAlloyType: string;
}

export interface TransformationDto {
  side: string;
  sequence: number;
}

export interface FinishedProductPretreatmentDto {
  chemicalPretreatment: string;
  side: string;
}

export interface FinishedProductPaintLayerRecipeDto {
  paintLayerRecipeId: number;
}

export interface PaintLineConfigurationDto {
  paintLineType: string | null;
  chemicalCoatingFrontSide: number | null;
  chemicalCoatingBackside: number | null;
  
  coaters: CoaterDto[] | null;
  coater1FrontSide: CoaterDto;
  coater1BackSide: CoaterDto;
  coater2FrontSide: CoaterDto;
  coater2BackSide: CoaterDto;

  inkJet: InkjetInkjet;
  linespeed: number;
  run: number;
  tempZone1: number | null;
  tempZone2: number | null;
  tempZone3: number | null;
  ovenSettingsId: number | null;
  doubleJoin: boolean;
  underOverWind: UnderOverWindUnderOverWind;
}

export interface CoaterDto {
  paintCode: string | null;
  specmetrixRecipe: string | null;
  dryThickness: number | null;
  wetThickness: number | null;
  isClearCoat: boolean;
}

export enum InkjetInkjet {
  OPTION_0 = 0,
  OPTION_1 = 1,
  OPTION_2 = 2
}

export enum UnderOverWindUnderOverWind {
  OPTION_0 = 0,
  OPTION_1 = 1
}

export interface ProductionOrderMessageDto {
  externalReferenceProperty: string | null;
  message: string | null;
  created: string | null;
}

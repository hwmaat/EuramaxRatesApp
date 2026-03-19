export interface ProductionLineDto {
  id: number;
  code:string;
  name: string;
  maxSpeed: number | null;
  maxOvenTemp: number | null;
  created: string;
  updated: string;
}

export interface CreateProductionLineDto {
  name: string | null;
  code: string| null;
  maxSpeed: number | null;
  maxOvenTemp: number | null;
}

export interface UpdateProductionLineDto {
  name?: string | null;
  code?:string | null;
  maxSpeed?: number | null;
  maxOvenTemp?: number | null;
}

export type OvenSettingState = 'Trial' | 'Released' | 'Blocked' | 'Archived';

export interface OvenSettingDto {
  id: number;
  paintLine: string;
  thickness: number;
  lineSpeed: number;
  zone1: number;
  zone2: number;
  zone3: number;
  substrate: string;
  state: OvenSettingState;
  version?: string;
}

export interface OvenSettingsPatchDto {
  state: OvenSettingState;
  zone1: number | null;
  zone2: number | null;
  zone3: number | null;
}

export interface PmtOffsetDto {
  id: number;
  pmt: number;
  temperatureOffset: number;
}
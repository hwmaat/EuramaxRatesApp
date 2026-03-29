export interface MetalSymbol {
  code: string;
  description: string;
  sourceKeys: string[];
}

export const SHARED_METAL_SYMBOLS: ReadonlyArray<MetalSymbol> = [
  { code: 'XAU', description: 'Gold', sourceKeys: ['XAU', 'gold'] },
  { code: 'XAG', description: 'Silver', sourceKeys: ['XAG', 'silver'] }
] as const;

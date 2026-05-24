export const toFloat = (value: string | null): number =>
  parseFloat(value ?? '0') || 0;

export const toInt = (value: string | null): number =>
  parseInt(value ?? '0') || 0;
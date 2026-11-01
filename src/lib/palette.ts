const PALETTE = [
  '#d9402f',
  '#f5a524',
  '#2fa876',
  '#2b8fd9',
  '#6d4fe0',
  '#d9408f',
  '#12a5a5',
  '#e8743b',
];

export function sliceColor(index: number, count: number): string {
  const color = PALETTE[index % PALETTE.length];
  if (index === count - 1 && index % PALETTE.length === 0 && count > 1) return PALETTE[2];
  return color;
}

export function readableText(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#17181c' : '#ffffff';
}

const ESPEES_RATE = Number(process.env.NEXT_PUBLIC_ESPEES_RATE) || 2050;

export function ngnToEspees(amountNGN: number | string): string {
  const num = typeof amountNGN === 'string' ? parseFloat(amountNGN) : amountNGN;
  return (num / ESPEES_RATE).toFixed(4);
}

export function formatEspees(amountNGN: number | string): string {
  const val = ngnToEspees(amountNGN);
  return `${Number(val).toLocaleString()} Esp`;
}

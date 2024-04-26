export function putDecimal(number: number, decimalPlace: number) {
  return number / Math.pow(10, decimalPlace);
}

export function percentage(total: number, part: number) {
  if(part === 0) return 0;
  return (part / total) * 100
}

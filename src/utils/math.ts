export function putDecimal(number: number, decimalPlace: number) {
  return number / Math.pow(10, decimalPlace);
}

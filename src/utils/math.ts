export function putDecimal(number: number, decimalPlace: number) {
  return number / Math.pow(10, decimalPlace);
}

export function percentage(total: number, part: number) {
  if (part === 0) return 0;
  return (part / total) * 100;
}

export function limitDecimals(number: number, limit: number) {
  return Number.parseFloat(number.toFixed(limit));
}

export function normalizeNumber(number: number): number {
  let bal = number.toLocaleString("en-US", { maximumFractionDigits: 9 });
  if (bal.includes(",")) bal = bal.replaceAll(",", "");
  return Number.parseFloat(bal);
}

export function convertTextToNumberInput(value: string, decimals: number) {
  if (value) {
    const splittedValue = value
      .replace(/[^0-9,.]/g, "")
      .replace(",", ".")
      .split(".");
    if (splittedValue.length > 2) splittedValue.pop();
    //Limit decimals based token allowed decimals
    if (splittedValue.length > 1 && splittedValue[1].length > decimals) {
      splittedValue[1] = splittedValue[1].slice(0, decimals);
    }
    value = splittedValue.join(".");
  }
  return value;
}

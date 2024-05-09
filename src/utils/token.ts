import { Address } from "@ton/core";

export const NATIVE = "native";
export const JETTON = "jetton";
export const TOP_TOKENS = [
  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
  "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
  "EQAQXlWJvGbbFfE8F3oS8s87lIgdovS455IsWFaRdmJetTon",
  "EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE",
  "EQD5ty5IxV3HECEY1bbbdd7rNNY-ZcA-pAIGQXyyRZRED9v3",
  "EQCyDhcASwIm8-eVVTzMEESYAeQ7ettasfuGXUG1tkDwVJbc",
  "EQC-tdRjjoYMz3MXKW4pj95bNZgvRyWwZ23Jix3ph7guvHxJ",
  "EQCBdxpECfEPH2wUxi1a6QiOkSf-5qDjUWqLCUuKtD-GLINT",
  "EQDcBkGHmC4pTf34x3Gm05XvepO5w60DNxZ-XT4I6-UGG5L5",
];
export const TONTokenAddress =
  "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const TONToken = {
  decimal: 9,
  balance: 0,
  address: Address.parse(TONTokenAddress).toRawString(),
};

export function convertAmountIntoBN(amount: number, decimals: number): bigint {
  return BigInt(parseInt(`${amount * Math.pow(10, decimals)}`)); //parse Int to remove extra decimals
}

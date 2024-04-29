import { Address } from "@ton/core";

export const NATIVE = "native";
export const JETTON = "jetton";

export const TONTokenAddress = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const TONToken = {
  decimal: 9,
  balance: 0,
  address: Address.parse(TONTokenAddress).toRawString(),
};

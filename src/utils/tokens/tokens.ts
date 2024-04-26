import { Address } from "@ton/core";

import dedustTokens from "@/utils/tokens/dedust.json";
import stonfiTokens from "@/utils/tokens/stonfi.json";

import { MappedToken } from "@/interfaces/interface";

export const NATIVE = "native";
export const JETTON = "jetton";

export const TONTokenAddress = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const TONToken = {
  decimal: 9,
  balance: 0,
  address: Address.parse(TONTokenAddress).toRawString(),
};

function getMappedTokens() {
  const mappedTokens: MappedToken = {};

  //Map deduct tokens
  dedustTokens.assets.forEach((token) => {
    if (!token.address) return;
    const rawAddress = Address.parse(token.address).toRawString();
    mappedTokens[rawAddress] = token;
  });

  //Map stonfi tokens
  stonfiTokens.assets.forEach((token) => {
    if (!token.address) return;
    const rawAddress = Address.parse(token.address).toRawString();
    mappedTokens[rawAddress] = token;
  });
  return mappedTokens;
}

const tokens = getMappedTokens();

export default tokens;

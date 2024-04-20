import { IToken } from "@/interfaces/interface";

import dedustTokens from "@/utils/tokens/dedust.json";
import stonfiTokens from "@/utils/tokens/stonfi.json";
import { Address } from "@ton/core";

function getMappedTokens() {
  const mappedTokens: Record<string, IToken> = {};

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

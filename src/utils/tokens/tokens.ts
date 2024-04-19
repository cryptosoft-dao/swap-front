import { IToken } from "@/interfaces/interface";

import dedustTokens from "@/utils/tokens/dedust.json";
import stonfiTokens from "@/utils/tokens/stonfi.json";

function getMappedTokens() {
  const mappedTokens: Record<string, IToken> = {};

  //Map deduct tokens
  dedustTokens.assets.forEach((token) => {
    if (!token.address) return;
    mappedTokens[token.address] = token;
  });

  //Map stonfi tokens
  stonfiTokens.assets.forEach((token) => {
    if (!token.address) return;
    mappedTokens[token.address] = token;
  });
  return mappedTokens;
}

const tokens = getMappedTokens();

export default tokens;

import TonWeb from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

import { toUserFriendlyAddress } from "@tonconnect/sdk";
import { toNano } from "@ton/core";
import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from "@ston-fi/sdk";

import { Message } from "@/hooks/useTConnect";
import { NATIVE } from "@/utils/token";
import { IToken } from "@/interfaces/interface";

export default async function swapWithStonfi({
  TON_PROVIDER,
  WALLET_ADDRESS,
  JETTON0,
  JETTON1,
  SWAP_AMOUNT,
}: {
  TON_PROVIDER:HttpProvider;
  WALLET_ADDRESS: string;
  JETTON0: IToken;
  JETTON1: IToken;
  SWAP_AMOUNT: number;
}): Promise<Message[]> {
  const router = new Router(TON_PROVIDER, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  let messages: Message[] = [];
  const PROXY_TON = "EQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffLez";

  if (JETTON0.address == JETTON1.address) return [];

  // Swapping TON
  if (JETTON0.type == NATIVE) {
    const tonToJettonTxParams = await router.buildSwapProxyTonTxParams({
      userWalletAddress: WALLET_ADDRESS,
      proxyTonAddress: PROXY_TON,
      offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT * 1000000000}`),
      askJettonAddress: JETTON1.address,
      minAskAmount: new TonWeb.utils.BN(1),
      queryId: 12345,
      referralAddress: WALLET_ADDRESS,
    });

    messages.push({
      address: toUserFriendlyAddress(tonToJettonTxParams.to.toString()),
      amount: toNano(
        TonWeb.utils.fromNano(tonToJettonTxParams.gasAmount)
      ).toString(),
      payload: TonWeb.utils.bytesToBase64(
        await tonToJettonTxParams.payload.toBoc()
      ),
    });
    return messages;
  }

  // Swapping Jetton
  const swapTxParams = await router.buildSwapJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    offerJettonAddress: JETTON0.address,
    offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT * 1000000000}`),
    askJettonAddress: JETTON1.type == NATIVE ? PROXY_TON : JETTON1.address,
    minAskAmount: new TonWeb.utils.BN(1),
    queryId: 12345,
    referralAddress: WALLET_ADDRESS,
  });

  messages.push({
    address: toUserFriendlyAddress(swapTxParams.to.toString()),
    amount: toNano(TonWeb.utils.fromNano(swapTxParams.gasAmount)).toString(),
    payload: TonWeb.utils.bytesToBase64(await swapTxParams.payload.toBoc()),
  });
  return messages;
}

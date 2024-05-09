import TonWeb from "tonweb";
import { HttpProvider } from "tonweb/dist/types/providers/http-provider";

import { toUserFriendlyAddress } from "@tonconnect/sdk";
import { toNano } from "@ton/core";
import { DEX, pTON } from "@ston-fi/sdk";

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
  TON_PROVIDER: HttpProvider;
  WALLET_ADDRESS: string;
  JETTON0: IToken;
  JETTON1: IToken;
  SWAP_AMOUNT: bigint
}): Promise<Message[]> {
  const router = new DEX.v1.Router({
    tonApiClient: TON_PROVIDER,
  });

  let messages: Message[] = [];

  if (JETTON0.address == JETTON1.address) return [];

  // Swap TON to JETTON
  if (JETTON0.type == NATIVE) {
    const txParams = await router.buildSwapTonToJettonTxParams({
      userWalletAddress: WALLET_ADDRESS,
      proxyTonAddress: pTON.v1.address,
      offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT}`),
      askJettonAddress: JETTON1.address,
      minAskAmount: new TonWeb.utils.BN(1),
      queryId: 12345,
      // referralAddress: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS,
      // forwardGasAmount: new TonWeb.utils.BN(`${0.3 * 1000000000}`),
    });

    messages.push({
      address: txParams.to.toString(),
      amount: toNano(TonWeb.utils.fromNano(txParams.gasAmount)).toString(),
      payload: TonWeb.utils.bytesToBase64(await txParams.payload.toBoc()),
    });
    return messages;
  }

  // Swap JETTON to TON
  if (JETTON1.type == NATIVE) {
    const txParams = await router.buildSwapJettonToTonTxParams({
      userWalletAddress: WALLET_ADDRESS,
      offerJettonAddress: JETTON0.address,
      offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT}`),
      proxyTonAddress: pTON.v1.address,
      minAskAmount: new TonWeb.utils.BN("1"),
      queryId: 12345,
      // referralAddress: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS,
      // forwardGasAmount: new TonWeb.utils.BN(`${0.3 * 1000000000}`),
    });
    
    messages.push({
      address: txParams.to.toString(),
      amount: toNano(TonWeb.utils.fromNano(txParams.gasAmount)).toString(),
      payload: TonWeb.utils.bytesToBase64(await txParams.payload.toBoc()),
    });
    return messages;
  }

  // Swap Jetton to Jetton
  const txParams = await router.buildSwapJettonToJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    offerJettonAddress: JETTON0.address,
    offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT}`),
    askJettonAddress: JETTON1.address,
    minAskAmount: new TonWeb.utils.BN(1),
    queryId: 12345,
    // referralAddress: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS,
    // forwardGasAmount: new TonWeb.utils.BN(`${0.3 * 1000000000}`),
  });

  messages.push({
    address: txParams.to.toString(),
    amount: toNano(TonWeb.utils.fromNano(txParams.gasAmount)).toString(),
    payload: TonWeb.utils.bytesToBase64(await txParams.payload.toBoc()),
  });
  return messages;
}

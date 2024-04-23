import TonWeb from "tonweb";

import { Router, ROUTER_REVISION, ROUTER_REVISION_ADDRESS } from "@ston-fi/sdk";

export default async function swapWithStonfi({
  WALLET_ADDRESS,
  JETTON0,
  JETTON1,
  SWAP_AMOUNT,
}: {
  WALLET_ADDRESS: string;
  JETTON0: string;
  JETTON1: string;
  SWAP_AMOUNT: number;
}) {
  const provider = new TonWeb.HttpProvider();

  const router = new Router(provider, {
    revision: ROUTER_REVISION.V1,
    address: ROUTER_REVISION_ADDRESS.V1,
  });

  const swapTxParams = await router.buildSwapJettonTxParams({
    userWalletAddress: WALLET_ADDRESS,
    offerJettonAddress: JETTON0,
    offerAmount: new TonWeb.utils.BN(`${SWAP_AMOUNT * 1000000000}`),
    askJettonAddress: JETTON1,
    minAskAmount: new TonWeb.utils.BN(1),
    referralAddress: undefined,
  });

  return {
    to: swapTxParams.to,
    amount: swapTxParams.gasAmount,
    payload: swapTxParams.payload,
  };
}

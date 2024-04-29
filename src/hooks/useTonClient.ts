import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient, TonClient4 } from '@ton/ton';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from "./useTConnect";
import { CHAIN } from "@tonconnect/protocol";

export function useTonClient() {
  const { network } = useTonConnect();

  return {
    client: useAsyncInitialize(async () => {
      if (!network) return;
      return new TonClient4({
        // endpoint: await getHttpEndpoint({
        //   network: network === CHAIN.MAINNET ? "mainnet" : "testnet",
        // }),
        endpoint: "https://mainnet-v4.tonhubapi.com",
      });
    }, [network]),
  };
}
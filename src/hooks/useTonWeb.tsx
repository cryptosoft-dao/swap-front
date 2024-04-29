import { getHttpEndpoint } from '@orbs-network/ton-access';
import TonWeb from "tonweb";
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from "./useTConnect";
import { CHAIN } from "@tonconnect/protocol";

export function useTonWeb() {
  const { network } = useTonConnect();

  return {
    provider: useAsyncInitialize(async () => {
      if (!network) return;
      return new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
				apiKey: '136c57975d0f0dfe81edf08051a88fbb6d7ab0e9d37491e3df2c5ae7ce8bffb3'
			});
    }, [network]),
  };
}
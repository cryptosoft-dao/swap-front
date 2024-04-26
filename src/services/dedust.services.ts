import { Address } from "@ton/core";

import { IDedustPool } from "@/interfaces/dedust";
import { ISimulateDedustData } from "@/interfaces/dedust";
import { IToken } from "@/interfaces/interface";
import { ISimulateRes } from "@/interfaces/request";

import { DEDUST_APIS } from "@/utils/api.links";
import { get, post } from "@/utils/request";
import { calculatePriceImpact } from "@/utils/pool";

export async function getDedustPools() {
  const url = DEDUST_APIS.pools;
  const res = await get<IDedustPool[]>({ url });
  return res;
}

export async function simulateDedustSwap(query: {
  from: IToken;
  to: IToken;
  amount: number;
}): Promise<ISimulateRes> {
  try {
    const url = DEDUST_APIS.simulate;
    const payload = {
      from:
        query.from.type === "native"
          ? "native"
          : `jetton:${Address.parse(query.from.address).toRawString()}`,
      to:
        query.to.type === "native"
          ? "native"
          : `jetton:${Address.parse(query.to.address).toRawString()}`,
      amount: query.amount,
    };
    const res = await post<ISimulateDedustData[][]>({
      url,
      data: payload,
    });

    if (!res.data || !res.data[0]) throw { message: "Something went wrong" };

    const data = res.data[0].find((pool) => pool.assetOut === payload.to);

    if (!data) throw { message: "Something went wrong" };

    const sendAmount = payload.amount / Math.pow(10, query.from.decimals);
    const receiveAmount =
      Number.parseInt(data.amountOut) / Math.pow(10, query.to.decimals);

    return {
      status: "success",
      data: {
        fees:
          Number.parseInt(data.tradeFee) / Math.pow(10, query.from.decimals),
        swapRate: receiveAmount / sendAmount,
        amountOut: receiveAmount,
        priceImpact: calculatePriceImpact({
          offerAssetReserve: Number.parseFloat(data.pool.reserves[0]),
          askAssetReserve: Number.parseFloat(data.pool.reserves[1]),
          offerAmount: payload.amount,
        }),
      },
    };
  } catch (err) {
    return {
      status: "fail",
      data: null,
    };
  }
}

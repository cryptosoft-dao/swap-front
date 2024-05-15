import { IToken } from "@/interfaces/interface";
import {
  IReserveRes,
  ISimulateRes,
  IStonfiPoolRes,
  IStonfiPoolsRes,
} from "@/interfaces/request";
import { ISimulateStonfiData } from "@/interfaces/stonfi";

import { CUSTOM_APIs, STONFI_APIs } from "@/utils/api.links";
import { get, post } from "@/utils/request";

export async function getStonfiPools() {
  const url = STONFI_APIs.pools;
  const res = await get<IStonfiPoolsRes>({ url });
  return res;
}

export async function getStonfiPool({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}): Promise<IReserveRes> {
  try {
    const url = CUSTOM_APIs.stonfiPool(primary, secondary);
    const res = await get<IStonfiPoolRes>({ url });

    if (!res.data || !res.data?.found) {
      throw { message: "not found" };
    }

    const reserves = [res.data.pool.reserve0, res.data.pool.reserve1];
    const swapable = reserves.reduce(
      (totalRes, curRes) => totalRes + Number(curRes),
      0
    )
      ? true
      : false;

    return {
      swapable,
      reserves: (res.data.inverted ? reserves.reverse() : reserves) as [
        string,
        string
      ],
    };
  } catch (err) {
    return {
      swapable: false,
      reserves: ["0", "0"],
    };
  }
}

export async function simulateStonfiSwap(query: {
  from: IToken;
  to: IToken;
  units: number;
  slippage_tolerance: number;
}): Promise<ISimulateRes> {
  try {
    const url = STONFI_APIs.simulate({
      offer_address: query.from.address,
      ask_address: query.to.address,
      units: query.units,
      slippage_tolerance: query.slippage_tolerance,
    });
    const res = await post<ISimulateStonfiData>({ url });
    if (!res.data) throw { message: "Something went wrong!" };
  
    /*return {
      status: "success",
      data: {
        fees:
          Number.parseInt(res.data.fee_units) /
          Math.pow(10, 9),
        swapRate: Number.parseFloat(res.data.swap_rate),
        amountOut:
          Number.parseInt(res.data.ask_units) / Math.pow(10, query.to.decimals),
        priceImpact: Number.parseFloat(res.data.price_impact),
      },
    };*/
    return {
      status:"success",
      data:{
        swapRate: Number.parseFloat(res.data.swap_rate),
      }
    }
  } catch (err) {
    return {
      status: "fail",
      data: null,
    };
  }
}

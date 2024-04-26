import { ISimulate, IToken } from "@/interfaces/interface";
import { ISimulateRes, IStonfiPoolRes } from "@/interfaces/request";
import { ISimulateStonfiData } from "@/interfaces/stonfi";

import { STONFI_APIs } from "@/utils/api.links";
import { get, post } from "@/utils/request";

export async function getStonfiPools() {
  const url = STONFI_APIs.pools;
  const res = await get<IStonfiPoolRes>({ url });
  return res;
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
    return {
      status: "success",
      data: {
        fees: Number.parseInt(res.data.fee_units) / Math.pow(10, query.from.decimals),
        swapRate: Number.parseFloat(res.data.swap_rate),
        amountOut:
          Number.parseInt(res.data.ask_units) / Math.pow(10, query.to.decimals),
        priceImpact:Number.parseFloat(res.data.price_impact)
      },
    };
  } catch (err) {
    return {
      status: "fail",
      data: null,
    };
  }
}

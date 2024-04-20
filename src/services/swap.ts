import { ISwapDetails } from "@/interfaces/request";

import { post } from "@/utils/request";

export async function getSwapDetails(query: {
  offer_address: string;
  ask_address: string;
  unit: number;
  slippage_tolerance: number;
}) {
  const url = `https://api.ston.fi/v1/swap/simulate?offer_address=${query.offer_address}&ask_address=${query.ask_address}&units=${query.unit}&slippage_tolerance=${query.slippage_tolerance}`;
  const res = await post<ISwapDetails>({ url });
  return res;
}

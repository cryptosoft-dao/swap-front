import { TON_APIs } from "@/utils/api.links";
import { get } from "@/utils/request";

import { INativeBalance, IJettonBalance } from "@/interfaces/ton";
import { IJettonBalancesRes } from "@/interfaces/request";

export async function getBalance(address: string) {
  const url = TON_APIs.nativeBalance(address);
  const res = await get<INativeBalance>({ url });
  return res;
}

export async function getBalances(address: string) {
  const url = TON_APIs.jettonBalances(address);
  const res = await get<IJettonBalancesRes<IJettonBalance[]>>({ url });
  return res;
}

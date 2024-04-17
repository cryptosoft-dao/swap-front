import { INativeBalance, IBalance } from "@/interfaces/account";
import { IBalancesRes } from "@/interfaces/request";

import { get } from "@/utils/request";

export async function getBalance(address: string) {
  const url = `https://tonapi.io/v2/accounts/${address}`;
  const res = await get<INativeBalance>({ url });
  return res;
}

export async function getBalances(address: string) {
  const url = `https://tonapi.io/v2/accounts/${address}/jettons`;
  const res = await get<IBalancesRes<IBalance[]>>({ url });
  return res;
}

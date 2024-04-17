import { IAccount } from "@/interfaces/account";
import { get } from "@/utils/request";

export async function getBalance(address: string) {
    const url = `https://tonapi.io/v2/accounts/${address}`;
    const res = await get<IAccount>({ url });
    return res;
} 
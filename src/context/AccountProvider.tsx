import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useTonConnect } from "@/hooks/useTONConnect";

import { getBalance, getBalances } from "@/services/account";

import { IBalance } from "@/interfaces/account";
import { IContent, IToken } from "@/interfaces/interface";

import dedustTokens from "@/utils/tokens/dedust.json";
import stonfiTokens from "@/utils/tokens/stonfi.json";

import { putDecimal } from "@/utils/math";

const reduce = (mapT: any, obj: IToken) => {
    if (obj.address) mapT[obj.address] = obj
    return mapT
}
// Merge arrays based on unique 'address'
const tokens: IToken[] = [
    ...(dedustTokens.assets.reduce(reduce),
        new Map(stonfiTokens.assets.map(obj => [obj.address, obj]))).values()
];

export interface IAccountContext {
    tokens: IToken[];
    balances: Record<string, number>;
    loading: boolean;
}

export const AccountContext = createContext<IAccountContext>({
    tokens: [],
    balances: {},
    loading: false
});

const nativeTokenBalance = {
    decimal: 9,
    balance: 0,
    address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
}

export const AccountProvider = (props: React.PropsWithChildren) => {

    const { rawWalletAddress } = useTonConnect();

    const [accountBalance, setBalance] = useState<IContent<{
        balances: IBalance[],
        nativeTokenBalance: {
            decimal: number;
            balance: number;
            address: string;
        }
    }>>({
        status: "",
        loading: false,
        content: {
            balances: [],
            nativeTokenBalance
        },
        message: ""
    });

    useEffect(() => {

        if (!rawWalletAddress || accountBalance.loading) return;
        (async () => {
            setBalance({
                status: "",
                loading: true,
                content: {
                    balances: [],
                    nativeTokenBalance
                },
                message: ""
            });

            try {

                const balancesRes = await getBalances(rawWalletAddress)
                if (!balancesRes.data) throw { message: "Not found" }
                const balanceRes = await getBalance(rawWalletAddress)
                if (!balanceRes.data) throw { message: "Not found" }

                setBalance({
                    status: "success",
                    loading: false,
                    content: {
                        balances: balancesRes.data.balances,
                        nativeTokenBalance: {
                            ...nativeTokenBalance,
                            balance: balanceRes.data.balance,
                        }
                    },
                    message: ""
                });

            } catch (err) {
                setBalance({
                    status: "fail",
                    loading: false,
                    content: {
                        balances: [],
                        nativeTokenBalance: nativeTokenBalance
                    },
                    message: (err as Error).message
                });
            }
        })();

    }, [rawWalletAddress]);

    /*const mappedTokens = useMemo(() => {
        if (balance.loading || balance.status !== "success") return tokens;

        const updatedTokens: IToken[] = [...tokens];
        balance.content.balances.forEach(bal => {
            const token = tokens.find(tk => bal.jetton.symbol.toLocaleLowerCase() === tk.symbol.toLocaleLowerCase());
            if (!token) return;
            token.balance = putDecimal(Number.parseInt(bal.balance), bal.jetton.decimals);
            return token;
        });

        return updatedTokens;
    }, [balance]);*/

    const balances = useMemo(() => {
        const newBalances: Record<string, number> = {};
        //Jettons
        accountBalance.content.balances.forEach(bal => {
            newBalances[bal.jetton.address] = putDecimal(Number.parseInt(bal.balance), bal.jetton.decimals);
        })
        //Native Token
        const { balance, address, decimal } = accountBalance.content.nativeTokenBalance;
        newBalances[address] = putDecimal(balance, decimal);

        return newBalances;
    }, [accountBalance]);

    return (
        <AccountContext.Provider value={{ tokens, balances, loading: accountBalance.loading }}>
            {props.children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useTonConnect } from "@/hooks/useTONConnect";

import { getBalance, getBalances } from "@/services/account";

import { IBalance } from "@/interfaces/account";
import { IContent, IToken } from "@/interfaces/interface";

import { tokens } from "@/utils/tokens";
import { putDecimal } from "@/utils/math";

export interface IAccountContext {
    tokens: IToken[];
    loading: boolean;
}

export const AccountContext = createContext<IAccountContext>({
    tokens: [],
    loading: false
});

const nativeTokenBalance = {
    decimal: 9,
    balance: 0,
    address: ""
}

export const AccountProvider = (props: React.PropsWithChildren) => {

    const { rawWalletAddress } = useTonConnect();

    const [balance, setBalance] = useState<IContent<{
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

        if (!rawWalletAddress || balance.loading) return;
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

    const mappedTokens = useMemo(() => {
        if (balance.loading || balance.status !== "success") return tokens;

        const updatedTokens = tokens.map(token => {
            const bal = balance.content.balances.find(bal => bal.jetton.symbol.toLocaleLowerCase() === token.symbol.toLocaleLowerCase());

            if (token.native) {
                const nativeBal = balance.content.nativeTokenBalance
                token.balance = putDecimal(nativeBal.balance, nativeBal.decimal);
                token.address = nativeBal.address;
                return token;
            }

            if (!bal) return token;

            token.balance = putDecimal(Number.parseInt(bal.balance), bal.jetton.decimals);
            token.address = bal.jetton.address;
            return token;
        });
        return updatedTokens;
    }, [balance]);

    return (
        <AccountContext.Provider value={{ tokens: mappedTokens, loading: balance.loading }}>
            {props.children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);
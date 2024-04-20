import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { toUserFriendlyAddress } from "@tonconnect/sdk";
import { useTonConnect } from "@/hooks/useTONConnect";

import { getBalance, getBalances } from "@/services/account";

import { IBalance } from "@/interfaces/account";
import { IContent, IToken } from "@/interfaces/interface";

import { putDecimal } from "@/utils/math";

import mappedTokens from "@/utils/tokens/tokens";
import { Address } from "@ton/core";

export interface IAccountContext {
    tokens: IToken[];
    getBalance: (address: string) => number;
    loading: boolean;
}

export const AccountContext = createContext<IAccountContext>({
    tokens: [],
    getBalance: (address: string) => 0,
    loading: false
});

const nativeTokenBalance = {
    decimal: 9,
    balance: 0,
    address: Address.parse("EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c").toRawString()
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

    const tokens = useMemo((): IToken[] => {
        const newTokens: Record<string, IToken> = { ...mappedTokens };
        const tokenWithBalances: Record<string, IToken> = {};

        if (accountBalance.status === "success") {
            //Map native balance
            const { balance, decimal, address } = accountBalance.content.nativeTokenBalance;
            if (newTokens[address]) {
                //Copy token
                const nativeToken = { ...newTokens[address] }
                //Delete token from list
                delete newTokens[address];
                //Update balance
                nativeToken.balance = putDecimal(balance, decimal);
                tokenWithBalances[address] = nativeToken;
            }
            //Map Jetton balance
            accountBalance.content.balances.forEach(bal => {
                const jettonAddress = bal.jetton.address;
                if (!newTokens[jettonAddress]) return;
                //Copy token
                const token = { ...newTokens[jettonAddress] }
                //Delete token from list
                delete newTokens[jettonAddress]
                token.balance = putDecimal(Number.parseInt(bal.balance), bal.jetton.decimals);
                tokenWithBalances[jettonAddress] = token;
            });
        }
        return [...Object.values(tokenWithBalances), ...Object.values(newTokens)];
    }, [accountBalance]);

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

    function getTokenBalance(address: string) {
        const rawAddress = Address.parse(address).toRawString();
        return balances[rawAddress]
    }

    return (
        <AccountContext.Provider value={{
            tokens,
            getBalance: getTokenBalance,
            loading: accountBalance.loading
        }}>
            {props.children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);

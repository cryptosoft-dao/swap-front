import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Address } from "@ton/core";

import { useTonConnect } from "@/hooks/useTONConnect";
import useTokenSelector from "@/hooks/useTokenSelector";

import { putDecimal } from "@/utils/math";
import mappedTokens, { TONToken } from "@/utils/tokens/tokens";
import { mergeStonfiPoolInDedustPool, reFormatDedustPoolList } from "@/utils/pool";

import { getBalance, getBalances } from "@/services/ton.services";
import { getDedustPools } from "@/services/dedust.services";
import { getStonfiPools } from "@/services/stonfi.services";

import { IContent, IPool, IToken, ITokenSelectorHook, MappedBalance, MappedToken, MappedTokenPair } from "@/interfaces/interface";

interface IPairAddress {
    primary: string,
    secondary: string
}

export interface IAccountContext {
    tokens: IToken[];
    secondaryTokens: IToken[];
    getBalance: (address: string) => number;
    getPair: (addresses: IPairAddress) => IPool;
    isReady: boolean;
    primarySelector: ITokenSelectorHook;
    secondarySelector: ITokenSelectorHook;
}

export const AccountContext = createContext<IAccountContext>({
    tokens: [],
    secondaryTokens: [],
    getBalance: (address: string) => 0,
    getPair: (addresses) => {
        return {
            assets: addresses,
            dedustReserved: ["", ""],
            stonfiReserved: ["", ""]
        }
    },
    isReady: false,
    primarySelector: {
        selectToken: (token) => { },
        selector: 'primary',
        toggleSelector: () => { }
    },
    secondarySelector: {
        selectToken: (token) => { },
        selector: 'secondary',
        toggleSelector: () => { }
    }
});

export const AccountProvider = (props: React.PropsWithChildren) => {

    const { rawWalletAddress, connectionChecked, connected } = useTonConnect();
    const primarySelector = useTokenSelector('primary');
    const secondarySelector = useTokenSelector('secondary');

    const [accountBalance, setBalance] = useState<IContent<MappedBalance>>({
        status: "",
        loading: false,
        content: {},
        message: ""
    });

    const [pool, setPool] = useState<IContent<MappedTokenPair>>({
        status: "",
        loading: false,
        content: {},
        message: ""
    });

    function getTokenBalance(address?: string): number {
        if (!address) return 0;
        const rawAddress = Address.parse(address).toRawString();
        return accountBalance.content[rawAddress]
    }

    function getPair(addresses: { primary: string, secondary: string }): IPool {
        const primaryTokenPairs = pool.content[addresses.primary];
        return primaryTokenPairs[addresses.secondary];
    }

    //MAP BALANCES IN TOKEN
    const primaryMappedTokens = useMemo((): MappedToken => {
        if (accountBalance.status !== "success")
            return mappedTokens;

        const primaryTokens: MappedToken = { ...mappedTokens };
        const tokenWithBalances: MappedToken = {};
        const nativeTokenWithBalances: MappedToken = {};

        for (let address in accountBalance.content) {
            if (!primaryTokens[address]) continue;
            //Copy token
            const token = { ...primaryTokens[address] }
            //Delete token from list
            delete primaryTokens[address];
            //Update balance
            token.balance = accountBalance.content[address];
            if (token.type === "native") {
                nativeTokenWithBalances[address] = token;
            } else {
                tokenWithBalances[address] = token;
            }
        }

        return {
            ...nativeTokenWithBalances,
            ...tokenWithBalances,
            ...primaryTokens
        };

    }, [accountBalance]);

    const secondaryMappedTokens = useMemo((): MappedToken => {
        const primaryTokenPairs = pool.content[primarySelector.token?.address || ""];
        if (!primaryTokenPairs) return {};
        // Create a set of keys from primaryMappedTokens for faster lookup
        const primaryMappedTokenKeys = new Set(Object.keys(primaryMappedTokens));
        const secondaryTokens: MappedToken = {};
        const tokenWithBalances: MappedToken = {};
        const nativeTokenWithBalances: MappedToken = {};

        for (let key in primaryTokenPairs) {
            const rawAddress = Address.parse(key).toRawString();
            if (!primaryMappedTokenKeys.has(rawAddress))
                continue;
            const token = primaryMappedTokens[rawAddress];
            if (token.balance) {
                if (token.type === "native") {
                    nativeTokenWithBalances[rawAddress] = token;
                } else {
                    tokenWithBalances[rawAddress] = token;
                }
            } else {
                secondaryTokens[rawAddress] = token;
            }
        }

        return {
            ...nativeTokenWithBalances,
            ...tokenWithBalances,
            ...secondaryTokens
        }
    }, [primarySelector]);

    const primaryTokens = useMemo(() => {
        return Object.values(primaryMappedTokens)
    }, [primaryMappedTokens]);

    const secondaryTokens = useMemo(() => {
        return Object.values(secondaryMappedTokens)
    }, [secondaryMappedTokens]);

    const isPoolLoaded = useMemo(() => {
        return !pool.loading && pool.status === "success"
    }, [pool]);

    const isBalanceLoaded = useMemo(() => {
        if (!connectionChecked) return false;
        if (!connected) return true;
        return !accountBalance.loading && accountBalance.status === "success";
    }, [connectionChecked, connected, accountBalance])

    const isReady = useMemo(() => {
        return isBalanceLoaded && isPoolLoaded;
    }, [isPoolLoaded, isBalanceLoaded]);

    //FETCH POOL DATA
    useEffect(() => {
        if (pool.loading) return;

        (async () => {
            setPool({
                ...pool,
                loading: true
            });

            try {
                const dedustPoolRes = await getDedustPools();
                const stonfiPoolRes = await getStonfiPools();
                //Merge data
                const reducedDedustPool = reFormatDedustPoolList((dedustPoolRes?.data || []));
                const mergedPools = mergeStonfiPoolInDedustPool(reducedDedustPool, (stonfiPoolRes.data?.pool_list || []))

                setPool({
                    loading: false,
                    status: "success",
                    content: mergedPools,
                    message: ""
                });

            } catch (err) {
                setPool({
                    ...pool,
                    status: "fail",
                    loading: false,
                    message: (err as Error).message
                })
            }

        })()

    }, [mappedTokens]);

    //FETCH BALANCES ON POOL DATA AND WALLET LOAD
    useEffect(() => {
        if (!rawWalletAddress || !isPoolLoaded || accountBalance.loading) return;
        (async () => {
            setBalance({
                status: "",
                loading: true,
                content: {},
                message: ""
            });

            try {

                const balancesRes = await getBalances(rawWalletAddress)
                if (!balancesRes.data) throw { message: "Not found" }
                const balanceRes = await getBalance(rawWalletAddress)
                if (!balanceRes.data) throw { message: "Not found" }

                //Mapp Balances
                const newBalances: MappedBalance = {};
                //Map Jettons balances
                balancesRes.data.balances.forEach(bal => {
                    newBalances[bal.jetton.address] = putDecimal(Number.parseInt(bal.balance), bal.jetton.decimals);
                })
                //Map Native balance
                const { address, decimal } = TONToken
                newBalances[address] = putDecimal(balanceRes.data.balance, decimal);

                setBalance({
                    status: "success",
                    loading: false,
                    content: newBalances,
                    message: ""
                });

            } catch (err) {
                setBalance({
                    status: "fail",
                    loading: false,
                    content: {},
                    message: (err as Error).message
                });
            }
        })();

    }, [isPoolLoaded, rawWalletAddress]);

    return (
        <AccountContext.Provider value={{
            isReady,
            tokens: primaryTokens,
            secondaryTokens: secondaryTokens,
            getBalance: getTokenBalance,
            getPair,
            primarySelector,
            secondarySelector
        }}>
            {props.children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Address } from "@ton/core";

import { useTonConnect } from "@/hooks/useTConnect";
import useTokenSelector from "@/hooks/useTokenSelector";

import Token_Data from "@/data/token.json";
import Pool_Data from "@/data/pool.json";

import { putDecimal } from "@/utils/math";
import { TONToken } from "@/utils/token";

import { getBalance, getBalances } from "@/services/ton.services";
import { getStonfiPool } from "@/services/stonfi.services";
import { getDedustPool } from "@/services/swap/dedust";

import { IContent, IPool, IToken, ITokenSelectorHook, MappedBalance, MappedToken, MappedTokenPair } from "@/interfaces/interface";

export interface IAccountContext {
    tokens: IToken[];
    secondaryTokens: IToken[];
    getBalance: (address: string) => number;
    getToken: (address: string) => IToken | undefined;
    pool: {
        loading: boolean;
        data: { data: IPool; swapable: boolean } | null
    };
    isReady: boolean;
    primarySelector: ITokenSelectorHook;
    secondarySelector: ITokenSelectorHook;
    closeSelector: () => void;
}

export const AccountContext = createContext<IAccountContext>({
    tokens: [],
    secondaryTokens: [],
    getBalance: (address: string) => 0,
    getToken: (address: string) => undefined,
    pool: {
        loading: false,
        data: null
    },
    isReady: false,
    primarySelector: {
        selectToken: (token) => { },
        selectTokenAndExit: (token) => { },
        selector: 'primary',
        toggleSelector: () => { },
        action: 'select'
    },
    secondarySelector: {
        selectToken: (token) => { },
        selectTokenAndExit: (token) => { },
        selector: 'secondary',
        toggleSelector: () => { },
        action: 'select'
    },
    closeSelector: () => { }
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

    const [pool, setPool] = useState<IContent<{ data: IPool; swapable: boolean } | null>>({
        status: "",
        loading: false,
        content: null,
        message: ""
    })

    function getTokenBalance(address?: string): number {
        if (!address) return 0;
        const rawAddress = Address.parse(address).toRawString();
        return accountBalance.content[rawAddress]
    }

    function getToken(address: string) {
        return secondaryTokens.find(token => token.address === address);
    }

    function closeSelector() {
        if (primarySelector.selector !== "none") {
            primarySelector.toggleSelector();
            return;
        }
        if (secondarySelector.selector !== "none") {
            secondarySelector.toggleSelector();
            return;
        }
    }

    const tokens = useMemo(() => {
        return Token_Data.data as MappedToken
    }, [Token_Data]);

    const pools = useMemo(() => {
        return (Pool_Data as any).data as MappedTokenPair
    }, [Pool_Data]);

    //MAP BALANCES IN TOKEN
    const primaryMappedTokens = useMemo((): MappedToken => {
        if (accountBalance.status !== "success")
            return tokens

        const primaryTokens: MappedToken = { ...tokens };
        const tokenWithBalances: MappedToken = {};
        const nativeTokenWithBalances: MappedToken = {};

        for (let address in accountBalance.content) {
            if (!primaryTokens[address]) continue;
            //Copy token
            const token = { ...primaryTokens[address] }

            token.balance = accountBalance.content[address];
            if (!token.balance) continue;
            //Delete token from list
            delete primaryTokens[address];
            //Update balance
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

        const primaryTokenPairs = pools[primarySelector.token?.address || ""];
        if (!primaryTokenPairs) return {};
        // Create a set of keys from primaryMappedTokens for faster lookup
        const primaryMappedTokenKeys = new Set(Object.keys(primaryMappedTokens));
        const nativeToken:MappedToken = {};
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
                if (token.type === "native") {
                   nativeToken[rawAddress] = token;
                }else{
                    secondaryTokens[rawAddress] = token
                }
            }
        }

        return {
            ...nativeTokenWithBalances,
            ...nativeToken,
            ...tokenWithBalances,
            ...secondaryTokens
        }

    }, [primarySelector.token]);

    const primaryTokens = useMemo(() => {
        return Object.values(primaryMappedTokens)
    }, [primaryMappedTokens]);

    const secondaryTokens = useMemo(() => {
        return Object.values(secondaryMappedTokens);
    }, [secondaryMappedTokens]);

    const isBalanceLoaded = useMemo(() => {
        if (!connectionChecked) return false;
        if (!connected) return true;
        return !accountBalance.loading && accountBalance.status === "success";
    }, [connectionChecked, connected, accountBalance])

    //FETCH POOLS DATA
    useEffect(() => {
        if (pool.loading) return;

        (async () => {
            if (!primarySelector.token || !secondarySelector.token) return;
            setPool({
                ...pool,
                content: null,
                loading: true
            });

            try {
                const dedustPoolRes = await getDedustPool({
                    from: primarySelector.token,
                    to: secondarySelector.token
                })
                const stonfiPoolRes = await getStonfiPool({
                    primary: primarySelector.token.address,
                    secondary: secondarySelector.token.address
                });
                const pool: IPool = {
                    assets: {
                        primary: primarySelector.token.address,
                        secondary: secondarySelector.token.address
                    },
                    dedustReserved: dedustPoolRes.reserves,
                    stonfiReserved: stonfiPoolRes.reserves
                }

                setPool({
                    loading: false,
                    status: "success",
                    content: {
                        swapable: dedustPoolRes.swapable || stonfiPoolRes.swapable,
                        data: pool
                    },
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

    }, [primarySelector.token, secondarySelector.token]);

    //FETCH BALANCES ON POOL DATA AND WALLET LOAD
    useEffect(() => {
        if (!rawWalletAddress || accountBalance.loading) return;
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

    }, [rawWalletAddress]);

    return (
        <AccountContext.Provider value={{
            isReady: isBalanceLoaded,
            tokens: primaryTokens,
            getToken,
            secondaryTokens: secondaryTokens,
            getBalance: getTokenBalance,
            pool: {
                loading: pool.loading,
                data: pool.content,
            },
            primarySelector,
            secondarySelector,
            closeSelector
        }}>
            {props.children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => useContext(AccountContext);

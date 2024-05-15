import { useState, useRef } from "react";

import { IContent, IPool, ISimulate, IToken } from "@/interfaces/interface";

import { Decimal } from "decimal.js";

import { simulateStonfiSwap } from "@/services/stonfi.services";
import { simulateDedustSwap } from "@/services/swap/dedust";
import { useAccount } from "@/context/AccountProvider";

type Simulate = ISimulate | null
type SimulateArgs = Record<"stonfi" | "dedust", Simulate>;

export interface ISimulateArgs {
    primary?: IToken,
    secondary?: IToken,
    amount: number,
    slippage: number;
    reserved: {
        stonfi: number,
        dedust: number
    }
    pool?: IPool;
}

const IntervalInMS = Number.parseInt(process.env.NEXT_PUBLIC_INTERVAL_MS || "5000");

function getAvgSimulatorData({ dedust, stonfi }: SimulateArgs): Simulate {
    if (!dedust && !stonfi) return null;
    if (!stonfi) return dedust;
    if (!dedust) return stonfi;
    const dedustDecimal = new Decimal(dedust.swapRate).add(stonfi.swapRate).div(2)
    return {
        //fees: (dedust.fees + stonfi.fees) / 2,
        //amountOut: (dedust.amountOut + stonfi.amountOut) / BigInt(2),
        swapRate: dedustDecimal.toNumber()
        //priceImpact: (dedust.priceImpact + stonfi.priceImpact) / 2
    }
}

export default function useSimulate() {

    const { primarySelector, secondarySelector } = useAccount();
    const [simulateData, setSimulateData] = useState<IContent<ISimulate | null>>({
        status: "",
        loading: false,
        content: null,
        message: ''
    });

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    function resetTimer() {
        timeoutRef.current && clearInterval(timeoutRef.current);
    }

    function resetSimulateData() {
        setSimulateData({
            status: "",
            loading: false,
            content: null,
            message: ''
        })
    }

    function resetSimulator() {
        resetTimer();
        resetSimulateData();
    }

    async function fetchSimulateData(args: ISimulateArgs) {
        if (simulateData.loading || !args.primary || !args.secondary || primarySelector.selector !== "none" || secondarySelector.selector !== "none") return;
        setSimulateData((prevData) => {
            return {
                content: prevData.content,
                status: "",
                loading: true,
                message: ""
            }
        });

        try {
            const simulateArgs: SimulateArgs = {
                dedust: null,
                stonfi: null
            };

            //Simulate StonfiSwap
            if (args.reserved.stonfi) {
                const stonfiRes = await simulateStonfiSwap({
                    from: args.primary,
                    to: args.secondary,
                    units: args.amount,
                    slippage_tolerance: args.slippage
                });
                simulateArgs.stonfi = stonfiRes.data;
            }

            //Simulate DedustSwap
            if (args.reserved.dedust) {
                const dedustRes = await simulateDedustSwap({
                    from: args.primary,
                    to: args.secondary,
                    amount: args.amount,
                    reserved: (args.pool?.dedustReserved || ["0", "0"]).map(Number.parseFloat) as [number, number]
                });
                simulateArgs.dedust = dedustRes.data;
            }

            const newSimulateData = getAvgSimulatorData(simulateArgs);

            //Reset previous interval
            resetTimer();
            timeoutRef.current = setTimeout(async () => {
                await fetchSimulateData(args);
            }, IntervalInMS);

            setSimulateData({
                status: "success",
                loading: false,
                content: newSimulateData,
                message: ""
            });

        } catch (err) {
            setSimulateData({
                status: "fail",
                loading: false,
                content: null,
                message: ""
            });
        }
    }

    function initSimulator(args: ISimulateArgs) {
        fetchSimulateData(args);
    }

    return {
        simulateData,
        initSimulator,
        resetTimer,
        resetSimulateData,
        resetSimulator
    }
}

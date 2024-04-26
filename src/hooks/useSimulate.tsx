import { useState, useRef } from "react";

import { IContent, IPool, ISimulate, IToken, MappedPool } from "@/interfaces/interface";

import { simulateStonfiSwap } from "@/services/stonfi.services";
import { simulateDedustSwap } from "@/services/swap/dedust";

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
    return {
        fees: (dedust.fees + stonfi.fees) / 2,
        amountOut: (dedust.amountOut + stonfi.amountOut) / 2,
        swapRate: (dedust.swapRate + stonfi.swapRate) / 2,
        priceImpact: (dedust.priceImpact + stonfi.priceImpact) / 2
    }
}

export default function useSimulate() {

    const [simulateData, setSimulateData] = useState<IContent<Simulate>>({
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
        if (simulateData.loading || !args.primary || !args.secondary) return;
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

            setSimulateData({
                status: "success",
                loading: false,
                content: newSimulateData,
                message: ""
            });

            //Reset previous interval
            resetTimer();
            timeoutRef.current = setTimeout(async () => {
                await fetchSimulateData(args);
            }, IntervalInMS);

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
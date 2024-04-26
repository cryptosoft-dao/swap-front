"use client";
import { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";

import { useTonConnect } from "@/hooks/useTONConnect";
import useInput from "@/hooks/useInput";
import useSimulate, { ISimulateArgs } from "@/hooks/useSimulate";

import { useAccount } from "@/context/AccountProvider";

import { Flex, Grid } from "@/components/wrapper";
import { MemoizedSendTokenField, MemoizedReceiveTokenField } from "@/components/Form/SwapInput";
import { PrimaryButton } from "@/components/Form/Button";
import { List } from "@/components/List";
import SettingModal from "@/components/Modal/SetttingsModal";
import { InfoModal, ProgressModal } from "@/components/Modal/Modal";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";

import { MemoizedSearch } from "@/components/Form/TokenSelector";

import SettingIcon from "@/assets/icons/settingicon.png";
import ReloadIcon from "@/assets/icons/reload.svg";
import SwapIcon from "@/assets/icons/swapicon.svg";
import UpIcon from "@/assets/icons/UpArrow.svg";
import DownIcon from "@/assets/icons/down-icon.svg";
import InfoIcon from "@/assets/icons/info.svg";

import swapWithStonfi from "@/services/swap/stonfi";
import swapWithDedust from "@/services/swap/dedust";

import { calculateReserve, splitOfferAmount } from "@/utils/pool";

import { IReserve, ISlippage } from "@/interfaces/interface";

interface INavProps {
    icon: StaticImageData;
    label: string;
    click?: () => void;
}

function Nav(props: INavProps) {
    return <div
        onClick={props.click}
        className="flex w-[32px] h-[32px] border border-border_primary rounded-full cursor-pointer"
    >
        <Image className="m-auto w-[16px] h-[16px]" src={props.icon} alt={props.label} />
    </div>
}

export default function Home() {

    const { connected, connect, walletAddress, sendTransaction } = useTonConnect();
    const {
        isReady,
        tokens,
        secondaryTokens,
        primarySelector,
        secondarySelector,
        getBalance,
        getPair
    } = useAccount();

    const sendInput = useInput(0);
    const [slippage, setSlipage] = useState<ISlippage>({
        type: "default",
        value: 1
    });
    const {
        simulateData,
        initSimulator,
        resetTimer,
        resetSimulator
    } = useSimulate();

    const [show, setShow] = useState(true);
    const [modal, setModal] = useState("");

    async function swap() {
        setModal("progress");
        try {
            if (!walletAddress || !primarySelector.token?.address || !secondarySelector?.token?.address) return;

            const { stonfi, dedust } = distributionPlan.reserved;
            const { dedustOfferAmount, stonfiOfferAmount } = splitOfferAmount({
                offerAmount: sendInput.value,
                dedustReserve: dedust?.reserve || 0,
                stonfiReserve: stonfi?.reserve || 0
            })

            const stonfi_messages = await swapWithStonfi({
                SWAP_AMOUNT: stonfiOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            });


            const dedust_messages = await swapWithDedust({
                SWAP_AMOUNT: dedustOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            });

            const swap_messages = [...stonfi_messages, ...dedust_messages];
            await sendTransaction(swap_messages);

        } catch (err) {
            // alert((err as Error).message);
            console.error(err);
        }
        setModal("");
    }

    const distributionPlan = useMemo(() => {

        let reserved: Record<string, IReserve> = {};
        if (primarySelector.token && secondarySelector.token) {
            const pair = getPair({
                primary: primarySelector.token?.address,
                secondary: secondarySelector.token.address
            });
            reserved = calculateReserve(pair);
        }
        const data = Object.values(reserved).sort((a, b) => b.reserve - a.reserve);
        const comp = <p
            className="max-w-[50%] flex flex-wrap justify-end text-right text-white text_14_400_Inter gap-1"
        >
            <span className={`${data[0]?.reserve ? "" : "hidden"} whitespace-nowrap `}>{`${data[0]?.platform} >`}</span>
            <span className={`${data[0]?.reserve ? "" : "hidden"} text-green`}>{`${data[0]?.reserve}%`}</span>
            {data[0]?.reserve && data[1]?.reserve ? <span>{"|"}</span> : <></>}
            <span className={`${data[1]?.reserve ? "" : "hidden"} whitespace-nowrap `}>{`${data[1]?.platform} >`}</span>
            <span className={`${data[1]?.reserve ? "" : "hidden"} text-green`}>{`${data[1]?.reserve}%`}</span>
        </p>;

        return {
            reserved,
            comp
        }
    }, [primarySelector.token, secondarySelector.token]);

    const simulateQuery = useMemo(() => {

        const ready = (sendInput.inputEnd && sendInput.value && primarySelector.token && secondarySelector.token) ? true : false;
        const query: ISimulateArgs = {
            primary: primarySelector.token,
            secondary: secondarySelector.token,
            slippage: slippage.value / 100,
            amount: sendInput.value * Math.pow(10, primarySelector.token?.decimals || 9),
            reserved: {
                stonfi: distributionPlan.reserved.stonfi?.reserve || 0,
                dedust: distributionPlan.reserved.dedust?.reserve || 0
            },
        }

        if (primarySelector.token && secondarySelector.token) {
            query.pool = getPair({
                primary: primarySelector.token.address,
                secondary: secondarySelector.token.address,
            })
        }

        return {
            query,
            ready
        }
    }, [sendInput.inputEnd, primarySelector.token, secondarySelector.token, slippage, distributionPlan.reserved]);

    const receiveBalance = useMemo(() => {
        const swapRate = simulateData.content?.swapRate || 0;
        const askAmount = ((sendInput.value || 0) * swapRate).toFixed(4);
        return Number.parseFloat(askAmount);
    }, [simulateData, sendInput.value]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        if (primarySelector.token) return;
        primarySelector.selectToken(tokens[0]);
    }, [tokens]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        secondarySelector.selectToken(secondarySelector.token || secondaryTokens[0])
    }, [secondaryTokens]);

    //RESET SWAP SIMULATOR ON PRIMARY SELECTOR OPEN
    useEffect(() => {
        if (primarySelector.selector === 'none') return;
        resetSimulator();
    }, [primarySelector.selector]);

    //RESET SWAP SIMULATOR ON SECONDARY SELECTOR OPEN
    useEffect(() => {
        if (secondarySelector.selector === 'none') return;
        resetSimulator();
    }, [secondarySelector]);

    //RESET SWAP ON INPUT
    useEffect(() => {
        resetSimulator();
    }, [sendInput.value]);

    //INITIALIZE SWAP SIMULATOR FOR NEW DATA
    useEffect(() => {
        if (!simulateQuery.ready)
            resetTimer();
        else
            initSimulator(simulateQuery.query);
    }, [simulateQuery]);

    return (
        <Flex className="flex-col h-full">
            <div className="flex justify-between">
                <h2 className=" text-white text_20_700_SFText">Swap</h2>
                <div className="grid grid-cols-2 gap-2">
                    <Nav icon={ReloadIcon} label="reload" />
                    <Nav icon={SettingIcon} label="setting" click={() => setModal("settings")} />
                </div>
            </div>
            <Grid className="gap-4 mt-8 justify-center">
                <MemoizedSendTokenField
                    inputRef={sendInput.ref}
                    value={sendInput.value}
                    balance={getBalance(primarySelector.token?.address || "")}
                    change={sendInput.handleInput}
                    selectedToken={primarySelector.token}
                    toggleSelector={primarySelector.toggleSelector}
                    readonly={simulateData.loading}
                    disabled={simulateData.loading}
                />
                <Image src={SwapIcon} alt="swap" className="w-[15px] h-[15px] mx-auto" />
                <MemoizedReceiveTokenField
                    inputRef={sendInput.ref}
                    value={receiveBalance}
                    balance={receiveBalance}
                    selectedToken={secondarySelector.token}
                    toggleSelector={secondarySelector.toggleSelector}
                    readonly={true}
                    disabled={simulateData.loading}
                />
            </Grid>
            {connected ? <PrimaryButton
                name="Swap"
                className="my-4"
                click={swap}
                disabled={simulateData.loading}
            /> : <PrimaryButton
                name={sendInput.value && !connected ? "Connect & Swap" : "Connect"}
                click={connect}
                className="my-4"
                disabled={simulateData.loading}
            />}
            <div className="mb-5">
                <Flex className="gap-2" click={() => setShow(!show)}>
                    <span className="text_14_400_SFText text-text_primary leading-[16px] cursor-pointer">Swap details</span>
                    <Image src={show ? DownIcon : UpIcon} alt="arrow-down" className={`my-auto`} />
                </Flex>
                {
                    <Grid className={`gap-5 my-6 ${show ? 'h-auto' : 'h-0'} overflow-hidden`}>
                        <List name="Price" value={`1 ${primarySelector.token?.symbol || ""} ≈ ${simulateData?.content?.swapRate || 0.00} ${secondarySelector?.token?.symbol || ""}`} />
                        <List name="Price impact" icon={InfoIcon} value={`${simulateData.content?.priceImpact || "0.00"}%`} valueClassName="!text-red" click={() => setModal('info')} />
                        <List name="Minimum received" icon={InfoIcon} value={`~ ${receiveBalance} ${secondarySelector?.token?.symbol || ""}`} />
                        <List name="Blockchain fee" value={`${simulateData.content?.fees || 0} ${primarySelector.token?.symbol || ""}`} />
                        <List name="Your economy" value="0.00%" valueClassName="!text-green" />
                        <List
                            name="Distribution Plan"
                            value={distributionPlan.comp}
                        />
                        <List name="Routes" value={`${primarySelector.token?.symbol || ""} > stTON > ${secondarySelector?.token?.symbol || ""}`} />
                    </Grid>
                }
            </div>
            <Footer />
            <SettingModal
                active={modal === "settings" && !simulateData.loading}
                slippage={slippage}
                submit={(newSlippage) => setSlipage(newSlippage)}
                close={() => setModal("")}
            />
            <InfoModal active={modal === "info"} close={() => setModal("")} />
            <ProgressModal active={modal === "progress"} />
            {!isReady && <Loader className="absolute top-0 left-0" />}

            {
                primarySelector.selector === 'primary' && <MemoizedSearch
                    active={primarySelector.selector === 'primary'}
                    selectToken={(token) => {
                        primarySelector.selectToken(token);
                        secondarySelector.selectToken(undefined);
                        primarySelector.toggleSelector();
                    }}
                    tokens={tokens}
                />
            }
            {
                secondarySelector.selector === 'secondary' && <MemoizedSearch
                    active={secondarySelector.selector === 'secondary'}
                    selectToken={(token) => {
                        secondarySelector.selectToken(token);
                        secondarySelector.toggleSelector();
                    }}
                    tokens={[...secondaryTokens]}
                />
            }
        </Flex>
    );
}

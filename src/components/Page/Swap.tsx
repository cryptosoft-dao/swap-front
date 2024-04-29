"use client";
import { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";

import { useTonConnect } from "@/hooks/useTConnect";
import { useTonWeb } from "@/hooks/useTonWeb";
import { useTonClient } from "@/hooks/useTonClient";
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

import swapWithStonfi from "@/services/swap/stonfi";
import swapWithDedust from "@/services/swap/dedust";

import { sleep } from "@/utils/sleep";
import { calculateReserve, splitOfferAmount } from "@/utils/pool";

import { IReserve, ISlippage } from "@/interfaces/interface";

interface INavProps {
    icon: StaticImageData;
    label: string;
    click?: () => void;
    disabled?: boolean;
}

function Nav(props: INavProps) {
    return <div
        onClick={props.click}
        className={`flex w-[32px] h-[32px] border border-border_primary rounded-full ${props.disabled ? "cursor-not-allowed" : "cursor-pointer "}`}
    >
        <Image className="m-auto w-[16px] h-[16px]" src={props.icon} alt={props.label} />
    </div>
}

export default function Home() {

    const { connectionChecked, connected, connect, walletAddress, sendTransaction } = useTonConnect();
    const { provider } = useTonWeb();
    const { client } = useTonClient();
    const {
        isReady,
        tokens,
        getToken,
        secondaryTokens,
        pool,
        primarySelector,
        secondarySelector,
        getBalance,
    } = useAccount();

    const sendInput = useInput(-1);
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

    function reload() {
        if (!simulateQuery.ready || isDisabled) return;
        resetTimer();
        initSimulator(simulateQuery.query)
    }

    async function swap() {
        if (!provider || !client)
            return;

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
                TON_PROVIDER: provider,
                SWAP_AMOUNT: stonfiOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            });

            const dedust_messages = await swapWithDedust({
                TON_CLIENT: client,
                SWAP_AMOUNT: dedustOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            });

            // Get user's last transaction hash using tonweb
            const lastTx = (await provider.getTransactions(walletAddress, 1))[0]
            const lastTxHash = lastTx.transaction_id.hash;

            // Send swap transactions
            const swap_messages = [...stonfi_messages, ...dedust_messages];
            await sendTransaction(swap_messages);

            // Run a loop until user's last tx hash changes
            var txHash = lastTxHash
            while (txHash == lastTxHash) {
                await sleep(1500) // some delay between API calls
                let tx = (await provider.getTransactions(walletAddress, 1))[0]
                txHash = tx.transaction_id.hash
            }

        } catch (err) {
            // alert((err as Error).message);
            console.error(err);
        }
        setModal("");
    }

    const distributionPlan = useMemo(() => {
        let reserved: Record<string, IReserve> = {};
        let loaded = false;
        if (pool.data?.data) {
            reserved = calculateReserve(pool.data?.data);
            loaded = true;
        }
        const data = Object.values(reserved).sort((a, b) => b.reserve - a.reserve);
        const comp = <p
            className="max-w-[50%] flex justify-end text-right text-white text_14_400_Inter gap-1"
        >
            <span className={`${data[0]?.reserve ? "" : "hidden"} whitespace-nowrap `}>{`${data[0]?.platform} >`}</span>
            <span className={`${data[0]?.reserve ? "" : "hidden"} text-green`}>{`${data[0]?.reserve}%`}</span>
            {data[0]?.reserve && data[1]?.reserve ? <span className="!text-text_primary">{"|"}</span> : <></>}
            <span className={`${data[1]?.reserve ? "" : "hidden"} whitespace-nowrap `}>{`${data[1]?.platform} >`}</span>
            <span className={`${data[1]?.reserve ? "" : "hidden"} text-green`}>{`${data[1]?.reserve}%`}</span>
        </p>;

        return {
            reserved,
            comp,
            loaded
        }
    }, [pool]);

    const receiveBalance = useMemo(() => {
        const swapRate = simulateData.content?.swapRate || -1;
        if (sendInput.value < 0 || !sendInput.value) return -1;
        const askAmount = (sendInput.value * swapRate).toFixed(4);
        return Number.parseFloat(askAmount);
    }, [simulateData, sendInput.value]);

    const primaryFieldError = useMemo(() => {
        const offerAmount = sendInput.value <= 0 ? 0 : sendInput.value;
        const isBelowMinimum = offerAmount < 0.00000001;
        if (isBelowMinimum && offerAmount)
            return "Cannot swap amount less than 0.00000001";
        const mainBalance = getBalance(primarySelector.token?.address || "");
        const insufficient = offerAmount > mainBalance ? true : false
        if (connectionChecked && connected && insufficient)
            return "Insufficient balance";

        return "";
    }, [connectionChecked, connected, sendInput.value, primarySelector.token]);

    const secondaryFieldError = useMemo(() => {
        if (pool.loading || !pool.data) return "";
        return pool.data.swapable ? "" : "Token not swapable, please select another token";
    }, [pool]);

    const simulateQuery = useMemo(() => {

        const ready = (sendInput.inputEnd && (sendInput.value > 0) && primarySelector.token && secondarySelector.token && !primaryFieldError && !secondaryFieldError && distributionPlan.loaded) ? true : false;
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

        if (pool.data?.data) {
            query.pool = pool.data?.data
        }

        return {
            query,
            ready
        }
    }, [sendInput.inputEnd, primarySelector.token, secondarySelector.token, slippage, distributionPlan]);

    const isDisabled = useMemo(() => {
        return simulateData.loading || pool.loading;
    }, [simulateData.loading, pool.loading]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        console.log("Primary Tokens");
        if (primarySelector.token) return;
        primarySelector.selectToken(tokens[0]);
    }, [tokens]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        if (!secondaryTokens.length) return;
        const selectedToken = secondarySelector.token || getToken("EQCyDhcASwIm8-eVVTzMEESYAeQ7ettasfuGXUG1tkDwVJbc") || secondaryTokens[0];
        secondarySelector.selectToken(selectedToken)
    }, [secondaryTokens]);

    //RESET SWAP ON INPUT
    useEffect(() => {
        resetSimulator();
    }, [sendInput.value]);

    //INITIALIZE SWAP SIMULATOR FOR NEW DATA
    useEffect(() => {
        resetTimer();
        if (simulateQuery.ready && [primarySelector.selector, secondarySelector.selector].includes("none"))
            initSimulator(simulateQuery.query);
    }, [simulateQuery]);

    return (
        <Flex className="flex-col h-full hide-scroll">
            <div className="flex justify-between">
                <h2 className=" text-white text_20_700_SFText">Swap</h2>
                <div className="grid grid-cols-2 gap-2">
                    <Nav
                        icon={ReloadIcon}
                        label="reload"
                        click={reload}
                        disabled={!simulateQuery.ready || isDisabled}
                    />
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
                    toggleSelector={() => {
                        if (isDisabled) return;
                        resetSimulator();
                        primarySelector.toggleSelector()
                    }}
                    readonly={isDisabled}
                    disabled={isDisabled}
                    error={primaryFieldError}
                />
                <Image src={SwapIcon} alt="swap" className="w-[15px] h-[15px] mx-auto" />
                <MemoizedReceiveTokenField
                    inputRef={sendInput.ref}
                    value={receiveBalance}
                    balance={receiveBalance}
                    selectedToken={secondarySelector.token}
                    toggleSelector={() => {
                        if (isDisabled) return;
                        resetSimulator();
                        secondarySelector.toggleSelector()
                    }}
                    readonly={true}
                    disabled={isDisabled}
                    error={secondaryFieldError}
                />
            </Grid>
            {connected ? <PrimaryButton
                name="Swap"
                className="my-4"
                click={swap}
                disabled={isDisabled}
            /> : <PrimaryButton
                name={sendInput.value && !connected ? "Connect & Swap" : "Connect"}
                click={connect}
                className="my-4"
                disabled={isDisabled || !pool.data?.swapable}
            />}
            <div className="mb-5">
                <Flex className="gap-2" click={() => setShow(!show)}>
                    <span className="text_14_400_SFText text-text_primary leading-[16px] cursor-pointer">Swap details</span>
                    <Image src={show ? DownIcon : UpIcon} alt="arrow-down" className={`my-auto`} />
                </Flex>
                {
                    <Grid className={`gap-5 my-6 ${show ? 'h-auto' : 'h-0'} overflow-hidden`}>
                        <List name="Price" value={`1 ${primarySelector.token?.symbol || ""} ≈ ${simulateData?.content?.swapRate || 0.00} ${secondarySelector?.token?.symbol || ""}`} />
                        <List name="Blockchain fee" value={`${simulateData.content?.fees || 0} ${primarySelector.token?.symbol || ""}`} />
                        <List
                            name="Distribution Plan"
                            value={distributionPlan.comp}
                            className="!mb-auto !mt-0 !leading-[18px]"
                        />
                    </Grid>
                }
            </div>
            <Footer />
            <SettingModal
                active={modal === "settings" && !isDisabled}
                slippage={slippage}
                submit={(newSlippage) => setSlipage(newSlippage)}
                close={() => setModal("")}
            />
            <InfoModal active={modal === "info"} close={() => setModal("")} />
            <ProgressModal active={modal === "progress"} />
            {!isReady && <Loader className="fixed top-0 left-0" />}

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

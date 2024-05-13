"use client";
import { useEffect, useMemo, useState } from "react";
import Image, { StaticImageData } from "next/image";

import { toNano } from "@ton/core";

import { useTonConnect } from "@/hooks/useTConnect";
import { useTonWeb } from "@/hooks/useTonWeb";
import { useTonClient } from "@/hooks/useTonClient";
import useInput from "@/hooks/useInput";
import useSimulate, { ISimulateArgs } from "@/hooks/useSimulate";

import { useAccount } from "@/context/AccountProvider";

import { Flex, Grid, PageWrapper } from "@/components/wrapper";
import { MemoizedSendTokenField, MemoizedReceiveTokenField } from "@/components/Form/SwapInput";
import { PrimaryButton } from "@/components/Form/Button";
import { List } from "@/components/List";
import SettingModal from "@/components/Modal/SetttingsModal";
import { InfoModal } from "@/components/Modal/Modal";
import Footer from "@/components/Footer";
import Loader, { CircularLoader } from "@/components/Loader";

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
import { useTelegram } from "@/context/TelegramProvider";
import { limitDecimals } from "@/utils/math";

interface INavProps {
    icon: StaticImageData;
    label: string;
    click?: () => void;
    disabled?: boolean;
}

function Nav(props: INavProps) {
    return <div
        onClick={props.click}
        className={`flex w-[30px] h-[30px] bg-secondary rounded-full ${props.disabled ? "cursor-not-allowed" : "cursor-pointer "}`}
    >
        <Image className="m-auto w-[16px] h-[16px]" src={props.icon} alt={props.label} />
    </div>
}

export default function Home() {

    const { webApp } = useTelegram();
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
        loadBalances,
    } = useAccount();

    const sendInput = useInput<string>('-1');
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

    const [show, setShow] = useState(false);
    const [modal, setModal] = useState("");

    function reload() {
        if (!simulateQuery.ready || isDisabled) return;
        resetTimer();
        initSimulator(simulateQuery.query)
    }

    function swapToken() {
        if (!primarySelector.token || !secondarySelector.token) return;
        const [primary, secondary] = [primarySelector.token, secondarySelector.token];
        primarySelector.selectToken(secondary, 'swap');
        secondarySelector.selectToken(primary);
        //Set secondary balance into primary
        sendInput.handleInput(`${receiveBalance}`);
    }

    async function swap() {
        if (!provider || !client)
            return;

        if (!pool.data?.swapable) {
            alert("Tokens is not swapable");
            return;
        }

        if (primaryFieldError) {
            alert(primaryFieldError);
            return;
        }

        setModal("progress");
        try {
            if (!walletAddress || !primarySelector.token?.address || !secondarySelector?.token?.address) return;

            const { stonfi, dedust } = distributionPlan.reserved;
            const { dedustOfferAmount, stonfiOfferAmount } = splitOfferAmount({
                offerAmount: sendInput.getNumberValue(),
                dedustReserve: dedust?.reserve || 0,
                stonfiReserve: stonfi?.reserve || 0,
                decimals: primarySelector.token.decimals
            })

            const stonfi_messages = stonfiOfferAmount ? await swapWithStonfi({
                TON_PROVIDER: provider,
                SWAP_AMOUNT: stonfiOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            }) : [];

            const dedust_messages = dedustOfferAmount ? await swapWithDedust({
                TON_CLIENT: client,
                SWAP_AMOUNT: dedustOfferAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: primarySelector.token,
                JETTON1: secondarySelector.token
            }) : [];

            const fee_messages = (process.env.NEXT_PUBLIC_REFERRAL_ADDRESS && process.env.NEXT_PUBLIC_FEE) ? [{
                address: process.env.NEXT_PUBLIC_REFERRAL_ADDRESS,
                amount: toNano(process.env.NEXT_PUBLIC_FEE).toString(),
            }] : [];

            // Get user's last transaction hash using tonweb
            const lastTx = (await provider.getTransactions(walletAddress, 1))[0]
            const lastTxHash = lastTx.transaction_id.hash;

            // Send swap transactions
            const swap_messages = [...stonfi_messages, ...dedust_messages, ...fee_messages];
            await sendTransaction(swap_messages);

            // Run a loop until user's last tx hash changes
            var txHash = lastTxHash
            while (txHash == lastTxHash) {
                await sleep(1500) // some delay between API calls
                let tx = (await provider.getTransactions(walletAddress, 1))[0]
                txHash = tx.transaction_id.hash
            }
            setModal("completed");
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
            reserved = calculateReserve(pool.data.data);
            loaded = true;
        }
        const data = Object.values(reserved).sort((a, b) => b.reserve - a.reserve);
        const comp = <p
            className="max-w-[50%] flex flex-wrap justify-end text-right text-white text_14_400_Inter gap-1"
        >
            <div>
                <span className={`${data[0]?.reserve ? "" : "hidden"} text-green`}>{`${data[0]?.reserve}% `}</span>
                <span className={`${!data[0]?.reserve && loaded ? "hidden" : ""} whitespace-nowrap`}>{`${data[0]?.platform || "Ston.fi"}`}</span>
            </div>
            {!data[0]?.reserve && !data[1]?.reserve ? <span className="!text-text_primary">{"|"}</span> : <></>}
            <div>
                <span className={`${data[1]?.reserve ? "" : "hidden"} text-green`}>{`${data[1]?.reserve}% `}</span>
                <span className={`${!data[1]?.reserve && loaded ? "hidden" : ""} whitespace-nowrap `}>{`${data[1]?.platform || "Dedust.io"}`}</span>
            </div>
        </p>;

        return {
            reserved,
            comp,
            loaded
        }
    }, [pool]);

    const receiveBalance = useMemo(() => {
        const swapRate = simulateData.content?.swapRate || 0;
        if (sendInput.getNumberValue() < 0 || !sendInput.getNumberValue()) return -1;
        const askAmount = (sendInput.getNumberValue() * swapRate);
        return askAmount <= 0 ? -1 : Number.parseFloat(askAmount.toFixed(5));
    }, [simulateData, sendInput.getNumberValue()]);

    const primaryFieldError = useMemo(() => {
        const offerAmount = sendInput.getNumberValue() <= 0 ? 0 : sendInput.getNumberValue();
        const isBelowMinimum = offerAmount < 0.00000001;
        if (isBelowMinimum && offerAmount)
            return "Cannot swap amount less than 0.00000001";
        const mainBalance = getBalance(primarySelector.token?.address || "") || 0;
        const insufficient = offerAmount > mainBalance ? true : false;
        if (connectionChecked && connected && insufficient)
            return "Insufficient balance";

        return "";
    }, [connectionChecked, connected, sendInput.getNumberValue(), primarySelector.token]);

    useEffect(() => {
        if (!primarySelector.token) return;
        const value = sendInput.value
        if (value === '' || value === '-1') return;
        sendInput.handleInput(`${limitDecimals(sendInput.getNumberValue(), primarySelector.token.decimals || 9)}`);
    }, [primarySelector.token]);

    const secondaryFieldError = useMemo(() => {
        if (pool.loading || !pool.data) return "";
        return pool.data.swapable ? "" : "Token is not swapable";
    }, [pool]);

    const simulateQuery = useMemo(() => {
        const ready = (sendInput.inputEnd && (sendInput.getNumberValue() > 0) && primarySelector.token && secondarySelector.token && distributionPlan.loaded) ? true : false;
        const query: ISimulateArgs = {
            primary: primarySelector.token,
            secondary: secondarySelector.token,
            slippage: slippage.value / 100,
            amount: sendInput.getNumberValue() * Math.pow(10, primarySelector.token?.decimals || 9),
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
        return simulateData.loading || pool.loading || modal === "progress";
    }, [simulateData.loading, pool.loading || modal]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        if (primarySelector.token) return;
        primarySelector.selectToken(tokens[0]);
    }, [tokens]);

    //INITIALIZE PRIMARY SELECTOR
    useEffect(() => {
        if (!secondaryTokens.length) return;
        //Secondary tokens trigger due to swap skip update
        if (primarySelector.action === 'swap') return;
        const selectedToken = secondarySelector.token || getToken("EQCyDhcASwIm8-eVVTzMEESYAeQ7ettasfuGXUG1tkDwVJbc") || secondaryTokens[0];
        secondarySelector.selectToken(selectedToken)
    }, [secondaryTokens]);

    //RESET SIMULATOR ON INPUT ENDED
    useEffect(() => {
        if (sendInput.inputEnd) return;
        const balance = (primarySelector.token?.balance || getBalance(primarySelector.token?.address || "") || 0);
        if (sendInput.getNumberValue() === balance || primarySelector.action === "swap") {
            resetSimulator();
            sendInput.handleInputEnd(true);
            //Reset selection after disabling input it is only for direct input update
            if (primarySelector.action === "swap")
                primarySelector.selectAction('select');
        }
    }, [sendInput.inputEnd]);

    //RESET TIMER ON INPUT VALUE
    useEffect(() => {
        //if (sendInput.value !== '') return;
        resetTimer();
    }, [sendInput.value]);

    //INITIALIZE SWAP SIMULATOR FOR NEW DATA
    useEffect(() => {
        resetTimer();
        if (simulateQuery.ready && [primarySelector.selector, secondarySelector.selector].includes("none"))
            initSimulator(simulateQuery.query);
    }, [simulateQuery]);

    useEffect(() => {
        if (webApp) {
            if (primarySelector.selector !== "none") {
                webApp.BackButton.show();
                webApp.BackButton.onClick(primarySelector.toggleSelector);
                return;
            }
            if (secondarySelector.selector !== "none") {
                webApp.BackButton.show()
                webApp.BackButton.onClick(secondarySelector.toggleSelector);
                return;
            }
            webApp.BackButton.hide()
        }
    }, [webApp, primarySelector.selector, secondarySelector.selector]);

    return (
        <Flex className="h-full flex-col">
            <PageWrapper className="!overflow-y-auto">
                <Flex className="flex-col hide-scroll">
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
                            change={(value) => sendInput.handleInput(`${value}`)}
                            selectedToken={primarySelector.token}
                            toggleSelector={() => {
                                if (isDisabled) return;
                                resetSimulator();
                                primarySelector.toggleSelector()
                            }}
                            disabled={isDisabled}
                            error={primaryFieldError}
                        />
                        <Image src={SwapIcon} alt="swap" onClick={swapToken} className="w-[15px] h-[15px] mx-auto cursor-pointer" />
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
                        name={modal === "progress" ? <CircularLoader className="!w-fit m-auto" /> : "Swap"}
                        className={`my-4 ${modal === "progress" ? '!pt-3 pb-1' : ''}`}
                        click={swap}
                        disabled={isDisabled || sendInput.getNumberValue() <= 0}
                    /> : <PrimaryButton
                        name={sendInput.getNumberValue() && !connected ? "Connect & Swap" : "Connect"}
                        click={connect}
                        className="my-4"
                        disabled={isDisabled}
                    />}
                    <div className={sendInput.focused ? "" : "mb-[20px]"}>
                        <Flex className="gap-2 cursor-pointer" click={() => setShow(!show)}>
                            <span className="text_14_400_SFText text-text_primary leading-[16px]">Swap details</span>
                            {simulateData.loading ? <CircularLoader className="lds-ring-mini" /> : <img src={show ? UpIcon.src : DownIcon.src} alt="arrow-down" className={`my-auto`} />}
                        </Flex>

                        <Grid className={`gap-5 my-6 ${show ? 'h-auto' : 'h-0'} overflow-hidden`}>
                            <List name="Price" value={`${simulateData?.content?.swapRate ? "1" : ""} ${primarySelector.token?.symbol || ""} ≈ ${simulateData?.content?.swapRate ? limitDecimals(simulateData?.content?.swapRate, 9) : ""} ${secondarySelector?.token?.symbol || ""}`} />
                            {/* <List name="Blockchain fee" value={`${simulateData.content?.fees || ""} ${primarySelector.token?.symbol || ""}`} /> */}
                            <List name="Blockchain fee" value={`0.08 - 0.3 TON`} />
                            <List
                                name="Distribution Plan"
                                value={distributionPlan.comp}
                                className="!mb-auto !mt-0 !leading-[18px]"
                            />
                        </Grid>
                    </div>
                    {!isReady && <Loader className="fixed top-0 left-0" />}

                    {
                        primarySelector.selector === 'primary' && <MemoizedSearch
                            active={primarySelector.selector === 'primary'}
                            selectToken={(token) => {
                                primarySelector.selectTokenAndExit(token);
                                if (primarySelector.token?.address !== token.address)
                                    secondarySelector.selectToken(undefined);
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
            </PageWrapper>

            {sendInput.focused ? <></> : <Footer className={`z-10 mt-auto duration-50 ease-in`} />}
            <SettingModal
                active={modal === "settings" && !isDisabled}
                slippage={slippage}
                submit={(newSlippage) => setSlipage(newSlippage)}
                close={() => setModal("")}
            />
            <InfoModal
                active={modal === "completed"}
                close={() => {
                    setModal("");
                    sendInput.handleInput('-1');
                    loadBalances();
                }}
            />
        </Flex>
    );
}

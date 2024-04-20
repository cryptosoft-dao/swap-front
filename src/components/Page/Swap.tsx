"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";

import { useTonConnect } from "@/hooks/useTONConnect";
import { useAccount } from "@/context/AccountProvider";

import { Flex, Grid } from "@/components/wrapper";
import { ReceiveTokenField, SendTokenField } from "@/components/Form/SwapInput";
import { PrimaryButton } from "@/components/Form/Button";
import { List } from "@/components/List";
import SettingModal from "@/components/Modal/SetttingsModal";
import { InfoModal, ProgressModal } from "@/components/Modal/Modal";
import Footer from "@/components/Footer";

import SettingIcon from "@/assets/icons/settingicon.png";
import ReloadIcon from "@/assets/icons/reload.svg";
import SwapIcon from "@/assets/icons/swapicon.svg";
import DownIcon from "@/assets/icons/down-icon.svg";
import InfoIcon from "@/assets/icons/info.svg";

import { IContent, ISlippage, IToken } from "@/interfaces/interface";
import swapWithStonfi from "@/services/stonfi";
import swapWithDedust from "@/services/dedust";
import { ISwapDetails } from "@/interfaces/request";
import { getSwapDetails } from "@/services/swap";

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

    const { connected, connect, walletAddress } = useTonConnect();
    const account = useAccount();

    const [swapdetails, setSwapdetails] = useState<IContent<ISwapDetails | null>>({
        status: "",
        loading: false,
        content: null,
        message: ''
    })
    const [sendAmount, setSendAmount] = useState(0);
    const [slippage, setSlipage] = useState<ISlippage>({
        type: "default",
        value: 0
    });
    const [sendToken, setSendToken] = useState<IToken>(account.tokens[0]);
    const [receiveToken, setReceiveToken] = useState<IToken>(account.tokens[1]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [show, setShow] = useState(false);
    const [modal, setModal] = useState("");

    async function fetchSwapdetails() {
        if (swapdetails.loading) return;
        try {
            setSwapdetails({
                status: "",
                loading: true,
                content: null,
                message: ""
            });

            const res = await getSwapDetails({
                offer_address: sendToken.address,
                ask_address: receiveToken.address,
                unit: sendAmount * 100,
                slippage_tolerance: slippage.value / 100
            });

            if (!res.data) throw { message: "Something went wrong!" };

            setSwapdetails({
                status: "success",
                loading: false,
                content: res.data,
                message: ""
            });

        } catch (err) {
            setSwapdetails({
                status: "fail",
                loading: false,
                content: null,
                message: ""
            });
        }
    }

    async function swap() {
        alert("SWAP");
        setModal("progress");
        /*
        try {
            if (!walletAddress || !sendToken.address || !receiveToken.address) return;

            await swapWithDedust({
                SWAP_AMOUNT: `${sendAmount}`,
                SLIPPAGE: slippage.value,
                JETTON0: sendToken.address,
                JETTON1: receiveToken.address
            });
            await swapWithStonfi({
                SWAP_AMOUNT: sendAmount,
                WALLET_ADDRESS: walletAddress,
                JETTON0: sendToken.address,
                JETTON1: receiveToken.address
            });

        } catch (err) {
            alert((err as Error).message);
        }*/
        setModal("");
    }

    useEffect(() => {
        if (!slippage.value) return;
        fetchSwapdetails();
    }, [slippage]);

    const distributionPlan = useMemo(() => {
        return <p
            className="max-w-[50%] flex flex-wrap justify-end text-right text-white text_14_400_Inter gap-1"
        >{"DeDust.io >"}
            <span className="text-green">{100 - slippage.value}%</span>
            <span className={`${slippage.value ? "" : "hidden"}`}>Ston.fi</span>
            <span className={`${slippage.value ? "" : "hidden"} text-green`}>{`${slippage.value}%`}</span>
            <span>{receiveToken.symbol}</span>
        </p>;
    }, [slippage, receiveToken]);

    const receiveBalance = useMemo(() => {
        const originalBal = Number.parseFloat((sendAmount * Number.parseFloat(swapdetails.content?.swap_rate || "0")).toFixed(4));
        const fees = Number.parseFloat(swapdetails.content?.fee_percent || "0");
        return Math.round(originalBal - (originalBal * fees))
    }, [swapdetails, sendAmount]);

    useEffect(() => {
        if (!inputRef.current) return;
        function handleComplete() {
            timeoutRef.current && clearInterval(timeoutRef.current);
            setTimeout(() => {
                fetchSwapdetails();
            }, 3);
        }
        inputRef.current.addEventListener('change', handleComplete);
        return () => {
            inputRef.current?.removeEventListener('change', handleComplete);
        }
    }, []);

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
                <SendTokenField
                    inputRef={inputRef}
                    value={sendAmount}
                    balance={account.getBalance(sendToken.address)}
                    change={(value) => setSendAmount(value)}
                    tokens={account.tokens}
                    selectedToken={sendToken}
                    selectToken={(token) => setSendToken(token)}
                    readonly={swapdetails.loading}
                />
                <Image src={SwapIcon} alt="swap" className="w-[15px] h-[15px] mx-auto" />
                <ReceiveTokenField
                    inputRef={inputRef}
                    value={receiveBalance}
                    balance={receiveBalance}
                    tokens={account.tokens}
                    selectedToken={receiveToken}
                    selectToken={(token) => setReceiveToken(token)}
                    readonly={true}
                />
            </Grid>
            {connected ? <PrimaryButton
                name="Swap"
                className="my-4"
                click={swap}
                disabled={account.loading || swapdetails.loading}
            /> : <PrimaryButton
                name={sendAmount && !connected ? "Connect & Swap" : "Connect"}
                click={connect}
                className="my-4"
            />}
            <div className="mb-5">
                <Flex className="gap-2" click={() => setShow(!show)}>
                    <span className="text_14_400_SFText text-text_primary leading-[16px] cursor-pointer">Swap details</span>
                    <Image src={DownIcon} alt="arrow-down" className="my-auto" />
                </Flex>
                {
                    <Grid className={`gap-5 my-6 ${show ? 'h-auto' : 'h-0'} overflow-hidden`}>
                        <List name="Price" value={`1 ${sendToken.symbol} ≈ ${swapdetails?.content?.swap_rate || "0.00"} ${receiveToken.symbol}`} />
                        <List name="Price impact" icon={InfoIcon} value={`${swapdetails.content?.price_impact || "0.00"}%`} valueClassName="!text-red" click={() => setModal('info')} />
                        <List name="Minimum received" icon={InfoIcon} value={`~ ${Number.parseFloat(swapdetails.content?.ask_units || '0') / 100} ${receiveToken.symbol}`} />
                        <List name="Blockchain fee" value={`${Number.parseFloat(swapdetails.content?.fee_units || "0") / 100} ${sendToken.symbol}`} />
                        <List name="Your economy" value="0.00%" valueClassName="!text-green" />
                        <List
                            name="Distribution Plan"
                            value={distributionPlan}
                        />
                        <List name="Routes" value={`${sendToken.symbol} > stTON > ${receiveToken.symbol}`} />
                    </Grid>
                }
            </div>
            <Footer />
            <SettingModal
                active={modal === "settings" && !swapdetails.loading}
                slippage={slippage}
                submit={(newSlippage) => setSlipage(newSlippage)}
                close={() => setModal("")}
            />
            <InfoModal active={modal === "info"} close={() => setModal("")} />
            <ProgressModal active={modal === "progress"} />
        </Flex>
    );
}

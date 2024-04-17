"use client";
import { useState } from "react";
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

import { IToken } from "@/interfaces/interface";

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

    const { connected, connect } = useTonConnect();
    const account = useAccount();

    const [sendAmount, setSendAmount] = useState(0);
    const [sendToken, setSendToken] = useState<IToken>(account.tokens[0]);
    const [receiveToken, setReceiveToken] = useState<IToken>(account.tokens[1]);

    const [show, setShow] = useState(false);
    const [modal, setModal] = useState("");

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
                    value={sendAmount}
                    balance={sendToken.balance}
                    change={(value) => setSendAmount(value)}
                    tokens={account.tokens}
                    selectedToken={sendToken}
                    selectToken={(token) => setSendToken(token)}
                />
                <Image src={SwapIcon} alt="swap" className="w-[15px] h-[15px] mx-auto" />
                <ReceiveTokenField
                    value={Number.parseFloat((sendAmount * 2.24).toFixed(2))}
                    balance={sendAmount * 2.24 * 2.1}
                    tokens={account.tokens}
                    selectedToken={receiveToken}
                    selectToken={(token) => setReceiveToken(token)}
                    readonly={true}
                />
            </Grid>
            {connected ? <PrimaryButton
                name="Swap"
                className="my-4"
                click={() => setModal("progress")}
                disabled={account.loading}
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
                        <List name="Price" value="1 TON ≈ 2,20 USDT" />
                        <List name="Price impact" icon={InfoIcon} value="-1.31%" valueClassName="!text-red" click={() => setModal('info')} />
                        <List name="Minimum received" icon={InfoIcon} value="~ 5 USDT" />
                        <List name="Blockchain fee" value="0.08-0.3 TON" />
                        <List name="Your economy" value="0.00%" valueClassName="!text-green" />
                        <List name="Distribution Plan" value={<p className="text-right text-white text_14_400_Inter">{"DeDust.io >"} <span className="text-green">100.00%</span> TON</p>} />
                        <List name="Routes" value="TON > stTON > USDT" />
                    </Grid>
                }
            </div>
            <Footer />
            <SettingModal active={modal === "settings"} close={() => setModal("")} />
            <InfoModal active={modal === "info"} close={() => setModal("")} />
            <ProgressModal active={modal === "progress"} />
        </Flex>
    );
}

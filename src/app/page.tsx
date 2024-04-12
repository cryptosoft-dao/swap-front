"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";

import { Flex, Grid } from "@/components/wrapper";
import { ReceiveTokenField, SendTokenField } from "@/components/Form/SwapInput";
import { PrimaryButton } from "@/components/Form/Button";
import { List } from "@/components/List";
import SettingModal from "@/components/Modal/SetttingsModal";

import SettingIcon from "@/assets/icons/setting.png";
import ReloadIcon from "@/assets/icons/reload.svg";
import SwapIcon from "@/assets/icons/swap.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import InfoIcon from "@/assets/icons/info.svg";
import LogoutIcon from "@/assets/icons/logout.svg";

import { tokens } from "@/utils/tokens";

import { IToken } from "@/interfaces/interface";
import Footer from "@/components/Footer";
import { InfoModal, ProgressModal } from "@/components/Modal/Modal";

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

  const [show, setShow] = useState(false);
  const [connected, setConnected] = useState(false);
  const [modal, setModal] = useState("");

  const [sendAmount, setSendAmount] = useState(0);
  const [sendToken, setSendToken] = useState<IToken>(tokens[0]);
  const [receiveToken, setReceiveToken] = useState<IToken>(tokens[1]);

  return (
    <Flex className="flex-col h-full">
      <div className="flex justify-between">
        <h2 className=" text-white text_20_700_SFText">Swap</h2>
        <div className="grid grid-cols-4 gap-2">
          <Nav icon={SwapIcon} label="swap" />
          <Nav icon={ReloadIcon} label="reload" />
          <Nav icon={SettingIcon} label="setting" click={() => setModal("settings")} />
          <Nav icon={LogoutIcon} label="logout" />
        </div>
      </div>
      <Grid className="gap-4 mt-8">
        <SendTokenField
          value={sendAmount}
          price={sendAmount * 2.1}
          change={(value) => setSendAmount(value)}
          tokens={tokens}
          selectedToken={sendToken}
          selectToken={(token) => setSendToken(token)}
        />
        <ReceiveTokenField
          value={Number.parseFloat((sendAmount * 2.24).toFixed(2))}
          price={sendAmount * 2.24 * 2.1}
          readonly={true}
          tokens={tokens}
          selectedToken={receiveToken}
          selectToken={(token) => setReceiveToken(token)}
          error="No liquidity"
        />
      </Grid>
      {connected ? <PrimaryButton
        name="Swap"
        className="my-4"
        click={() => setModal("progress")}
      /> : <PrimaryButton
        click={() => setConnected(true)}
        name={sendAmount && !connected ? "Connect & Swap" : "Connect"}
        className="my-4"
      />}
      <div className="py-1">
        <Flex className="gap-2" click={() => setShow(!show)}>
          <span className="text_14_500_SFText text-white leading-[16px] cursor-pointer">Swap details</span>
          <Image src={ArrowUpIcon} alt="arrow-up" className="my-auto" />
        </Flex>
        {
          show && <Grid className="gap-3 my-3">
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

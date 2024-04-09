"use client";

import Image, { StaticImageData } from "next/image";

import { Flex, Grid } from "@/components/wrapper";
import { ReceiveTokenField, SendTokenField } from "@/components/Form/SwapInput";
import { PrimaryButton } from "@/components/Form/Button";
import { List } from "@/components/List";

import SettingIcon from "@/assets/icons/setting.svg";
import ReloadIcon from "@/assets/icons/reload.svg";
import SwapIcon from "@/assets/icons/swap.svg";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg";
import InfoIcon from "@/assets/icons/info.svg";
import { useState } from "react";

interface INavProps {
  icon: StaticImageData;
  label: string;
}

function Nav(props: INavProps) {
  return <div className="flex w-[30px] h-[30px] border border-border_primary rounded-full ">
    <Image className="m-auto" src={props.icon} alt={props.label} />
  </div>
}

export default function Home() {
  const [show, setShow] = useState(false);
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h2 className="text-[20px] text-white font-[700]">Swap</h2>
        <div className="grid grid-cols-3 gap-2">
          <Nav icon={SwapIcon} label="swap" />
          <Nav icon={ReloadIcon} label="reload" />
          <Nav icon={SettingIcon} label="setting" />
        </div>
      </div>
      <Grid className="gap-2 mt-8">
        <SendTokenField value={100} price={632} />
        <ReceiveTokenField value={100} price={632} />
      </Grid>
      <PrimaryButton name="Connect Wallet" className="my-3" />
      <div className="py-1">
        <Flex className="gap-2" click={() => setShow(!show)}>
          <span className="text-white text-[14px] leading-[16px] font-[500]">Swap details</span>
          <Image src={ArrowUpIcon} alt="arrow-up" className="my-auto" />
        </Flex>
        {show && <Grid className="gap-3 my-3">
          <List name="Price" value="1 TON ≈ 2,20 USDT" />
          <List name="Price impact" icon={InfoIcon} value="-1.31%" valueClassName="!text-red" />
          <List name="Minimum received" icon={InfoIcon} value="~ 5 USDT" />
          <List name="Blockchain fee" value="0.08-0.3 TON" />
          <List name="Your economy" value="0.00%" valueClassName="!text-green" />
          <List name="Distribution Plan" value={<p className="text-right text-white text_14_400_Inter">{"DeDust.io >"} <span className="text-green">100.00%</span> TON</p>} />
          <List name="Routes" value="TON > stTON > USDT" />
        </Grid>}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import { Box, Flex } from "../wrapper";
import { TokenSelector } from "./TokenSelector";
import { IToken } from "@/interfaces/interface";

interface ISwapFieldProps {
    value: number;
    balance: number;
    readonly?: boolean;
    selectedToken?: IToken;
    error?: string;
    inputRef: React.MutableRefObject<HTMLInputElement | null>;
    change?: (value: number) => void;
    toggleSelector: () => void;
    disabled?: boolean;
}

interface ITokenFieldProps extends ISwapFieldProps {
    label?: React.ReactNode;
    error?: string;
};


function SwapField(props: ISwapFieldProps) {

    return <Flex className="relative mt-4 mb-1">
        <input
            ref={props.inputRef}
            className="w-full h-fit outline-none bg-transparent text_24_600_SFText placeholder:text-text_primary leading-none text-white"
            value={props.value < 0 ? "" : props.value}
            readOnly={props.readonly}
            type="number"
            placeholder="0"
            onChange={(event) => props.change && props.change(Number.parseFloat(event.currentTarget.value))}
        />
        <TokenSelector
            selectedToken={props.selectedToken}
            toggleSelector={props.toggleSelector}
        />
    </Flex>
}

function Label(props: { label: string; className?: string; click?: () => void }) {
    return <span onClick={props.click} className={`text-text_primary text_12_400_SFText leading-none ${props.className}`}>{props.label}</span>
}

function TokenField(props: ITokenFieldProps) {
    return <Flex className="flex-col gap-2">
        <Box className={`relative w-full px-[10px] py-[10px] bg-secondary ${props.error ? "!border-red" : '!border-none'}`}>
            {props.label}
            <SwapField
                value={props.value}
                balance={props.balance}
                change={props.change}
                readonly={props.readonly}
                selectedToken={props.selectedToken}
                inputRef={props.inputRef}
                error={props.error}
                toggleSelector={props.toggleSelector}
                disabled={props.disabled}
            />
            {props.disabled && <div className="absolute top-0 left-0 w-full h-full cursor-not-allowed bg-black/10"></div>}
        </Box>
        {props.error && <Label className="!text-red" label={props.error} />}
    </Flex>
}

function SendTokenField(props: ISwapFieldProps) {

    const LabelNode = <div className="flex justify-between">
        <Label label="You Send" />
        {props.balance ? <div className="flex gap-1">
            <Label label={`${props.balance} ${props.selectedToken?.symbol || ""}`} />
            {props.balance !== props.value && <Label label="MAX" className={"!text-blue"} click={() => props.change && props.change(props.balance)} />}
        </div> : <></>}
    </div>;

    return <TokenField
        label={LabelNode}
        value={props.value}
        change={props.change}
        balance={props.balance}
        readonly={props.readonly}
        selectedToken={props.selectedToken}
        inputRef={props.inputRef}
        error={props.error}
        toggleSelector={props.toggleSelector}
        disabled={props.disabled}
    />
}

function ReceiveTokenField(props: ISwapFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const LabelNode = <div className="flex justify-between">
        <Label label="You Recieve" />
        <Label label={props.balance > 0 ? `${props.balance} ${props.selectedToken?.symbol || ""}` : ''} />
    </div>;

    return <TokenField
        inputRef={inputRef}
        label={LabelNode}
        value={props.value}
        balance={props.balance}
        readonly={props.readonly}
        selectedToken={props.selectedToken}
        error={props.error}
        toggleSelector={props.toggleSelector}
        disabled={props.disabled}
    />
}

export const MemoizedSendTokenField = React.memo(SendTokenField);
export const MemoizedReceiveTokenField = React.memo(ReceiveTokenField);

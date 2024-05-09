import React, { useMemo, useRef } from "react";
import { Box, Flex } from "../wrapper";
import { TokenSelector } from "./TokenSelector";
import { IToken } from "@/interfaces/interface";
import { convertTextToNumberInput, limitDecimals, normalizeNumber } from "@/utils/math";
import { NATIVE } from "@/utils/token";

interface ISwapFieldProps {
    value: number | string;
    balance: number;
    readonly?: boolean;
    selectedToken?: IToken;
    error?: string;
    inputRef: React.MutableRefObject<HTMLInputElement | null>;
    toggleSelector: () => void;
    disabled?: boolean;
    change?: (value: string | number) => void;
    type?: string;
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
            value={Number(props.value) < 0 ? "" : props.value}
            readOnly={props.readonly}
            type={props.type || "number"}
            placeholder="0"
            step={"0.01"}
            onChange={(event) => {
                if (!props.change) return;
                let value = convertTextToNumberInput(event.currentTarget.value);
                props.change(value);
            }}
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
        <Box className={`relative w-full px-[10px] py-[10px] bg-secondary ${props.error ? "!border-red" : 'border-transparent'}`}>
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
                type={props.type}
            />
            {props.disabled && <div className="absolute top-0 left-0 z-10 w-full h-full cursor-not-allowed bg-black/10"></div>}
        </Box>
        {props.error && <Label className={`!text-red`} label={props.error} />}
    </Flex>
}

function SendTokenField(props: ISwapFieldProps) {

    const LabelNode = <div className="flex justify-between">
        <Label label="You Send" />
        {props.balance ? <div className="flex gap-1">
            <Label label={`${props.balance} ${props.selectedToken?.symbol || ""}`} />
            {props.balance !== props.value && <Label label="MAX" className={"!text-blue cursor-pointer"} click={() => {
                if (props.change) {
                    const normalizeBal = normalizeNumber(props.balance);
                    props.change(normalizeBal);
                }
            }} />}
        </div> : <></>}
    </div>;

    const value = useMemo(() => {
        const amount = Number.parseFloat(`${props.value || -1}`);
        if (props.selectedToken?.type === NATIVE && amount === props.balance) {
            const fee = (process.env.NEXT_PUBLIC_TON_FEE || 0) as number;
            return limitDecimals(amount - fee, props.selectedToken?.decimals || 9);
        } else {
            return props.value;
        }
    }, [props.value]);

    return <TokenField
        label={LabelNode}
        value={value}
        change={props.change}
        balance={props.balance}
        readonly={props.readonly}
        selectedToken={props.selectedToken}
        inputRef={props.inputRef}
        error={props.error}
        toggleSelector={props.toggleSelector}
        disabled={props.disabled}
        type="text"
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
        balance={normalizeNumber(props.balance)}
        readonly={props.readonly}
        selectedToken={props.selectedToken}
        error={props.error}
        toggleSelector={props.toggleSelector}
        disabled={props.disabled}
    />
}

export const MemoizedSendTokenField = React.memo(SendTokenField);
export const MemoizedReceiveTokenField = React.memo(ReceiveTokenField);

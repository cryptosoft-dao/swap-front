import { useEffect, useRef } from "react";
import { Box, Flex } from "../wrapper";
import { TokenSelector } from "./TokenSelector";
import { IToken } from "@/interfaces/interface";

interface ISwapFieldProps {
    value: number;
    balance: number;
    change?: (value: number) => void;
    readonly?: boolean;
    tokens: IToken[];
    selectedToken: IToken;
    selectToken: (token: IToken) => void;
    error?: string;
    inputRef: React.MutableRefObject<HTMLInputElement | null>;
}

interface ITokenFieldProps extends ISwapFieldProps {
    label?: React.ReactNode;
    error?: string;
};


function SwapField(props: ISwapFieldProps) {

    return <Flex className="mt-4 mb-1">
        <input
            ref={props.inputRef}
            className="w-full h-fit outline-none bg-transparent text_24_600_SFText placeholder:text-text_primary leading-none text-white"
            value={!props.value ? "" : props.value}
            readOnly={props.readonly}
            type="number"
            placeholder="0"
            onChange={(event) => props.change && props.change(Number.parseFloat(event.currentTarget.value))}
        />
        <TokenSelector
            tokens={props.tokens}
            selectedToken={props.selectedToken}
            selectToken={props.selectToken}
        />
    </Flex>
}

function Label(props: { label: string; className?: string }) {
    return <span className={`text-text_primary text_12_400_SFText leading-none ${props.className}`}>{props.label}</span>
}

function TokenField(props: ITokenFieldProps) {
    return <Flex className="flex-col gap-2">
        <Box className={`w-full px-[10px] py-[10px] bg-secondary ${props.error ? "!border-red" : '!border-none'}`}>
            {props.label}
            <SwapField
                value={props.value}
                balance={props.balance}
                change={props.change}
                readonly={props.readonly}
                tokens={props.tokens}
                selectToken={props.selectToken}
                selectedToken={props.selectedToken}
                inputRef={props.inputRef}
                error={props.error}
            />
        </Box>
        {props.error && <Label className="!text-red" label={props.error} />}
    </Flex>
}

export function SendTokenField(props: ISwapFieldProps) {

    const LabelNode = <div className="flex justify-between">
        <Label label="You Send" />
        {props.balance ? <div className="flex gap-1">
            <Label label={`${props.balance} ${props.selectedToken.symbol}`} />
            <Label label="MAX" className={"!text-blue"} />
        </div> : <></>}
    </div>;

    return <TokenField
        label={LabelNode}
        value={props.value}
        change={props.change}
        balance={props.balance}
        readonly={props.readonly}
        tokens={props.tokens}
        selectToken={props.selectToken}
        selectedToken={props.selectedToken}
        inputRef={props.inputRef}
        error={props.error}
    />
}

export function ReceiveTokenField(props: ISwapFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const LabelNode = <div className="flex justify-between">
        <Label label="You Recieve" />
        <Label label={props.balance ? `${props.balance} ${props.selectedToken.name}` : ''} />
    </div>;

    return <TokenField
        inputRef={inputRef}
        label={LabelNode}
        value={props.value}
        balance={props.balance}
        readonly={props.readonly}
        tokens={props.tokens}
        selectToken={props.selectToken}
        selectedToken={props.selectedToken}
        error={props.error}
    />
}

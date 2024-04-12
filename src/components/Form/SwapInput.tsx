import { tokens } from "@/utils/tokens";
import { Box, Flex } from "../wrapper";
import { TokenSelector } from "./TokenSelector";
import { IToken } from "@/interfaces/interface";

interface ISwapFieldProps {
    value: number;
    price: number;
    change?: (value: number) => void;
    readonly?: boolean;
    tokens: IToken[];
    selectedToken: IToken;
    selectToken: (token: IToken) => void;
    error?: string;
}

interface ITokenFieldProps extends ISwapFieldProps {
    label?: React.ReactNode;
    error?: string;
};

export function SwapField(props: ISwapFieldProps) {
    return <Box className={`flex px-[6px] py-[9px] ${props.error ? "!border-red" : ""}`}>
        <div className="w-full flex pl-2 pr-4 border-r border-border_primary">
            <input
                className="w-full outline-none bg-transparent text_24_600_SFText text-white"
                value={!props.value ? "" : props.value}
                readOnly={props.readonly}
                type="number"
                onChange={(event) => props.change && props.change(Number.parseFloat(event.currentTarget.value))}
            />
            <span className="text-text_primary my-auto text_14_500_SFText">{`≈$${isNaN(props.price) || !props.price ? "0" : props.price.toFixed(3)}`}</span>
        </div>
        <TokenSelector
            tokens={props.tokens}
            selectedToken={props.selectedToken}
            selectToken={props.selectToken}
        />
    </Box>
}

function Label(props: { label: string; className?: string }) {
    return <span className={`text-text_primary text_12_500_SFText leading-none ${props.className}`}>{props.label}</span>
}

function TokenField(props: ITokenFieldProps) {
    return <Flex className="flex-col gap-2">
        {props.label}
        <SwapField
            value={props.value}
            price={props.price}
            change={props.change}
            readonly={props.readonly}
            tokens={props.tokens}
            selectToken={props.selectToken}
            selectedToken={props.selectedToken}
            error={props.error}
        />
        {props.error && <Label className="!text-red" label={props.error} />}
    </Flex>
}

export function SendTokenField(props: ISwapFieldProps) {

    const LabelNode = <div className="flex justify-between">
        <Label label="You Send" />
        <div className="flex gap-1">
            <Label label="Balance: 654 TON " />
            <Label label="MAX" className={"!text-blue"} />
        </div>
    </div>;

    return <TokenField
        label={LabelNode}
        value={props.value}
        change={props.change}
        price={props.price}
        readonly={props.readonly}
        tokens={props.tokens}
        selectToken={props.selectToken}
        selectedToken={props.selectedToken}
        error={props.error}
    />
}

export function ReceiveTokenField(props: ISwapFieldProps) {
    const LabelNode = <div className="flex justify-between">
        <Label label="You Recieve" />
        <Label label="Balance: 0 USDT" />
    </div>;

    return <TokenField
        label={LabelNode}
        value={props.value}
        price={props.price}
        readonly={props.readonly}
        tokens={props.tokens}
        selectToken={props.selectToken}
        selectedToken={props.selectedToken}
        error={props.error}
    />
}

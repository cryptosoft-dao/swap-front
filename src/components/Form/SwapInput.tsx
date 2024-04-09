import { Box } from "../wrapper";

interface ISwapFieldProps {
    value: number;
    price: number;
    readonly?: boolean;
}

interface ITokenFieldProps extends ISwapFieldProps {
    label?: React.ReactNode;
    error?: string;
};

export function SwapField(props: ISwapFieldProps) {
    return <Box className="flex px-[6px] py-[9px] my-2">
        <div className="w-full flex pl-2 pr-4 border-r border-border_primary">
            <input className="w-full outline-none bg-transparent font-[600] text-2xl text-white" value={props.value} readOnly={props.readonly} />
            <span className="text-text_primary my-auto text-[14px] font-[500]">{`~$${props.price}`}</span>
        </div>
    </Box>
}

function Label(props: { label: string; className?: string }) {
    return <span className={`text-text_primary text-[12px] font-[500] ${props.className}`}>{props.label}</span>
}

function TokenField(props: ITokenFieldProps) {
    return <div className="w-full">
        {props.label}
        <SwapField
            value={props.value}
            price={props.price}
            readonly={props.readonly}
        />
    </div>
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
        price={props.price}
        readonly={props.readonly}
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
    />
}
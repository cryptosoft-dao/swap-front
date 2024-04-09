interface IWrapperProps extends React.PropsWithChildren {
    className?: string;
    click?: () => void;
}
export function PageWrapper(props: IWrapperProps) {
    return <div className={`w-full p-6 max-w-[480px] bg-primary ${props.className || ""}`}>
        {props.children}
    </div>
}

export function Box(props: IWrapperProps) {
    return <div className={`w-full border border-border_primary rounded-[10px] ${props.className || ""}`}>
        {props.children}
    </div>
}

export function Flex(props: IWrapperProps) {
    return <div
        className={`flex w-full ${props.className || ""}`}
        onClick={props.click}
    >
        {props.children}
    </div>
}

export function Grid(props: IWrapperProps) {
    return <div
        className={`grid w-full ${props.className || ""}`}
        onClick={props.click}
    >
        {props.children}
    </div>
}
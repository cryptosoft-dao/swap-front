interface IModalBoxProps extends React.PropsWithChildren {
    active: boolean;
    styles?: string;
}

export function ModalWrapper(props: IModalBoxProps) {
    return <div className={`${props.active ? "flex" : "hidden"} w-full h-full absolute top-0 left-0 bg-[#00000080] z-100 overflow-hidden`}>
        {props.children}
    </div>
}

export function ModalBox(props: IModalBoxProps) {
    return <ModalWrapper active={props.active} >
        <div className={`w-full max-w-[400px] mt-auto mx-auto rounded-tl-[20px] rounded-tr-[20px] bg-primary ${props.active ? "slideUpModal" : "translate-y-[100%] duration-75 ease-in"} ${props.styles}`}>
            {props.children}
        </div>
    </ModalWrapper>
}

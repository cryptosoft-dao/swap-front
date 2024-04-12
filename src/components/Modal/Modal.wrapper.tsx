import Image from "next/image";
import { Flex } from "@/components/wrapper";

import CloseIcon from "@/assets/icons/close.svg";

interface IModalBoxProps extends React.PropsWithChildren {
    active: boolean;
    styles?: string;
}

interface IModalHeadProps {
    heading: string;
    close: () => void;
}

interface IModalBodyProps extends IModalHeadProps, React.PropsWithChildren {
    className?: string;
    subheading?: string;
    description?: string;
}

export function ModalWrapper(props: IModalBoxProps) {
    return <div className={`${props.active ? "flex" : "hidden"} w-full h-full absolute top-0 left-0 bg-[#00000070] z-100 overflow-hidden`}>
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

export function ModalHead(props: IModalHeadProps) {
    return <Flex className="justify-between mb-5">
        <span className="text-white text_20_700_SFText">{props.heading}</span>
        <Image onClick={props.close} src={CloseIcon} alt="settings" className='my-auto cursor-pointer' />
    </Flex>
}


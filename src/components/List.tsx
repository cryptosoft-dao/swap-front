import Image, { StaticImageData } from "next/image";
import { Flex } from "./wrapper";

interface ILabelProps {
    name: string;
    icon?: StaticImageData;
    click?:() => void;
    className?:string;
}

interface IListProps extends ILabelProps, React.PropsWithChildren {
    value: React.ReactNode | string;
    valueClassName?: string;
    hide?:boolean;
}

function ListWrapper(props: React.PropsWithChildren) {
    return <Flex className="justify-between text-[12px]">
        {props.children}
    </Flex>
}

export function Label(props: ILabelProps) {
    return <Flex className={`!w-fit gap-1 my-auto cursor-pointer ${props.className}`} click={props.click}>
        <span className={`my-auto text_14_400_SFText text-text_primary leading-none whitespace-nowrap ${props.className}`}>{props.name}</span>
        {props.icon && <Image src={props.icon} alt="chain" className="my-auto" />}
    </Flex>
}

export function List(props: IListProps) {
    return <ListWrapper>
        <Label className={props.className} name={props.name} icon={props.icon} click={props.click} />
        {typeof props.value === "string" ? <span className={`text-right leading-none text-white text_14_400_SFText whitespace-nowrap ${props.valueClassName}`}>{props.value}</span> : props.value}
    </ListWrapper>
}

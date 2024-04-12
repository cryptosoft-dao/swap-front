import Image, { StaticImageData } from "next/image";
import { Grid, Flex } from "./wrapper";

interface ILabelProps {
    name: string;
    icon?: StaticImageData;
    click?:() => void;
}

interface IListProps extends ILabelProps, React.PropsWithChildren {
    value: React.ReactNode | string;
    valueClassName?: string;
}

function ListWrapper(props: React.PropsWithChildren) {
    return <Grid className="w-full grid-cols-2 text-[12px]">
        {props.children}
    </Grid>
}

export function Label(props: ILabelProps) {
    return <Flex className="gap-1 my-auto cursor-pointer" click={props.click}>
        <span className="my-auto text_14_500_Inter text-text_primary">{props.name}</span>
        {props.icon && <Image src={props.icon} alt="chain" className="my-auto" />}
    </Flex>
}

export function List(props: IListProps) {
    return <ListWrapper>
        <Label name={props.name} icon={props.icon} click={props.click} />
        {typeof props.value === "string" ? <span className={`text-right text-white text_14_400_Inter ${props.valueClassName}`}>{props.value}</span> : props.value}
    </ListWrapper>
}

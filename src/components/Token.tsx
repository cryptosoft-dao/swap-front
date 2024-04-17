import Image, { StaticImageData } from "next/image";
import { Box, Flex } from "@/components/wrapper";

import ArrowRightIcon from "@/assets/icons/right-arrow.svg";

import { IToken } from "@/interfaces/interface";

interface ITokenProps {
    token: IToken;
    select: () => void;
}

function TokenIcon(props: { icon: StaticImageData; name: string; }) {
    return <Image className="my-auto w-[24px] h-[24px]" src={props.icon} alt={props.name} />
}

function TokenName(props: { name: string }) {
    return <span className="text_14_400_SFText text-white leading-none my-auto">{props.name}</span>
}

export function SuggestedToken(props: ITokenProps) {
    return <Box className="!w-fit flex p-2 cursor-pointer" click={props.select}>
        <Flex className="!w-fit m-auto gap-2">
            <TokenIcon icon={props.token.icon} name={props.token.name} />
            <TokenName name={props.token.name} />
        </Flex>
    </Box>
}

export function ListToken(props: ITokenProps) {
    return <Flex className="justify-between cursor-pointer" click={props.select}>
        <Flex className="!w-fit gap-4">
            <TokenIcon icon={props.token.icon} name={props.token.name} />
            <TokenName name={props.token.name} />
        </Flex>
        <Flex className="!w-fit gap-2">
            <span className={`text_14_400_SFText leading-none text-text_primary my-auto ${props.token.balance ? "" : "hidden"}`}>{props.token.balance}{" "}{props.token.name}</span>
            <Image className="my-auto" src={ArrowRightIcon} alt={"arrow-right"} />
        </Flex>
    </Flex>
}

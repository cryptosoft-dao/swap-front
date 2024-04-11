import Image from "next/image";
import { Flex } from "@/components/wrapper";

import { IToken } from "@/interfaces/interface";

import ArrowUp from "@/assets/icons/down.svg";
import { useState } from "react";

interface ISelectorProps {
    selectedToken: IToken;
    selectToken: (token: IToken) => void;
    tokens: IToken[];
}

export function TokenSelector(props: ISelectorProps) {
    const [show, setShow] = useState(false);
    return <div className="relative !w-[150px] my-auto px-2">
        <Flex className="!w-fit ml-auto" click={() => setShow(!show)}>
            <Image width={24} height={24} className="!w-[24px] !h-[24px]" src={props.selectedToken.icon} alt={props.selectedToken.name} />
            <Flex className="!w-full gap-2 ml-2 my-auto">
                <span className="block text_14_500_SFText leading-none text-white my-auto">{props.selectedToken.name}</span>
                <Image src={ArrowUp} alt="down" className="min-w-[4px] my-auto" />
            </Flex>
        </Flex>
        {
            show && <div className="absolute z-10 rounded-[10px] shadow-md w-full bg-primary">
                {props.tokens.map((token, index) => {
                    return <Flex 
                    key={index} 
                    className={`gap-2 p-2 ${props.selectedToken.name === token.name ? "opacity-60":""}`} 
                    click={() => {
                        props.selectToken(token);
                        setShow(false);
                    }}>
                        <Image width={24} height={24} className="!w-[24px] !h-[24px]" src={token.icon} alt={token.name} />
                        <span className="block text_14_500_SFText text-white my-auto">{token.name}</span>
                    </Flex>
                })}

            </div>
        }
    </div>
}

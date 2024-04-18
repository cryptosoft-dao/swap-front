import Image from "next/image";
import { Flex } from "./wrapper";

import { useTonConnect } from "@/hooks/useTONConnect";

import UserIcon from "@/assets/icons/user-icon.svg";
import LogoutIcon from "@/assets/icons/logout-icon.svg";


export default function Footer(props:{className?:string}) {

    const { connected, disconnect } = useTonConnect();

    return <Flex className={`cursor-pointer py-5 mt-auto border-t border-border_primary justify-between ${props.className}`}>
        <Flex className="!w-fit gap-2">
            <Image src={UserIcon} alt="user" />
            <span className="text-text_primary text_14_400_SFText">Community & Support</span>
        </Flex>
        <Flex
            className={`!w-fit gap-2 cursor-pointer ${connected ? '' : '!hidden'}`}
            click={disconnect}
        >
            <Image src={LogoutIcon} alt="logout" />
            <span className="text-text_primary text_14_400_SFText">Disconnect</span>
        </Flex>
    </Flex>
}

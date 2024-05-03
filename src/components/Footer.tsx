import Image from "next/image";
import { Flex } from "./wrapper";

import { useTonConnect } from "@/hooks/useTConnect";

import UserIcon from "@/assets/icons/user-icon.svg";
import LogoutIcon from "@/assets/icons/logout-icon.svg";
import FooterTon from "@/assets/icons/footerTon.svg";

export default function Footer(props: { hide?:boolean; className?: string }) {

    const { connected, disconnect } = useTonConnect();

    return <div className="w-full mt-auto">
        <Flex className={`cursor-pointer ${props.hide? "border-t py-5":"border-b  p-5"} border-border_primary justify-between ${props.className}`}>
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
        {!props.hide && <Flex className={`cursor-pointer p-5 justify-between ${props.className}`}>
            <Flex className="!w-fit gap-2">
                <span className="text-text_primary text_12_400_SFText my-auto">Based on TON</span>
                <Image src={FooterTon} alt="ton" />
            </Flex>
            <span className="text-text_primary text_12_400_SFText my-auto">Cryptosoft x Lucky TON</span>
        </Flex> } 
    </div>
}

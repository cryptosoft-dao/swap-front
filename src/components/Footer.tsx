import Image from "next/image";
import { Flex } from "./wrapper";

import { useTonConnect } from "@/hooks/useTConnect";

import UserIcon from "@/assets/icons/user-icon.svg";
import LogoutIcon from "@/assets/icons/logout-icon.svg";
import FooterTon from "@/assets/icons/footerTon.svg";

export default function Footer(props: { hide?: boolean; className?: string }) {

    const { connected, disconnect } = useTonConnect();

    return <div className={`w-full max-w-[390px] bg-primary ${props.className}`}>
        <Flex className={`cursor-pointer ${props.hide ? "border-t py-5" : "border-b  p-5"} border-border_primary justify-between`}>
            <Flex className="!w-fit gap-2">
                <Image src={UserIcon} alt="user" />
                <span className="text-text_primary cursor-pointer text_14_400_SFText"><a href={process.env.NEXT_PUBLIC_CRYPTO_SOFT}>Community & Support</a></span>
            </Flex>
            <Flex
                className={`!w-fit gap-2 cursor-pointer ${connected ? '' : '!hidden'}`}
                click={disconnect}
            >
                <Image src={LogoutIcon} alt="logout" />
                <span className="text-text_primary text_14_400_SFText">Disconnect</span>
            </Flex>
        </Flex>
        {!props.hide && <Flex className={`cursor-pointer p-5 justify-between`}>
            <Flex className="!w-fit gap-2">
                <span className="text-text_primary leading-none text_12_400_SFText my-auto">
                    <a className="cursor-pointer m-0 leading-none" href={process.env.NEXT_PUBLIC_TON_ORG}>Based on TON</a>
                </span>
                <Image src={FooterTon} alt="ton" />
            </Flex>
            <p className="flex gap-1 text-text_primary text_12_400_SFText my-auto">
                <a className="cursor-pointer" href={process.env.NEXT_PUBLIC_CRYPTO_SOFT}>Cryptosoft</a>
                <span className="cursor-pointer">x</span>
                <a className="cursor-pointer" href={process.env.NEXT_PUBLIC_LUCKY_TON}>Lucky TON</a>
            </p>
        </Flex>}
    </div>
}

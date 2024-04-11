import Image from "next/image";
import { Flex } from "./wrapper";

import UserIcon from "@/assets/icons/User.svg";

export default function Footer() {
    return <div className="py-4 mt-auto border-t border-border_primary">
        <Flex className="!w-fit mx-auto gap-2">
            <Image src={UserIcon} alt="user" />
            <span className="text-white text_14_700_SFText">Community & Support</span>
        </Flex>
        <span className="block w-fit text_12_500_SFText text-text_primary mx-auto my-3">© 2024 Cryptosoft</span>
    </div>
}
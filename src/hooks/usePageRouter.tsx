//ONLY WORKS FOR APP ROUTER
import { useRouter } from "next/navigation";

import pageLinks from "@/utils/page.links";

type IVoidFunc = () => void;

export default function usePageRouter(): {
    gotoHome: IVoidFunc;
    back: IVoidFunc;
} {
    const router = useRouter();

    function goto(path: string) {
        router.push(path);
    }

    return {
        gotoHome: () => goto(pageLinks.home),
        back: router.back
    }
}
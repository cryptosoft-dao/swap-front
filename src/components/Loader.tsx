import Image from "next/image";
import RocketIcon from "@/assets/icons/AnimatedRocket.gif";

export default function Loader(props: { className?: string }) {
    return <div className={`flex z-10 w-full h-full bg-primary ${props.className}`}>
        <Image
            width={150}
            src={RocketIcon}
            alt="rocket"
            className="m-auto"
        />
    </div>
}

export function CircularLoader(props: { className?: string }) {
    return <div className={`lds-ring ${props.className}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
}

export function SkeletonLoader(props: { styles?: string }) {
    return <div className={`skeleton-loading rounded-[5px] ${props.styles}`}>
    </div>
}

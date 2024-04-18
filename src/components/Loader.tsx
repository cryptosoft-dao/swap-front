import Image from "next/image";
import RocketIcon from "@/assets/icons/rocket.png";

export default function Loader() {
    return <div className="flex z-10 w-full h-full bg-primary">
        <Image
            src={RocketIcon}
            alt="rocket"
            className="m-auto"
        />
    </div>
}

export function CircularLoader(props: { className?: string }) {
    return <div className={`lds-ring ${props.className}`}><div></div><div></div><div></div><div></div></div>
}
import Image from "next/image";
import RocketIcon from "@/assets/icons/rocket.png";

export default function Loader() {
    return <div className="flex absolute top-0 left-0 z-10 w-full h-full bg-primary">
        <Image
            src={RocketIcon}
            alt="rocket"
            className="m-auto"
        />
    </div>
}
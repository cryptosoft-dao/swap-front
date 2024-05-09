import { Blocks } from "react-loader-spinner";

export default function Loader(props: { className?: string }) {
    return <div className={`flex z-20 w-full h-full bg-primary ${props.className}`}>
       
        <Blocks
            height="150"
            width="150"
            color="#2752E7"
            ariaLabel="blocks-loading"
            wrapperStyle={{
                margin:"auto",
            }}
            wrapperClass="blocks-wrapper"
            visible={true}
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

import { useRef, useEffect } from "react";

export default function useInfiniteScroll(onEnd: () => void): {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
} {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        //setup scroll event
        const handleScroll = () => {
            const isEndReached = (container.clientHeight + container.scrollTop) >= container.scrollHeight - 10;
            if (isEndReached) {
                onEnd();
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return {
        containerRef
    }
}
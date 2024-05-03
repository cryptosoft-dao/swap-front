import { useRef, useEffect } from "react";

export default function useInfiniteScroll(onEnd: () => void): {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    secondaryRef: React.MutableRefObject<HTMLDivElement | null>;
} {
    const secondaryRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isStarted = useRef(false);
    const startY = useRef(0);
    const startScrollTop = useRef(0);

    useEffect(() => {
        const container = containerRef.current;
        const secondary = secondaryRef.current;
        if (!container) return;
        //setup scroll event
        const handleScroll = () => {
            const isEndReached = (container.clientHeight + container.scrollTop) >= container.scrollHeight - 10;
            if (isEndReached) {
                onEnd();
            }
        };

        container.addEventListener("scroll", handleScroll);

        if (!secondary) return;

        function disableStart() {
            isStarted.current = false;
        }

        function handleTouchStart(e: any) {
            if (!secondary || !container) return;
            isStarted.current = true;
            startY.current = e.touches[0].clientY;
            startScrollTop.current = container.scrollTop;
        }

        function handleTouchMove(e: any) {
            if (!secondary || !container) return;
            if (isStarted.current) {
                const deltaY = e.touches[0].clientY - startY.current;
                container.scrollTop = startScrollTop.current + deltaY * 2;
            }
        }

        secondary.addEventListener('touchstart', handleTouchStart);
        secondary.addEventListener('touchmove', handleTouchMove);
        secondary.addEventListener('touchend', disableStart);

        return () => {
            container.removeEventListener("scroll", handleScroll);
            secondary.removeEventListener('touchstart', handleTouchStart);
            secondary.removeEventListener('touchmove', handleTouchMove);
            secondary.removeEventListener('touchend', disableStart);
        };

    }, []);

    return {
        containerRef,
        secondaryRef
    }
}

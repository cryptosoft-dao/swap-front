import { useRef, useState, useEffect, useMemo } from "react";

export default function useInput<T>(initialValue: T) {

    const [value, setValue] = useState<T>(initialValue);
    const [inputEnd, setInputEnd] = useState(true);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    function handleInput(newValue: T) {
        setValue(newValue);
    }

    //Reset
    useEffect(() => {
        if (inputEnd === false || !value) return;
        setInputEnd(false);
    }, [value]);

    useEffect(() => {
        if (!inputRef.current) return;
        function handleComplete() {
            timeoutRef.current && clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setInputEnd(true), 900);
        }
        inputRef.current.addEventListener('input', handleComplete);
        return () => {
            inputRef.current?.removeEventListener('input', handleComplete);
        }
    }, []);

    useEffect(() => {
        console.log(`Input: ${inputEnd ? "Ended" : "NOT ENDED"}`);
    }, [inputEnd]);

    const memoized = useMemo(() => {
        return {
            value,
            inputEnd,
            handleInput,
            ref: inputRef
        }
    }, [value, inputEnd, handleInput, inputRef])

    return memoized;
}
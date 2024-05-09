import { useRef, useState, useEffect, useMemo } from "react";

export default function useInput<T>(initialValue: T, initialTimeoutMS?: number) {

    const [value, setValue] = useState<T>(initialValue);
    const [inputEnd, setInputEnd] = useState(true);
    const [focused, setFocused] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    function handleInput(newValue: T) {
        setValue(newValue);
    }

    function handleInputEnd(end: boolean) {
        setInputEnd(end);
    }

    function getNumberValue(): number {
        return Number.parseFloat(`${value}`);
    }

    //Reset
    useEffect(() => {
        if (value === '' || value === '-1') return;
        setInputEnd(false);
    }, [value]);

    useEffect(() => {
        if (!inputRef.current) return;
        function handleFocusIn() {
            setFocused(true);
        };

        function handleFocusOut() {
            setFocused(false);
        };
        function handleComplete() {
            timeoutRef.current && clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setInputEnd(true), initialTimeoutMS || 900);
            if (inputRef.current) {
                inputRef.current.autofocus = false;
                handleFocusOut();
            }
        }
        inputRef.current.addEventListener('input', handleComplete);
        inputRef.current.addEventListener('focusin', handleFocusIn);
        inputRef.current.addEventListener('focusout', handleFocusOut);
        return () => {
            inputRef.current?.removeEventListener('input', handleComplete);
            inputRef.current?.removeEventListener('focusin', handleFocusIn);
            inputRef.current?.removeEventListener('focusout', handleFocusOut);
        }
    }, []);

    const memoized = useMemo(() => {
        return {
            value,
            inputEnd,
            focused,
            getNumberValue,
            handleInput,
            handleInputEnd,
            ref: inputRef
        }
    }, [value, inputEnd, handleInput, inputRef])

    return memoized;
}

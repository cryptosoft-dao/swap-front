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

    function toggleFocus() {
        if (!inputRef.current) return;
        if (inputRef.current.autofocus){
            setFocused(false);
            inputRef.current.autofocus = true;
        }
    }

    function handleInputEnd(end: boolean) {
        setInputEnd(end);
    }

    function getNumberValue(): number {
        return Number.parseFloat(`${value}`);
    }

    //RESET
    useEffect(() => {
        if (value === '' || value === '-1') return;
        setInputEnd(false);
    }, [value]);

    useEffect(() => {
        console.log(focused);
    }, [focused]);

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
            timeoutRef.current = setTimeout(() => {
                setInputEnd(true);
                //toggleFocus()
            }, initialTimeoutMS || 900);
        }
        inputRef.current.addEventListener('input', handleComplete);
        inputRef.current.addEventListener('focus', handleFocusIn);
        inputRef.current.addEventListener('blur', handleFocusOut);
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
            toggleFocus,
            ref: inputRef
        }
    }, [value, inputEnd, handleInput, inputRef])

    return memoized;
}

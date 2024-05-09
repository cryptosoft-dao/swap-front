import { IToken, ITokenSelectorHook, Selector, Action } from "@/interfaces/interface";
import { NATIVE } from "@/utils/token";
import { useRef, useState } from "react";

export default function useTokenSelector(initialSelector: Selector, initialToken?: IToken): ITokenSelectorHook {
    const [selector, setSelector] = useState<Selector>('none');
    const [token, setToken] = useState<IToken | undefined>(initialToken);
    const actionRef = useRef<'select' | 'swap'>('select');

    function toggleSelector(cSelector?: Selector) {
        const newSelector: Selector = selector === initialSelector ? 'none' : initialSelector;
        setSelector(cSelector || newSelector);
    }

    function selectTokenAndExit(token: IToken) {
        selector !== "none" && toggleSelector();
        actionRef.current = 'select';
        selectToken(token);
    }

    function selectAction(action: Action) {
        actionRef.current = action;
    }

    function selectToken(token?: IToken, action?: Action) {
        actionRef.current = action || 'select';
        setToken(token);
    }

    const isNative = () => token?.type === NATIVE;
    
    return {
        token,
        action: actionRef.current,
        selectAction,
        selectToken,
        selectTokenAndExit,
        selector,
        toggleSelector,
        isNative
    }
}

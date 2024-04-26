import { IToken, ITokenSelectorHook, Selector } from "@/interfaces/interface";
import { useState } from "react";

export default function useTokenSelector(initialSelector: Selector, initialToken?: IToken): ITokenSelectorHook {
    const [selector, setSelector] = useState<Selector>('none');
    const [token, setToken] = useState<IToken | undefined>(initialToken);

    function toggleSelector() {
        const newSelector: Selector = selector === initialSelector ? 'none' : initialSelector;
        setSelector(newSelector);
    }

    const selectToken = (token?: IToken) => setToken(token);

    return {
        token,
        selectToken,
        selector,
        toggleSelector
    }
}

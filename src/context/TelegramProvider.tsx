import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Script from "next/script";

import type { ITelegramUser, IWebApp } from "@/interfaces/telegram";
export interface ITelegramContext {
    webApp?: IWebApp;
    user?: ITelegramUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = (props: React.PropsWithChildren) => {

    const [webApp, setWebApp] = useState<IWebApp | null>(null);
    useEffect(() => {
        const app = (window as any).Telegram?.WebApp;
        if (app) {
            app.ready();
            app.expand();
            setWebApp(app);
        }
    }, []);

    const value = useMemo(() => {
        return webApp
            ? {
                webApp,
                user: webApp.initDataUnsafe.user
            }
            : {};
    }, [webApp]);

    return (
        <TelegramContext.Provider value={value}>
            <Script
                src="/telegram-webapp.js"
                strategy="beforeInteractive"
            />
            {props.children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => useContext(TelegramContext);


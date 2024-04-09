import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Script from "next/script";

import usePageRouter from "@/hooks/usePageRouter";

import type { ITelegramUser, IWebApp } from "@/interfaces/telegram";

export interface ITelegramContext {
    webApp?: IWebApp;
    user?: ITelegramUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = (props: React.PropsWithChildren) => {

    const pageRouter = usePageRouter();
    const [webApp, setWebApp] = useState<IWebApp | null>(null);
    useEffect(() => {
        const app = (window as any).Telegram?.WebApp;
        if (app) {
            app.ready();
            app.expand();
            app.BackButton.show();
            app.BackButton.onClick(pageRouter.back)
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
                src="/telegram-web-app.js"
                strategy="beforeInteractive"
            />
            {props.children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => useContext(TelegramContext);


"use client"
import Script from "next/script";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TelegramProvider } from "@/context/TelegramProvider"
import { AccountProvider } from "@/context/AccountProvider";

import "./fonts.css";
import "./globals.css";

const manifestUrl =
  "https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <head>
        <Script
          id="load_manager"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=G-7T57XV694E`}
        />
        <Script id="load_analytics" strategy="lazyOnload">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7T57XV694E');
         `}
        </Script>

        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>

        <TelegramProvider>
          <TonConnectUIProvider manifestUrl={manifestUrl}>
            <AccountProvider>
              {children}
            </AccountProvider>
          </TonConnectUIProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}

"use client"

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

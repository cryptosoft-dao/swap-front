import {
    CHAIN,
    useIsConnectionRestored,
    useTonConnectUI,
    useTonWallet,
} from "@tonconnect/ui-react";
import { toUserFriendlyAddress } from "@tonconnect/sdk";

export function useTonConnect(): {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    connected: boolean | undefined;
    connectionChecked: boolean;
    network: CHAIN | null;
    rawWalletAddress: string | null;
    walletAddress: string | null;
} {
    const [tonConnectUI] = useTonConnectUI();
    const connectionRestored = useIsConnectionRestored();

    const wallet = useTonWallet();

    async function connect() {
        try {
            await tonConnectUI.openModal();
        } catch (err) {
            console.log(err);
        }
    }

    async function disconnect() {
        try {
            await tonConnectUI.disconnect();
        } catch (err) {
            console.log(err);
        }
    }

    return {
        connect,
        disconnect,
        connected: tonConnectUI?.connected,
        connectionChecked: connectionRestored,
        network: wallet?.account?.chain || null,
        rawWalletAddress: wallet?.account?.address || null,
        walletAddress: wallet
            ? toUserFriendlyAddress(wallet.account.address)
            : null
    };
}
import {
	CHAIN,
	useIsConnectionRestored,
	useTonConnectUI,
	useTonWallet,
} from "@tonconnect/ui-react";
import { toUserFriendlyAddress } from "@tonconnect/sdk";

export type Message = {
	/**
	 * Receiver's address.
	 */
	address: string;
	/**
	 * Amount to send in nanoTon.
	 */
	amount: string;
	/**
	 * Contract specific data to add to the transaction.
	 */
	stateInit?: string;
	/**
	 * Contract specific data to add to the transaction.
	 */
	payload?: string;
};

export function useTonConnect() {
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
		rawWalletAddress:wallet?.account?.address || null,
		walletAddress: wallet
			? toUserFriendlyAddress(wallet.account.address)
			: null,
		sendTransaction: (messages: Message[]) => {
			return tonConnectUI?.sendTransaction({
				validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
				messages: messages,
		});
		},
	};
}
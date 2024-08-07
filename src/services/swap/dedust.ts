import { Address, toNano, Sender, TonClient4, beginCell } from "@ton/ton";
import { toUserFriendlyAddress } from "@tonconnect/sdk";
import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  Pool,
  PoolType,
  VaultNative,
  ReadinessStatus,
  JettonWallet,
  VaultJetton,
} from "@dedust/sdk";

import { Message } from "@/hooks/useTConnect";
import { NATIVE } from "@/utils/token";
import { IToken } from "@/interfaces/interface";

import { calculatePriceImpact } from "@/utils/pool";
import { IReserveRes, ISimulateRes } from "@/interfaces/request";

export default async function swapWithDedust({
  TON_CLIENT,
  WALLET_ADDRESS,
  JETTON0,
  JETTON1,
  SWAP_AMOUNT,
}: {
  TON_CLIENT: TonClient4;
  WALLET_ADDRESS: string;
  JETTON0: IToken;
  JETTON1: IToken;
  SWAP_AMOUNT: bigint;
}) {
  const factory = TON_CLIENT.open(
    Factory.createFromAddress(MAINNET_FACTORY_ADDR)
  );

  let messages: Message[] = [];

  // Swapp Native to Jetton
  if (JETTON0.type == NATIVE) {
    const tonVault = TON_CLIENT.open(await factory.getNativeVault());
    // Check if vault exits:
    if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error("Vault (TON) does not exist.");
    }

    const tonAsset = Asset.native();
    const secondaryAsset = Asset.jetton(Address.parse(JETTON1.address));

    const pool = TON_CLIENT.open(
      await factory.getPool(PoolType.VOLATILE, [tonAsset, secondaryAsset])
    );
    // Check if pool exists:
    if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error(`Pool (TON, ${JETTON1.name}) does not exist.`);
    }

    const amountIn = SWAP_AMOUNT;
    const gasAmount = toNano("0.25");
    const payload = beginCell()
      .storeUint(VaultNative.SWAP, 32)
      .storeUint(0, 64)
      .storeCoins(amountIn)
      .storeAddress(pool.address)
      .storeUint(0, 1)
      .storeCoins(0) // limit ?? 0
      .storeMaybeRef(null) // next ? Vault_1.Vault.packSwapStep(next) : null
      .storeRef(
        beginCell()
          .storeUint(0, 32) // deadline
          .storeAddress(null) // recipientAddress
          .storeAddress(null) // referralAddress
          // .storeAddress(Address.parse(process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS)) // referralAddress
          .storeMaybeRef(undefined) // fulfillPayload
          .storeMaybeRef(undefined) // rejectPayload
          .endCell()
      )
      .endCell();

    messages.push({
      address: tonVault.address.toString(),
      amount: (amountIn + gasAmount).toString(),
      payload: Buffer.from(await payload.toBoc()).toString("base64"),
    });
    return messages;
  }

  // Swap Jetton to Native
  if (JETTON1.type == NATIVE) {
    const primaryVault = TON_CLIENT.open(
      await factory.getJettonVault(Address.parse(JETTON0.address))
    );
    // Check if vault exits:
    if ((await primaryVault.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error(`Vault (${JETTON0.name}) does not exist.`);
    }

    const primaryAsset = Asset.jetton(Address.parse(JETTON0.address));
    const tonAsset = Asset.native();

    const pool = TON_CLIENT.open(
      await factory.getPool(PoolType.VOLATILE, [tonAsset, primaryAsset])
    );
    // Check if pool exists:
    if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error(`Pool (${JETTON0.name}, TON) does not exist.`);
    }

    const primaryRoot = TON_CLIENT.open(
      JettonRoot.createFromAddress(Address.parse(JETTON0.address))
    );
    const primaryWallet = TON_CLIENT.open(
      await primaryRoot.getWallet(Address.parse(WALLET_ADDRESS))
    );

    const amountIn = SWAP_AMOUNT;
    const payload = beginCell()
      .storeUint(JettonWallet.TRANSFER, 32)
      .storeUint(0, 64)
      .storeCoins(amountIn)
      .storeAddress(primaryVault.address) //destination
      .storeAddress(null) //responseAddress
      // .storeAddress(Address.parse(process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS)) //responseAddress
      .storeMaybeRef(undefined) //customPayload
      .storeCoins(toNano("0.25")) //forwardAmount
      .storeMaybeRef(
        VaultJetton.createSwapPayload({ poolAddress: pool.address })
      )
      .endCell();

    messages.push({
      address: primaryWallet.address.toString(),
      amount: toNano("0.3").toString(),
      payload: Buffer.from(await payload.toBoc()).toString("base64"),
    });
    return messages;
  }

  // Swap Jetton to Jetton
  const primaryVault = TON_CLIENT.open(
    await factory.getJettonVault(Address.parse(JETTON0.address))
  );

  const primaryAsset = Asset.jetton(Address.parse(JETTON0.address));
  const secondaryAsset = Asset.jetton(Address.parse(JETTON1.address));

  const pool = TON_CLIENT.open(
    await factory.getPool(PoolType.VOLATILE, [primaryAsset, secondaryAsset])
  );

  // Check if pool exists:
  if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
    throw new Error(`Pool (${JETTON0.name}, ${JETTON1.name}) does not exist.`);
  }

  // Check if vault exits:
  if ((await primaryVault.getReadinessStatus()) !== ReadinessStatus.READY) {
    throw new Error(`Vault (${JETTON0.name}) does not exist.`);
  }

  const primaryRoot = TON_CLIENT.open(
    JettonRoot.createFromAddress(Address.parse(JETTON0.address))
  );
  const primaryWallet = TON_CLIENT.open(
    await primaryRoot.getWallet(Address.parse(WALLET_ADDRESS))
  );

  const amountIn = SWAP_AMOUNT;
  const payload = beginCell()
    .storeUint(JettonWallet.TRANSFER, 32)
    .storeUint(0, 64)
    .storeCoins(amountIn)
    .storeAddress(primaryVault.address) //destination
    .storeAddress(null) //responseAddress
    // .storeAddress(Address.parse(process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS)) //responseAddress
    .storeMaybeRef(undefined) //customPayload
    .storeCoins(toNano("0.25")) //forwardAmount
    .storeMaybeRef(VaultJetton.createSwapPayload({ poolAddress: pool.address }))
    .endCell();

  messages.push({
    address: primaryWallet.address.toString(),
    amount: toNano("0.3").toString(),
    payload: Buffer.from(await payload.toBoc()).toString("base64"),
  });
  return messages;
}

export async function getDedustPool(query: {
  from: IToken;
  to: IToken;
}): Promise<IReserveRes> {
  try {
    const tonClient = new TonClient4({
      endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    const factory = tonClient.open(
      Factory.createFromAddress(MAINNET_FACTORY_ADDR)
    );

    const primaryAsset =
      query.from.type === "native"
        ? Asset.native()
        : Asset.jetton(Address.parse(query.from.address));
    const secondaryAsset =
      query.to.type === "native"
        ? Asset.native()
        : Asset.jetton(Address.parse(query.to.address));

    const pool = tonClient.open(
      await factory.getPool(PoolType.VOLATILE, [primaryAsset, secondaryAsset])
    );

    const reserves = await pool.getReserves();
    return {
      swapable: reserves[0] + reserves[1] ? true : false,
      reserves: reserves.map((rres) => rres.toString()) as [string, string],
    };
  } catch (err) {
    console.log(err);
    return {
      swapable: false,
      reserves: ["0", "0"],
    };
  }
}

export async function simulateDedustSwap(query: {
  from: IToken;
  to: IToken;
  amount: number;
  reserved: [number, number];
}): Promise<ISimulateRes> {
  try {
    const tonClient = new TonClient4({
      endpoint: "https://mainnet-v4.tonhubapi.com",
    });

    const factory = tonClient.open(
      Factory.createFromAddress(MAINNET_FACTORY_ADDR)
    );

    const primaryAsset =
      query.from.type === "native"
        ? Asset.native()
        : Asset.jetton(Address.parse(query.from.address));
    const secondaryAsset = Asset.jetton(Address.parse(query.to.address));

    const pool = tonClient.open(
      await factory.getPool(PoolType.VOLATILE, [primaryAsset, secondaryAsset])
    );

    const { amountOut: expectedAmountOut, tradeFee } =
      await pool.getEstimatedSwapOut({
        assetIn: primaryAsset,
        amountIn: BigInt(query.amount),
      });

    /*const sendAmount = query.amount / Math.pow(10, query.from.decimals);
    const receiveAmount =
      Number(expectedAmountOut) / Math.pow(10, query.to.decimals);

    return {
      status: "success",
      data: {
        fees: Number(tradeFee) / Math.pow(10, 9),
        swapRate: receiveAmount / sendAmount,
        amountOut: receiveAmount,
        priceImpact: calculatePriceImpact({
          offerAssetReserve: query.reserved[0],
          askAssetReserve: query.reserved[1],
          offerAmount: query.amount,
        }),
      },
    };*/
    const sendAmount = query.amount / Math.pow(10, query.from.decimals);
    const receiveAmount =
      Number(expectedAmountOut) / Math.pow(10, query.to.decimals);
    return {
      status: "success",
      data: {
        swapRate: receiveAmount / sendAmount,
      },
    };
  } catch (err) {
    return {
      status: "fail",
      data: null,
    };
  }
}

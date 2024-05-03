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
import { IDedustPool } from "@/interfaces/dedust";
import { IReserveRes } from "@/interfaces/request";

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
  SWAP_AMOUNT: number;
}) {
  const factory = TON_CLIENT.open(
    Factory.createFromAddress(MAINNET_FACTORY_ADDR)
  );

  let messages: Message[] = [];

  // Swapping native coin
  if (JETTON0.type == NATIVE) {
    const tonVault = TON_CLIENT.open(await factory.getNativeVault());

    const tonAsset = Asset.native();
    const secondaryAsset = Asset.jetton(Address.parse(JETTON1.address));

    const pool = TON_CLIENT.open(
      await factory.getPool(PoolType.VOLATILE, [tonAsset, secondaryAsset])
    );

    // Check if pool exists:
    if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error(`Pool (TON, ${JETTON1.name}) does not exist.`);
    }

    // Check if vault exits:
    if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
      throw new Error("Vault (TON) does not exist.");
    }

    const amountIn = toNano(SWAP_AMOUNT);
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
          .storeUint(0, 32)
          .storeAddress(null) // recipientAddress
          .storeAddress(null) // referralAddress
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

  // Swapping jettons
  const primaryVault = TON_CLIENT.open(
    await factory.getJettonVault(Address.parse(JETTON0.address))
  );

  const primaryAsset = TON_CLIENT.open(
    JettonRoot.createFromAddress(Address.parse(JETTON0.address))
  );
  const secondaryAsset = TON_CLIENT.open(
    JettonRoot.createFromAddress(Address.parse(JETTON1.address))
  );

  const pool = TON_CLIENT.open(
    Pool.createFromAddress(
      await factory.getPoolAddress({
        poolType: PoolType.VOLATILE,
        assets: [
          Asset.jetton(primaryAsset.address),
          Asset.jetton(secondaryAsset.address),
        ],
      })
    )
  );

  // Check if pool exists:
  if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
    throw new Error(`Pool (${JETTON0.name}, ${JETTON1.name}) does not exist.`);
  }

  // Check if vault exits:
  if ((await primaryVault.getReadinessStatus()) !== ReadinessStatus.READY) {
    throw new Error(`Vault (${JETTON0.name}) does not exist.`);
  }

  const primaryWallet = TON_CLIENT.open(
    await primaryAsset.getWallet(Address.parse(WALLET_ADDRESS))
  );

  const amountIn = toNano(SWAP_AMOUNT);
  const payload = beginCell()
    .storeUint(JettonWallet.TRANSFER, 32)
    .storeUint(0, 64)
    .storeCoins(amountIn)
    .storeAddress(primaryVault.address) //destination
    .storeAddress(Address.parse(process.env.NEXT_PUBLIC_REFERRAL_ADDRESS || WALLET_ADDRESS)) //responseAddress
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
    const secondaryAsset = Asset.jetton(Address.parse(query.to.address));

    const pool = tonClient.open(
      await factory.getPool(PoolType.VOLATILE, [primaryAsset, secondaryAsset])
    );

    const reserves = await pool.getReserves();
    return {
      swapable: reserves[0] + reserves[1] ? true : false,
      reserves: reserves.map((rres) => rres.toString()) as [string, string],
    };
  } catch (err) {
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
}) {
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

    const sendAmount = query.amount / Math.pow(10, query.from.decimals);
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
    };
  } catch (err) {
    return {
      status: "fail",
      data: null,
    };
  }
}

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

import { Message } from "@/hooks/useTONConnect";
import { JETTON, NATIVE } from "@/utils/tokens/tokens";
import { IPool, IToken } from "@/interfaces/interface";

import { calculatePriceImpact } from "@/utils/pool";

export default async function swapWithDedust({
  WALLET_ADDRESS,
  JETTON0,
  JETTON1,
  SWAP_AMOUNT,
}: {
  WALLET_ADDRESS: string;
  JETTON0: IToken;
  JETTON1: IToken;
  SWAP_AMOUNT: number;
}) {
  const tonClient = new TonClient4({
    endpoint: "https://mainnet-v4.tonhubapi.com",
  });

  const factory = tonClient.open(
    Factory.createFromAddress(MAINNET_FACTORY_ADDR)
  );

  let messages: Message[] = [];

  // Swapping native coin
  if (JETTON0.type == NATIVE) {
    const tonVault = tonClient.open(await factory.getNativeVault());

    const tonAsset = Asset.native();
    const secondaryAsset = Asset.jetton(Address.parse(JETTON1.address));

    const pool = tonClient.open(
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

    // await tonVault.sendSwap(sender, {
    //   poolAddress: pool.address,
    //   amount: amountIn,
    //   gasAmount: toNano("0.25"),
    // });

    messages.push({
      address: tonVault.address.toString(),
      amount: (amountIn + gasAmount).toString(),
      payload: Buffer.from(await payload.toBoc()).toString("base64"),
    });
    return messages;
  }

  // Swapping jettons
  const primaryVault = tonClient.open(
    await factory.getJettonVault(Address.parse(JETTON0.address))
  );

  const primaryAsset = tonClient.open(
    JettonRoot.createFromAddress(Address.parse(JETTON0.address))
  );
  const secondaryAsset = tonClient.open(
    JettonRoot.createFromAddress(Address.parse(JETTON1.address))
  );

  const pool = tonClient.open(
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

  const primaryWallet = tonClient.open(
    await primaryAsset.getWallet(Address.parse(WALLET_ADDRESS))
  );

  const amountIn = toNano(SWAP_AMOUNT);
  const payload = beginCell()
    .storeUint(JettonWallet.TRANSFER, 32)
    .storeUint(0, 64)
    .storeCoins(amountIn)
    .storeAddress(primaryVault.address) //destination
    .storeAddress(Address.parse(WALLET_ADDRESS)) //responseAddress
    .storeMaybeRef(undefined) //customPayload
    .storeCoins(toNano("0.25")) //forwardAmount
    .storeMaybeRef(VaultJetton.createSwapPayload({ poolAddress: pool.address }))
    .endCell();

  // await primaryWallet.sendTransfer(sender, toNano("0.3"), {
  //   amount: amountIn,
  //   destination: scaleVault.address,
  //   responseAddress: sender.address, // return gas to user
  //   forwardAmount: toNano("0.25"),
  //   forwardPayload: VaultJetton.createSwapPayload({ poolAddress }),
  // });
  messages.push({
    address: toUserFriendlyAddress(primaryWallet.address.toString()),
    amount: amountIn.toString(),
    payload: Buffer.from(await payload.toBoc()).toString("base64"),
  });
  return messages;
}

// const lastBlock = await tonClient.getLastBlock();
// const poolState = await tonClient.getAccountLite(
//   lastBlock.last.seqno,
//   pool.address
// );

// if (poolState.account.state.type !== "active") {
//   throw new Error("Pool is not exist.");
// }

// const vaultState = await tonClient.getAccountLite(
//   lastBlock.last.seqno,
//   nativeVault.address
// );

// if (vaultState.account.state.type !== "active") {
//   throw new Error("Native Vault is not exist.");
// }

// const amountIn = toNano(SWAP_AMOUNT);

// const { amountOut: expectedAmountOut } = await pool.getEstimatedSwapOut({
//   assetIn: Asset.native(),
//   amountIn,
// });

// Slippage handling (1%)
// const minAmountOut = (expectedAmountOut * 99) / 100; // expectedAmountOut - 1%

//const sender:Sender = null;

// await nativeVault.sendSwap(sender, {
//   poolAddress: pool.address,
//   amount: amountIn,
//   limit: BigInt(0),
//   gasAmount: toNano("0.25"),
// });

export async function simulateDedustSwap(query: {
  from: IToken;
  to: IToken;
  amount: number;
  reserved: [number,number];
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
        fees: Number(tradeFee) / Math.pow(10, query.from.decimals),
        swapRate: receiveAmount / sendAmount,
        amountOut: receiveAmount,
        priceImpact: calculatePriceImpact({
          offerAssetReserve:query.reserved[0],
          askAssetReserve:query.reserved[1],
          offerAmount:query.amount
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

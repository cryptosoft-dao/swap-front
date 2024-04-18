import { Address, toNano, Sender, TonClient4 } from "@ton/ton";
import {
  Asset,
  Factory,
  JettonRoot,
  MAINNET_FACTORY_ADDR,
  Pool,
  PoolType,
  VaultNative,
} from "@dedust/sdk";

export default async function swapWithDedust({
  SWAP_AMOUNT,
  SLIPPAGE,
  JETTON0,
  JETTON1,
}: {
  SWAP_AMOUNT: string;
  SLIPPAGE: number;
  JETTON0: string;
  JETTON1: string;
}) {
  const tonClient = new TonClient4({
    endpoint: "https://mainnet-v4.tonhubapi.com",
  });

  const factory = tonClient.open(
    Factory.createFromAddress(MAINNET_FACTORY_ADDR)
  );

  const primaryAsset = tonClient.open(
    JettonRoot.createFromAddress(Address.parse(JETTON0))
  );
  const secondaryAsset = tonClient.open(
    JettonRoot.createFromAddress(Address.parse(JETTON1))
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

  const nativeVault = tonClient.open(
    VaultNative.createFromAddress(await factory.getVaultAddress(Asset.native()))
  );

  const lastBlock = await tonClient.getLastBlock();
  const poolState = await tonClient.getAccountLite(
    lastBlock.last.seqno,
    pool.address
  );

  if (poolState.account.state.type !== "active") {
    throw new Error("Pool is not exist.");
  }

  const vaultState = await tonClient.getAccountLite(
    lastBlock.last.seqno,
    nativeVault.address
  );

  if (vaultState.account.state.type !== "active") {
    throw new Error("Native Vault is not exist.");
  }

  const amountIn = toNano(SWAP_AMOUNT);
  
  const { amountOut: expectedAmountOut } = await pool.getEstimatedSwapOut({
    assetIn: Asset.native(),
    amountIn,
  });

  // Slippage handling (1%)
  // const minAmountOut = (expectedAmountOut * 99) / 100; // expectedAmountOut - 1%

  //const sender:Sender = null;

  /*await nativeVault.sendSwap(sender, {
    poolAddress: pool.address,
    amount: amountIn,
    limit: BigInt(0),
    gasAmount: toNano("0.25"),
  });*/
}

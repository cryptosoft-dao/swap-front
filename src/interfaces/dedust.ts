export interface IDedustPool {
  address: string;
  lt: string;
  totalSupply: string;
  type: string;
  tradeFee: string;
  assets: [string, string];
  reserves: [string, string];
  fees: [string, string];
  volume: [string, string];
}

export interface ISimulateDedustData {
  pool: {
    address: string;
    isStable: boolean;
    assets: [string, string];
    reserves: [string, string];
  };
  assetIn: string;
  assetOut: string;
  tradeFee: string;
  amountIn: string;
  amountOut: string;
}

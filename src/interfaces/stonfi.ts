export interface IStonfiPool {
  address: string;
  apy_1d: string;
  apy_30d: string;
  apy_7d: string;
  collected_token0_protocol_fee: string;
  collected_token1_protocol_fee: string;
  deprecated: boolean;
  lp_account_address: string;
  lp_balance: string;
  lp_fee: string;
  lp_price_usd: string;
  lp_total_supply: string;
  lp_total_supply_usd: string;
  lp_wallet_address: string;
  protocol_fee: string;
  protocol_fee_address: string;
  ref_fee: string;
  reserve0: string;
  reserve1: string;
  router_address: string;
  token0_address: string;
  token0_balance: string;
  token1_address: string;
  token1_balance: string;
}

export interface ISimulateStonfiData {
  offer_address: string;
  ask_address: string;
  router_address: string;
  pool_address: string;
  offer_units: string;
  ask_units: string;
  slippage_tolerance: string;
  min_ask_units: string;
  swap_rate: string;
  price_impact: string;
  fee_address: string;
  fee_units: string;
  fee_percent: string;
}

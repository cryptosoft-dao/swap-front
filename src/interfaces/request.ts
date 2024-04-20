export interface IRequestProps {
  url: string;
  progress?: (progress: number) => void;
}

export interface IResponse<T> {
  status: string;
  data: T | null;
  message: string;
}

export interface IBalancesRes<T> {
  balances: T;
}

export interface ISwapDetails {
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

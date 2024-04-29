const TON_BASE_URL = "https://tonapi.io/v2";
const STONFI_BASE_URL = "https://api.ston.fi/v1";
const CUSTOM_BASE_URL = "https://a-wallet-api.just-dmitry.ru";
const DEDUST_BASE_URL = "https://api.dedust.io/v2";

type Query = Record<string, any>;

export const TON_APIs = {
  nativeBalance: (address: string) => `${TON_BASE_URL}/accounts/${address}`,
  jettonBalances: (address: string) =>
    `${TON_BASE_URL}/accounts/${address}/jettons`,
};

export const STONFI_APIs = {
  pools: `${STONFI_BASE_URL}/pools`,
  simulate: (query: Query) =>
    `${STONFI_BASE_URL}/swap/simulate?${new URLSearchParams(query)}`,
};

export const CUSTOM_APIs = {
  stonfiPool:(primary:string,secondary:string) => `${CUSTOM_BASE_URL}/stonfi/findpool?token0=${primary}&token1=${secondary}`
};

export const DEDUST_APIS = {
  pools: `${DEDUST_BASE_URL}/pools-lite`,
  simulate: `${DEDUST_BASE_URL}/routing/plan`,
};

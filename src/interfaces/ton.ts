enum AccountStatus {
  "nonexist",
  "uninit",
  "active",
  "frozen",
}

export interface INativeBalance {
  address: string;
  balance: number | bigint;
  last_activity: number;
  unix: number;
  status?: AccountStatus[];
  name: string;
  is_scam: boolean;
  icon?: string;
  memo_required?: boolean;
  get_methods: string[];
  is_suspended?: boolean;
  is_wallet: boolean;
}

export interface IJettonBalance {
  balance: string;
  price: {
    prices: {
      TON: number;
    };
    diff_24h: {
      TON: string;
    };
    diff_7d: {
      TON: string;
    };
    diff_30d: {
      TON: string;
    };
  };
  wallet_address: {
    address: string;
    name: string;
    is_scam: boolean;
    icon: string;
    is_wallet: boolean;
  };
  jetton: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image: string;
    verification: string;
  };
  lock: {
    amount: string;
    till: number;
  };
}

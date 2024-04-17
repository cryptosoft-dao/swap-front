enum AccountStatus {
  "nonexist",
  "uninit",
  "active",
  "frozen",
}

export interface IAccount {
  address: string;
  balance: number;
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

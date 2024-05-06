export interface IContent<Type> {
  status: string;
  loading: boolean;
  content: Type;
  message: string;
}

export interface IToken {
  type: string;
  address: string;
  name: string;
  symbol: string;
  image: string;
  decimals: number;
  balance: number;
}

export interface ISlippage {
  value: number;
  type: "custom" | "default";
}

export interface IPool {
  assets: {
    primary: string;
    secondary: string;
  };
  dedustReserved: [string, string];
  stonfiReserved: [string, string];
}

export type Selector = "primary" | "secondary" | "none";
export type Action = "select" | "swap";

export interface ITokenSelectorHook {
  token?: IToken;
  selectToken: (token?: IToken, action?: Action) => void;
  selectTokenAndExit: (token: IToken) => void;
  selector: Selector;
  toggleSelector: () => void;
  action: Action;
  selectAction:(action:Action) => void;
}

export interface IReserve {
  platform: string;
  name: string;
  reserve: number;
}

export interface ISimulate {
  fees: number;
  swapRate: number;
  amountOut: number;
  priceImpact: number;
}

export type RawAddress = string;
export type MappedToken = Record<RawAddress, IToken>;
export type MappedBalance = Record<RawAddress, number>;
export type MappedPool = Record<string, IPool>;
export type MappedTokenPair = Record<string, MappedPool>;

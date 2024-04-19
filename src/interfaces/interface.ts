import { StaticImageData } from "next/image";

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

import { ISimulate } from "./interface";
import { IStonfiPool } from "./stonfi";

export interface IRequestProps {
  url: string;
  progress?: (progress: number) => void;
}

export interface IPostRequestProps extends IRequestProps {
  data?:any
}

export interface IResponse<T> {
  status: string;
  data: T | null;
  message: string;
}

export interface IJettonBalancesRes<T> {
  balances: T;
}

export interface IStonfiPoolRes {
  pool_list: IStonfiPool[];
}

export interface ISimulateRes  {
  status: string;
  data:ISimulate | null;
}

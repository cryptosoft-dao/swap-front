import { IToken } from "@/interfaces/interface";

import USDTIcon from "@/assets/icons/USDT.svg";
import USDCIcon from "@/assets/icons/USDC.svg";
import TONIcon from "@/assets/icons/TON.svg";
import NFZIcon from "@/assets/icons/NFZ.svg";
import ScaleIcon from "@/assets/icons/SCALE.svg";

export const tokens: IToken[] = [
  {
    name: "TON",
    symbol: "TON",
    icon: TONIcon,
    balance: 0,
    address: "",
    native: true,
  },
  {
    name: "USDT",
    symbol: "jUSDT",
    icon: USDTIcon,
    balance: 0,
    address: "",
  },
  {
    name: "SCALE",
    symbol: "SCALE",
    icon: ScaleIcon,
    balance: 0,
    address: "",
  },
  {
    name: "oUSDC",
    symbol: "oUSDC",
    icon: USDCIcon,
    balance: 0,
    address: "",
  },
  {
    name: "NFZ",
    symbol: "NFZ",
    icon: NFZIcon,
    balance: 0,
    address: "",
  },
];

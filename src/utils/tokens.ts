import { IToken } from "@/interfaces/interface";

import USDTIcon from "@/assets/icons/USDT.svg";
import USDCIcon from "@/assets/icons/USDC.svg";
import TONIcon from "@/assets/icons/TON.svg";
import NFZIcon from "@/assets/icons/NFZ.svg";
import ScaleIcon from "@/assets/icons/SCALE.svg";

export const tokens: IToken[] = [
  {
    name: "TON",
    icon: TONIcon,
    balance: 640,
  },
  {
    name: "USDT",
    icon: USDTIcon,
    balance: 156.3,
  },
  {
    name:"SCALE",
    icon:ScaleIcon,
    balance:3000.34
  },
  {
    name: "oUSDC",
    icon: USDCIcon,
    balance: 342.234,
  },
  {
    name: "NFZ",
    icon: NFZIcon,
    balance: 2343.234,
  }
];

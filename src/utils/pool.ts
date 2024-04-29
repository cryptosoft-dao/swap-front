import { IDedustPool } from "@/interfaces/dedust";

import { TONTokenAddress } from "./token";

import { MappedTokenPair, IPool, IReserve } from "@/interfaces/interface";
import { IStonfiPool } from "@/interfaces/stonfi";
import { percentage } from "./math";

export function reFormatDedustPoolList(
  poolList: IDedustPool[]
): MappedTokenPair {
  return poolList.reduce((mappedTokenPair: MappedTokenPair, currentPool) => {
    //Format Address
    let [primaryAddress, secondaryAddress] = currentPool.assets.map(
      (address) => {
        if (address === "native") return TONTokenAddress;
        else return address.split(":")[1];
      }
    );

    const data: IPool = {
      assets: {
        primary: primaryAddress,
        secondary: secondaryAddress,
      },
      dedustReserved: currentPool.reserves,
      stonfiReserved: ["0", "0"],
    };

    if (mappedTokenPair[primaryAddress]) {
      mappedTokenPair[primaryAddress][secondaryAddress] = data;
    } else {
      mappedTokenPair[primaryAddress] = { [secondaryAddress]: data };
    }

    return mappedTokenPair;
  }, {});
}

export function mergeStonfiPoolInDedustPool(
  mappedDedustPool: MappedTokenPair,
  poolList: IStonfiPool[]
): MappedTokenPair {
  return poolList.reduce(
    (mappedTokenPair, currentPool) => {
      //Current Pool data
      const stats = { updated: false };
      const reserved: [string, string] = [
        currentPool.reserve0,
        currentPool.reserve1,
      ];
      const [primary, secondary] = [
        currentPool.token0_address, //USDT ADDRESS
        currentPool.token1_address, //TON ADDRESS
      ];

      //FIND TOKEN WITH PRIMARY ADDRESS (assuming first pair address is TON)
      if (mappedTokenPair[primary] && mappedTokenPair[primary][secondary]) {
        //UPDATE PAIR
        mappedTokenPair[primary][secondary].stonfiReserved = reserved;
        stats.updated = true;
      }

      if (
        !stats.updated &&
        mappedTokenPair[secondary] &&
        mappedTokenPair[secondary][primary]
      ) {
        const newReserved = reserved.reverse() as [string, string];
        //UPDATE PAIR
        mappedTokenPair[secondary][primary].stonfiReserved = newReserved;
        stats.updated = true;
      }

      //IF NOT UPDATED CREATE NEW PAIR FOR BOTH (on new entry dedust reserve will be 0)
      if (!stats.updated) {
        //ENTER NEW PAIR IN PRIMARY
        mappedTokenPair[primary] = {
          ...(mappedTokenPair[primary] || {}),
          [secondary]: {
            assets: { primary, secondary },
            dedustReserved: ["0", "0"],
            stonfiReserved: reserved,
          },
        };

        //ENTER NEW PAIR IN SECONDARY
        const reverseReserved = reserved.reverse() as [string, string];
        mappedTokenPair[secondary] = {
          ...(mappedTokenPair[secondary] || {}),
          [primary]: {
            assets: { primary: secondary, secondary: primary },
            dedustReserved: ["0", "0"],
            stonfiReserved: reverseReserved,
          },
        };
      }
      return mappedTokenPair;
    },
    { ...mappedDedustPool }
  );
}

export function calculateReserve(pair: IPool) {
  //Parse reserve values
  const [dedustReserved, stonfiReserved] = [
    pair.dedustReserved[1],
    pair.stonfiReserved[1],
  ].map(Number.parseFloat);

  const totalReserved = dedustReserved + stonfiReserved;

  //Calculate Percentage and sort
  const reserved: Record<string, IReserve> = {
    dedust: {
      platform: "DeDust.io",
      name: "dedust",
      reserve: Math.round(percentage(totalReserved, dedustReserved)),
    },
    stonfi: {
      platform: "Ston.fi",
      name: "stonfi",
      reserve: Math.round(percentage(totalReserved, stonfiReserved)),
    },
  };

  return reserved;
}

export function calculatePriceImpact(args: {
  offerAssetReserve: number;
  askAssetReserve: number;
  offerAmount: number;
}): number {
  const productOfAssetReserve = args.offerAssetReserve * args.askAssetReserve;
  const poolOfOfferAsset = args.offerAssetReserve + args.offerAmount;
  const askAssetReserveEffectedBy = productOfAssetReserve / poolOfOfferAsset;
  const askAmount = args.askAssetReserve - askAssetReserveEffectedBy;

  return Number.parseFloat(
    ((askAmount / askAssetReserveEffectedBy) * 100).toFixed(5)
  );
}

export function splitOfferAmount(args: {
  offerAmount: number;
  dedustReserve: number;
  stonfiReserve: number;
}): {
  dedustOfferAmount: number;
  stonfiOfferAmount: number;
} {
  return {
    dedustOfferAmount: (args.dedustReserve / 100) * args.offerAmount,
    stonfiOfferAmount: (args.stonfiReserve / 100) * args.offerAmount,
  };
}

import { extendEnvironment } from "@nomiclabs/buidler/config";
import { lazyObject } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";

import {
  getContract,
  getContractOrNull,
  getContractAt,
  getContractFactory,
  getSigners,
  getSigner
} from "./helpers";

function fixProvider(provider: any): any {
  // alow it to be used by ethers without any change
  if (provider.sendAsync === undefined) {
    provider.sendAsync = (
      req: {
        id: number;
        jsonrpc: string;
        method: string;
        params: any[];
      },
      callback: (error: any, result: any) => void
    ) => {
      provider
        .send(req.method, req.params)
        .then((result: any) =>
          callback(null, { result, id: req.id, jsonrpc: req.jsonrpc })
        )
        .catch((error: any) => callback(error, null));
    };
  }
  return provider;
}

export default function() {
  extendEnvironment((env: BuidlerRuntimeEnvironment) => {
    env.ethers = lazyObject(() => {
      const ethers = require("ethers");
      const { Web3Provider } = ethers.providers;
      return {
        provider: new Web3Provider(fixProvider(env.network.provider) as any),

        getSigners: async () => getSigners(env),
        getSigner: getSigner.bind(null, env),
        // We cast to any here as we hit a limitation of Function#bind and
        // overloads. See: https://github.com/microsoft/TypeScript/issues/28582
        getContractFactory: getContractFactory.bind(null, env, ethers) as any,
        getContractAt: getContractAt.bind(null, env, ethers),
        getContract: getContract.bind(null, env, ethers),
        getContractOrNull: getContractOrNull.bind(null, env, ethers)
      };
    });
  });
}

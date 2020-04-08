import { extendEnvironment } from "@nomiclabs/buidler/config";
import { lazyObject } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import EthersT from "ethers";

import {
  getContract,
  getContractAt,
  getContractFactory,
  getSigners
} from "./helpers";

function fixProvider(env: BuidlerRuntimeEnvironment) {
  // alow it to be used by ethers without any change
  const provider = env.ethereum as any;
  if (provider.sendAsync === undefined) {
    provider.sendAsync = async (
      req: {
        id: number;
        jsonrpc: string;
        method: string;
        params: any[];
      },
      callback: (error: any, result: any) => void
    ) => {
      let result;
      try {
        result = await provider.send(req.method, req.params);
      } catch (e) {
        callback(e, null);
        return;
      }
      const response = { result, id: req.id, jsonrpc: req.jsonrpc };
      callback(null, response);
    };
  }
}
export default function() {
  extendEnvironment((env: BuidlerRuntimeEnvironment) => {
    fixProvider(env);
    env.ethers = lazyObject(() => {
      const ethers = require("ethers");
      const { Web3Provider } = ethers.providers;
      return {
        provider: new Web3Provider(env.network.provider as any),

        getSigners: async () => getSigners(env),
        // We cast to any here as we hit a limitation of Function#bind and
        // overloads. See: https://github.com/microsoft/TypeScript/issues/28582
        getContractFactory: getContractFactory.bind(null, env, ethers) as any,
        getContractAt: getContractAt.bind(null, env, ethers),
        getContract: getContract.bind(null, env, ethers)
      };
    });
  });
}

import { extendEnvironment } from "@nomiclabs/buidler/config";
import { lazyObject } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import * as ethers from "ethers";

import { getContractAt, getContractFactory, getSigners } from "./helpers";

const { Web3Provider } = ethers.providers;

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
      const ethersMembers = ethers as typeof ethers;
      return {
        ...ethersMembers,
        provider: new Web3Provider(env.network.provider as any),

        getSigners: async () => getSigners(env),
        // We cast to any here as we hit a limitation of Function#bind and
        // overloads. See: https://github.com/microsoft/TypeScript/issues/28582
        getContractFactory: getContractFactory.bind(null, env) as any,
        getContractAt: getContractAt.bind(null, env),
        getContract: (
          contractName: string,
          signer?: ethers.Signer
        ): Promise<ethers.Contract> => {
          const deployments = (env as any).deployments;
          if (deployments !== undefined) {
            const contract = deployments.get(contractName) as any;
            if (contract === undefined) {
              throw new Error(`No Contract deployed with name ${contractName}`);
            }
            return getContractAt(
              env,
              contract.abi ||
                (contract.contractInfo && contract.contractInfo.abi),
              contract.address,
              signer
            );
          }
          throw new Error(
            `No Deployment Plugin Installed, try usePlugin("buidler-deploy")`
          );
        }
      };
    });
  });
}

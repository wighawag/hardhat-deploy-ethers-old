import "./type-extensions";
import { extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  getContract,
  getContractOrNull,
  getContractAt,
  getContractFactory,
  getSigners,
  getSigner
} from "./helpers";


extendEnvironment((env: HardhatRuntimeEnvironment) => {
  env.ethers = lazyObject(() => {
    const ethers = require("ethers");
    const { Web3Provider } = ethers.providers;
    return {
      provider: new Web3Provider(env.network.provider),

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

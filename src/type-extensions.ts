import * as ethers from "ethers";
import "hardhat/types/runtime";

import type {
  FactoryOptions as FactoryOptionsT,
  Libraries as LibrariesT,
} from "./helpers";
import type { SignerWithAddress } from "./signer-with-address";

declare module "hardhat/types/runtime" {
  type Libraries = LibrariesT;
  type FactoryOptions = FactoryOptionsT;

  type EthersExtension = {
    provider: ethers.providers.JsonRpcProvider;
  
    getContractFactory: typeof getContractFactory;
    getContractAt: (
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ) => Promise<ethers.Contract>;
    
    getSigners: () => Promise<SignerWithAddress[]>;
    getSigner: (address: string) => Promise<SignerWithAddress>;
    getSignerOrNull: (address: string) => Promise<SignerWithAddress | null>;

    getNamedSigners: () => Promise<Record<string, SignerWithAddress>>;
    getNamedSigner: (name: string) => Promise<SignerWithAddress>;
    getNamedSignerOrNull: (name: string) => Promise<SignerWithAddress | null>;
    getUnnamedSigners: () => Promise<SignerWithAddress[]>;

    getContract: (
      name: string,
      signer?: ethers.Signer | string
    ) => Promise<ethers.Contract>;
    getContractOrNull: (
      name: string,
      signer?: ethers.Signer | string
    ) => Promise<ethers.Contract | null>;
  
    // Standard ethers properties
    Signer: typeof ethers.Signer;
    Wallet: typeof ethers.Wallet;
    VoidSigner: typeof ethers.VoidSigner;
    getDefaultProvider: typeof ethers.getDefaultProvider;
    providers: typeof ethers.providers;
    Contract: typeof ethers.Contract;
    ContractFactory: typeof ethers.ContractFactory;
    BigNumber: typeof ethers.BigNumber;
    FixedNumber: typeof ethers.FixedNumber;
    constants: typeof ethers.constants;
    errors: typeof ethers.errors;
    logger: typeof ethers.logger;
    utils: typeof ethers.utils;
    wordlists: typeof ethers.wordlists;
    version: typeof ethers.version;
    Wordlist: typeof ethers.Wordlist;
  };
  

  function getContractFactory(
    name: string,
    signerOrOptions?: ethers.Signer | FactoryOptions
  ): Promise<ethers.ContractFactory>;
  function getContractFactory(
    abi: any[],
    bytecode: ethers.utils.BytesLike,
    signer?: ethers.Signer
  ): Promise<ethers.ContractFactory>;

  interface HardhatRuntimeEnvironment {
    ethers: EthersExtension;
  }
}

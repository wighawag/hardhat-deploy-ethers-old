import "@nomiclabs/buidler/types";
import ethers from "ethers";

declare module "@nomiclabs/buidler/types" {
  function getContractFactory(
    name: string,
    signer?: ethers.Signer
  ): Promise<ethers.ContractFactory>;
  function getContractFactory(
    abi: any[],
    bytecode: any | string, // TODO ethers.utils.ArrayIsh
    signer?: ethers.Signer
  ): Promise<ethers.ContractFactory>;

  interface BuidlerRuntimeEnvironment {
    ethers: {
      provider: ethers.providers.Web3Provider;
      getContractFactory: typeof getContractFactory;
      getContractAt: (
        nameOrAbi: string | any[],
        address: string,
        signer?: ethers.Signer
      ) => Promise<ethers.Contract>;
      getContract: (
        name: string,
        signer?: ethers.Signer
      ) => Promise<ethers.Contract>;
      getSigners: () => Promise<ethers.Signer[]>;
    };
  }
}

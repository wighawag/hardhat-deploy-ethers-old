import "@nomiclabs/buidler/types";
import ethers from "ethers";

declare module "@nomiclabs/buidler/types" {
  function getContractFactory(
    name: string,
    signer?: ethers.Signer | string
  ): Promise<ethers.ContractFactory>;
  function getContractFactory(
    abi: any[],
    bytecode: ethers.BytesLike,
    signer?: ethers.Signer | string
  ): Promise<ethers.ContractFactory>;

  interface BuidlerRuntimeEnvironment {
    ethers: {
      provider: ethers.providers.Web3Provider;
      getContractFactory: typeof getContractFactory;
      getContractAt: (
        nameOrAbi: string | any[],
        address: string,
        signer?: ethers.Signer | string
      ) => Promise<ethers.Contract>;
      getContract: (
        name: string,
        signer?: ethers.Signer | string
      ) => Promise<ethers.Contract>;
      getContractOrNull: (
        name: string,
        signer?: ethers.Signer | string
      ) => Promise<ethers.Contract | null>;
      getSigners: () => Promise<ethers.Signer[]>;
      getSigner: (address: string) => Promise<ethers.Signer>;
    };
  }
}

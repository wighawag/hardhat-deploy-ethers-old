import { readArtifact } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import EthersT from "ethers";

export async function getSigners(bre: BuidlerRuntimeEnvironment) {
  const accounts = await bre.ethers.provider.listAccounts();
  return accounts.map((account: string) =>
    bre.ethers.provider.getSigner(account)
  );
}

export function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer
): Promise<EthersT.ContractFactory>;

export function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: any | string, // TODO ethers.utils.ArrayIsh
  signer?: EthersT.Signer
): Promise<EthersT.ContractFactory>;

export async function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  bytecodeOrSigner?: EthersT.Signer | any | string, // TODO ethers.utils.ArrayIsh
  signer?: EthersT.Signer
) {
  if (typeof nameOrAbi === "string") {
    return getContractFactoryByName(
      bre,
      ethers,
      nameOrAbi,
      bytecodeOrSigner as EthersT.Signer | undefined
    );
  }

  return getContractFactoryByAbiAndBytecode(
    bre,
    ethers,
    nameOrAbi,
    bytecodeOrSigner as any | string, // TODO ethers.utils.ArrayIsh
    signer
  );
}

export async function getContractFactoryByName(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer
) {
  if (signer === undefined) {
    const signers = await bre.ethers.getSigners();
    signer = signers[0];
  }

  const artifact = await readArtifact(bre.config.paths.artifacts, name);
  const bytecode = artifact.bytecode;
  return new ethers.ContractFactory(artifact.abi, bytecode, signer);
}

export async function getContractFactoryByAbiAndBytecode(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: any | string, // TODO ethers.utils.ArrayIsh
  signer?: EthersT.Signer
) {
  if (signer === undefined) {
    const signers = await bre.ethers.getSigners();
    signer = signers[0];
  }

  return new ethers.ContractFactory(abi, bytecode, signer);
}

export async function getContractAt(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  address: string,
  signer?: EthersT.Signer
) {
  if (typeof nameOrAbi === "string") {
    const factory = await getContractFactoryByName(
      bre,
      ethers,
      nameOrAbi,
      signer
    );
    return factory.attach(address);
  }

  if (signer === undefined) {
    const signers = await bre.ethers.getSigners();
    signer = signers[0];
  }

  return new ethers.Contract(address, nameOrAbi, signer);
}

export async function getContract(
  env: BuidlerRuntimeEnvironment,
  ethers: any,
  contractName: string,
  signer?: EthersT.Signer
): Promise<EthersT.Contract> {
  const deployments = (env as any).deployments;
  if (deployments !== undefined) {
    const contract = (await deployments.get(contractName)) as any;
    if (contract === undefined) {
      throw new Error(`No Contract deployed with name ${contractName}`);
    }
    return getContractAt(
      env,
      ethers,
      contract.abi || (contract.contractInfo && contract.contractInfo.abi),
      contract.address,
      signer
    );
  }
  throw new Error(
    `No Deployment Plugin Installed, try usePlugin("buidler-deploy")`
  );
}

import { readArtifact } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment, Artifact } from "@nomiclabs/buidler/types";
import EthersT from "ethers";

export async function getSigners(bre: BuidlerRuntimeEnvironment) {
  const accounts = await bre.ethers.provider.listAccounts();
  return accounts.map((account: string) =>
    bre.ethers.provider.getSigner(account)
  );
}

function _getSigner(
  bre: BuidlerRuntimeEnvironment,
  signer: EthersT.Signer | string
): EthersT.Signer {
  if (typeof signer === "string") {
    return bre.ethers.provider.getSigner(signer);
  }
  return signer;
}

async function _getArtifact(
  bre: BuidlerRuntimeEnvironment,
  name: string
): Promise<Artifact> {
  const deployments = (bre as any).deployments;
  if (deployments !== undefined) {
    return deployments.getArtifact(name);
  }
  return readArtifact(bre.config.paths.artifacts, name);
}

export async function getSigner(
  bre: BuidlerRuntimeEnvironment,
  address: string
) {
  return _getSigner(bre, address);
}

export function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer | string
): Promise<EthersT.ContractFactory>;

export function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: EthersT.BytesLike,
  signer?: EthersT.Signer | string
): Promise<EthersT.ContractFactory>;

export async function getContractFactory(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  bytecodeOrSigner?: EthersT.Signer | EthersT.BytesLike,
  signer?: EthersT.Signer | string
) {
  if (typeof nameOrAbi === "string") {
    return getContractFactoryByName(
      bre,
      ethers,
      nameOrAbi,
      bytecodeOrSigner as EthersT.Signer | string | undefined
    );
  }

  return getContractFactoryByAbiAndBytecode(
    bre,
    ethers,
    nameOrAbi,
    bytecodeOrSigner as EthersT.BytesLike,
    signer
  );
}

export async function getContractFactoryByName(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer | string
) {
  if (signer === undefined) {
    const signers = await bre.ethers.getSigners();
    signer = signers[0];
  } else if (signer === "string") {
    signer = _getSigner(bre, signer);
  }

  const artifact = await _getArtifact(bre, name);
  const bytecode = artifact.bytecode;
  return new ethers.ContractFactory(artifact.abi, bytecode, signer);
}

export async function getContractFactoryByAbiAndBytecode(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: EthersT.BytesLike,
  signer?: EthersT.Signer | string
) {
  if (signer === undefined) {
    const signers = await bre.ethers.getSigners();
    signer = signers[0];
  } else if (signer === "string") {
    signer = _getSigner(bre, signer);
  }

  return new ethers.ContractFactory(abi, bytecode, signer);
}

export async function getContractAt(
  bre: BuidlerRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  address: string,
  signer?: EthersT.Signer | string
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
  } else if (signer === "string") {
    signer = _getSigner(bre, signer);
  }

  return new ethers.Contract(address, nameOrAbi, signer);
}

export async function getContract(
  env: BuidlerRuntimeEnvironment,
  ethers: any,
  contractName: string,
  signer?: EthersT.Signer | string
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

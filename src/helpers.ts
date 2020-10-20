import {
  HardhatRuntimeEnvironment,
  Artifact,
  NetworkConfig
} from "hardhat/types";
import EthersT, { BigNumber } from "ethers";

export async function getSigners(hre: HardhatRuntimeEnvironment) {
  const accounts = await hre.ethers.provider.listAccounts();
  return accounts.map((account: string) =>
    hre.ethers.provider.getSigner(account)
  );
}

function _getSigner(
  hre: HardhatRuntimeEnvironment,
  signer: EthersT.Signer | string
): EthersT.Signer {
  if (typeof signer === "string") {
    return hre.ethers.provider.getSigner(signer);
  }
  return signer;
}

async function _getArtifact(
  hre: HardhatRuntimeEnvironment,
  name: string
): Promise<Artifact> {
  const deployments = (hre as any).deployments;
  if (deployments !== undefined) {
    return deployments.getArtifact(name);
  }
  return hre.artifacts.readArtifact(name);
}

export async function getSigner(
  hre: HardhatRuntimeEnvironment,
  address: string
) {
  return _getSigner(hre, address);
}

export function getContractFactory(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer | string
): Promise<EthersT.ContractFactory>;

export function getContractFactory(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: EthersT.BytesLike,
  signer?: EthersT.Signer | string
): Promise<EthersT.ContractFactory>;

export async function getContractFactory(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  bytecodeOrSigner?: EthersT.Signer | EthersT.BytesLike,
  signer?: EthersT.Signer | string
) {
  if (typeof nameOrAbi === "string") {
    return getContractFactoryByName(
      hre,
      ethers,
      nameOrAbi,
      bytecodeOrSigner as EthersT.Signer | string | undefined
    );
  }

  return getContractFactoryByAbiAndBytecode(
    hre,
    ethers,
    nameOrAbi,
    bytecodeOrSigner as EthersT.BytesLike,
    signer
  );
}

export async function getContractFactoryByName(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  name: string,
  signer?: EthersT.Signer | string
) {
  if (signer === undefined) {
    const signers = await hre.ethers.getSigners();
    signer = signers[0];
  } else if (typeof signer === "string") {
    signer = _getSigner(hre, signer);
  }

  const artifact = await _getArtifact(hre, name);
  const bytecode = artifact.bytecode;
  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    hre.network.config,
    artifact.abi
  );
  return new ethers.ContractFactory(abiWithAddedGas, bytecode, signer);
}

export async function getContractFactoryByAbiAndBytecode(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  abi: any[],
  bytecode: EthersT.BytesLike,
  signer?: EthersT.Signer | string
) {
  if (signer === undefined) {
    const signers = await hre.ethers.getSigners();
    signer = signers[0];
  } else if (typeof signer === "string") {
    signer = _getSigner(hre, signer);
  }

  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    hre.network.config,
    abi
  );
  return new ethers.ContractFactory(abiWithAddedGas, bytecode, signer);
}

export async function getContractAt(
  hre: HardhatRuntimeEnvironment,
  ethers: any,
  nameOrAbi: string | any[],
  address: string,
  signer?: EthersT.Signer | string
) {
  if (typeof nameOrAbi === "string") {
    const factory = await getContractFactoryByName(
      hre,
      ethers,
      nameOrAbi,
      signer
    );
    return factory.attach(address);
  }

  if (signer === undefined) {
    const signers = await hre.ethers.getSigners();
    signer = signers[0];
  } else if (typeof signer === "string") {
    signer = _getSigner(hre, signer);
  }

  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    hre.network.config,
    nameOrAbi
  );
  return new ethers.Contract(address, abiWithAddedGas, signer);
}

export async function getContract(
  env: HardhatRuntimeEnvironment,
  ethers: any,
  contractName: string,
  signer?: EthersT.Signer | string
): Promise<EthersT.Contract> {
  const contract = await getContractOrNull(env, ethers, contractName, signer);
  if (contract === null) {
    throw new Error(`No Contract deployed with name ${contractName}`);
  }
  return contract;
}

export async function getContractOrNull(
  env: HardhatRuntimeEnvironment,
  ethers: any,
  contractName: string,
  signer?: EthersT.Signer | string
): Promise<EthersT.Contract | null> {
  const deployments = (env as any).deployments;
  if (deployments !== undefined) {
    const get = deployments.getOrNull || deployments.get; // fallback for older version of buidler-deploy // TODO remove on 1.0.0
    const contract = (await get(contractName)) as any;
    if (contract === undefined) {
      return null;
    }
    const abi =
      contract.abi || (contract.contractInfo && contract.contractInfo.abi); // fallback for older version of buidler-deploy // TODO remove on 1.0.0
    const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
      env.network.config,
      abi
    );
    return getContractAt(
      env,
      ethers,
      abiWithAddedGas,
      contract.address,
      signer
    );
  }
  throw new Error(
    `No Deployment Plugin Installed, try usePlugin("buidler-deploy")`
  );
}

// taken from : https://github.com/nomiclabs/buidler/pull/648/files
// This helper adds a `gas` field to the ABI function elements if the network
// is set up to use a fixed amount of gas.
// This is done so that ethers doesn't automatically estimate gas limits on
// every call.
function addGasToAbiMethodsIfNecessary(
  networkConfig: NetworkConfig,
  abi: any[]
): any[] {
  if (networkConfig.gas === "auto" || networkConfig.gas === undefined) {
    return abi;
  }

  // ethers adds 21000 to whatever the abi `gas` field has.
  // see https://github.com/ethers-io/ethers.js/blob/1a4f7d1b53050b69a85b1afbab11a2761f22f5bb/packages/contracts/src.ts/index.ts#L208-L211
  // This may lead to OOG errors, as people may set the default gas to the same value as the
  // block gas limit, especially on Buidler EVM.
  // To avoid this, we substract 21000.
   // HOTFIX: We substract 1M for now. See: https://github.com/ethers-io/ethers.js/issues/1058#issuecomment-703175279 
  const gasLimit = BigNumber.from(networkConfig.gas)
    .sub(1000000)
    .toHexString();

  const modifiedAbi: any[] = [];

  for (const abiElement of abi) {
    if (abiElement.type !== "function") {
      modifiedAbi.push(abiElement);
      continue;
    }

    modifiedAbi.push({
      ...abiElement,
      gas: gasLimit
    });
  }

  return modifiedAbi;
}

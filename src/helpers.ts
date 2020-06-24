import { readArtifact } from "@nomiclabs/buidler/plugins";
import {
  BuidlerRuntimeEnvironment,
  Artifact,
  NetworkConfig
} from "@nomiclabs/buidler/types";
import EthersT, { BigNumber } from "ethers";

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
  } else if (typeof signer === "string") {
    signer = _getSigner(bre, signer);
  }

  const artifact = await _getArtifact(bre, name);
  const bytecode = artifact.bytecode;
  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    bre.network.config,
    artifact.abi
  );
  return new ethers.ContractFactory(abiWithAddedGas, bytecode, signer);
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
  } else if (typeof signer === "string") {
    signer = _getSigner(bre, signer);
  }

  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    bre.network.config,
    abi
  );
  return new ethers.ContractFactory(abiWithAddedGas, bytecode, signer);
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
  } else if (typeof signer === "string") {
    signer = _getSigner(bre, signer);
  }

  const abiWithAddedGas = addGasToAbiMethodsIfNecessary(
    bre.network.config,
    nameOrAbi
  );
  return new ethers.Contract(address, abiWithAddedGas, signer);
}

export async function getContract(
  env: BuidlerRuntimeEnvironment,
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
  env: BuidlerRuntimeEnvironment,
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
  const gasLimit = BigNumber.from(networkConfig.gas)
    .sub(21000)
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

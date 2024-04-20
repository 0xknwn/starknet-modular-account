import { classHash } from "./class";
import { Contract, Account, hash, ec } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";
import { udcAddress } from "./natives";

/**
 * Calculates the contract address for a given contract name, deployer address,
 * and constructor call data.
 * @param contractName - The name of the contract.
 * @param deployerAddress - The address of the deployer.
 * @param constructorCallData - The constructor call data.
 * @returns The contract address.
 */
export const contractAddress = async (
  contractName: string,
  deployerAddress: string,
  constructorCallData: string[]
): Promise<string> => {
  const class_hash = classHash(contractName);
  // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
  // to understand the calculateContractAddressFromHash function works with the UDC
  return hash.calculateContractAddressFromHash(
    ec.starkCurve.pedersen(deployerAddress, 0),
    class_hash,
    constructorCallData,
    udcAddress
  );
};

/**
 * Calculates the account address for a given account name, public key, and constructor call data.
 * @param accountName - The name of the account used in this project.
 * @param publicKey - The public key associated with the account.
 * @param constructorCallData - The constructor call data for the account.
 * @returns The calculated account address.
 * @remarks This function requires the cairo account to be compiled with the
 * `scarb build` command at the root of the project.
 */
export const accountAddress = (
  accountName: string,
  publicKey: string,
  constructorCallData: string[]
): string => {
  const class_hash = classHash(accountName);
  return hash.calculateContractAddressFromHash(
    publicKey,
    class_hash,
    constructorCallData,
    0
  );
};

/**
 * Deploys a contract on Starknet.
 *
 * @param contractName - The name of the contract to deploy.
 * @param deployerAccount - The account that will deploy the contract.
 * @param constructorCalldata - The constructor calldata for the contract.
 * @returns A Promise that resolves to a Contract instance representing the deployed contract.
 */
export const deployContract = async (
  contractName: string,
  deployerAccount: Account,
  constructorCalldata: any[]
): Promise<Contract> => {
  const classH = classHash(contractName);
  // check if the contract is already deployed and if it has been, return the
  // contract instance, otherwise continue with the deployment
  try {
    let address = await contractAddress(
      contractName,
      deployerAccount.address,
      constructorCalldata
    );
    const v = await deployerAccount.getContractVersion(address);
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(CounterABI, address, deployerAccount);
    }
  } catch (e) {}

  const deployResponse = await deployerAccount.deployContract({
    classHash: classH,
    constructorCalldata: constructorCalldata,
    salt: "0x0",
  });
  await deployerAccount.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(
    CounterABI,
    deployResponse.contract_address,
    deployerAccount
  );
};

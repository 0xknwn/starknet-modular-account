import { classHash } from "./class";
import { Contract, Account, hash, ec } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";
import { udcAddress, ETH } from "./natives";
import { initial_EthTransfer } from "./parameters";

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

/**
 * Deploys an account on the StarkNet network.
 *
 * @param deployerAccount - The account used to deploy the new account.
 * @param accountName - The name of the account to be deployed.
 * @param publicKey - The public key associated with the account.
 * @param constructorCalldata - The constructor calldata required for deploying the account.
 * @returns The address of the deployed account.
 * @throws Error if the deployment fails.
 */
export const deployAccount = async (
  deployerAccount: Account,
  accountName: string,
  publicKey: string,
  constructorCalldata: any[]
) => {
  if (!accountName) {
    throw new Error(`the account name is required`);
  }
  const computedClassHash = classHash(accountName);
  const computedAccountAddress = accountAddress(
    accountName,
    publicKey,
    constructorCalldata
  );
  // check if the account is already deployed and if it has been, return the
  // account instance, otherwise continue with the deployment
  try {
    const deployedClassHash = await deployerAccount.getClassHashAt(
      computedAccountAddress
    );
    if (deployedClassHash !== computedClassHash) {
      throw new Error(
        `Class mismatch: expect ${computedClassHash}, got ${deployedClassHash}`
      );
    }
    return computedAccountAddress;
  } catch (e) {}

  // transfer some eth to the account
  const { transaction_hash } = await ETH(deployerAccount).transfer(
    computedAccountAddress,
    initial_EthTransfer
  );
  let receipt = await deployerAccount.waitForTransaction(transaction_hash);
  if (!receipt.isSuccess()) {
    throw new Error(
      `Failed to transfer eth to account: ${receipt.statusReceipt}`
    );
  }

  // deploy the account and return the associated address
  const { transaction_hash: tx, contract_address: account_address } =
    await deployerAccount.deployAccount({
      classHash: computedClassHash,
      constructorCalldata,
      addressSalt: publicKey,
    });
  receipt = await deployerAccount.waitForTransaction(tx);
  if (!receipt.isSuccess()) {
    throw new Error(`Failed to deploy account: ${receipt.status}`);
  }
  return account_address;
};

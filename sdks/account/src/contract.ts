import { Account, hash, ec, Uint256 } from "starknet";
import { udcAddress, ETH } from "./protocol";
import { classHash } from "./class";
/**
 * Calculates the contract address for a given contract name, deployer address,
 * and constructor call data.
 * @param class_hash - The class hash of the contract.
 * @param deployerAddress - The address of the deployer.
 * @param constructorCallData - The constructor call data.
 * @returns The contract address.
 */
export const contractAddress = async (
  class_hash: string,
  deployerAddress: string,
  constructorCallData: string[]
): Promise<string> => {
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
 * @param class_hash - The class hash of the contract.
 * @param publicKey - The public key associated with the account.
 * @param constructorCallData - The constructor call data for the account.
 * @returns The calculated account address.
 * @remarks This function requires the cairo account to be compiled with the
 * `scarb build` command at the root of the project.
 */
export const accountAddress = (
  accountName: "SmartrAccount",
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
  accountName: "SmartrAccount",
  publicKey: string,
  constructorCalldata: any[],
  initial_EthTransfer: Uint256
) => {
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
    if (deployedClassHash !== classHash(accountName)) {
      throw new Error(
        `Class mismatch: expect ${classHash(
          accountName
        )}, got ${deployedClassHash}`
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
      classHash: classHash(accountName),
      constructorCalldata,
      addressSalt: publicKey,
    });
  receipt = await deployerAccount.waitForTransaction(tx);
  if (!receipt.isSuccess()) {
    throw new Error(`Failed to deploy account: ${receipt.status}`);
  }
  return account_address;
};

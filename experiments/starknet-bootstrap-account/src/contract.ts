import { classHash } from "./class";
import { Account, hash, ec } from "starknet";
import { ETH } from "./protocol";
import { initial_EthTransfer } from "./parameters";

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
  accountName: "BootstrapAccount",
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
  accountName: "BootstrapAccount",
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

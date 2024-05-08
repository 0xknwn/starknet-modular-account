import { Account, Contract, hash, num } from "starknet";
import { classHash } from "./class";
import { ABI as ERC20ABI } from "./abi/ERC20";
import { ethAddress } from "./natives";
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
  salt: string,
  constructorCallData: string[]
): string => {
  const class_hash = classHash(accountName);
  return hash.calculateContractAddressFromHash(
    salt,
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
  salt: string,
  constructorCalldata: any[]
) => {
  const computedAccountAddress = accountAddress(
    accountName,
    salt,
    constructorCalldata
  );
  if (computedAccountAddress !== deployerAccount.address) {
    throw new Error(
      "the deployer account should match the account being deployed"
    );
  }

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

  // Check if the account has enough eth to deploy the account
  const eth = new Contract(ERC20ABI, ethAddress, deployerAccount);
  const result = await eth.call("balance_of", [computedAccountAddress]);
  const balance = num.toBigInt(result.toString());
  if (balance <= 10n ** 15n) {
    throw new Error(
      `Insufficient balance to deploy account: ${balance.toString()}`
    );
  }

  // deploy the account and return the associated address
  const { transaction_hash: tx, contract_address: account_address } =
    await deployerAccount.deployAccount(
      {
        classHash: classHash(accountName),
        constructorCalldata,
        addressSalt: salt,
      },
      // @todo: remove this once the fee is fixed
      { maxFee: "0x2000000000000" }
    );
  const receipt = await deployerAccount.waitForTransaction(tx);
  if (!receipt.isSuccess()) {
    throw new Error(`Failed to deploy account: ${receipt.status}`);
  }
  return account_address;
};

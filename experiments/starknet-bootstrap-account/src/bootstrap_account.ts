import { Account, CallData } from "starknet";
import { ABI as AccountABI } from "./abi/BootstrapAccount";
import { accountAddress, deployAccount } from "starknet-test-helpers";

/**
 * Generates a Bootstrap account address based on the provided public key.
 * @param publicKey - The public key associated with the account.
 * @returns The generated account address.
 */
export const bootstrapAccountAddress = (
  publicKey: string,
  targetClass: string
): string => {
  const calldata = new CallData(AccountABI).compile("constructor", {
    public_key: publicKey,
    target_class: targetClass,
  });
  return accountAddress("BootstrapAccount", publicKey, calldata);
};

/**
 * Deploys a failing account on the StarkNet network.
 *
 * @param deployerAccount - The account used to deploy the simple account.
 * @param publicKey - The public key associated with the simple account.
 * @returns A promise that resolves to the deployed simple account.
 */
export const deployBootstrapAccount = async (
  deployerAccount: Account,
  publicKey: string,
  targetClass: string
) => {
  const callData = new CallData(AccountABI).compile("constructor", {
    public_key: publicKey,
    target_class: targetClass,
  });
  return await deployAccount(
    deployerAccount,
    "BootstrapAccount",
    publicKey,
    callData
  );
};

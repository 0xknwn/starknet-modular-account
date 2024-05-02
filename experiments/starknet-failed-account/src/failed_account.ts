import { Account, CallData } from "starknet";
import { ABI as AccountABI } from "./abi/FailedAccount";
import { accountAddress, deployAccount } from "./contract";

/**
 * Generates a failed account address based on the provided public key.
 * @param publicKey - The public key associated with the account.
 * @returns The generated account address.
 */
export const failedAccountAddress = (publicKey: string): string => {
  const calldata = new CallData(AccountABI).compile("constructor", {
    public_key: publicKey,
  });
  return accountAddress("FailedAccount", publicKey, calldata);
};

/**
 * Deploys a failing account on the StarkNet network.
 *
 * @param deployerAccount - The account used to deploy the simple account.
 * @param publicKey - The public key associated with the simple account.
 * @returns A promise that resolves to the deployed simple account.
 */
export const deployFailedAccount = async (
  deployerAccount: Account,
  publicKey: string
) => {
  const callData = new CallData(AccountABI).compile("constructor", {
    public_key: publicKey,
  });
  return await deployAccount(
    deployerAccount,
    "FailedAccount",
    publicKey,
    callData
  );
};

import { Account, CallData, type UniversalDetails } from "starknet";
import { ABI as SimpleAccountABI } from "./abi/SimpleAccount";
import { accountAddress, deployAccount } from "./contract";
import { classNames } from "@0xknwn/starknet-contracts";
export { SimpleAccountABI };

/**
 * Generates a simple account address based on the provided public key and
 * additional data.
 * @param publicKey - The public key associated with the account.
 * @param more - Additional data for the account.
 * @returns The generated account address.
 */
export const simpleAccountAddress = (
  publicKey: string,
  more: string
): string => {
  const calldata = new CallData(SimpleAccountABI).compile("constructor", {
    public_key: publicKey,
    more: more,
  });
  return accountAddress(classNames.SimpleAccount, publicKey, calldata);
};

/**
 * Deploys a simple account on the StarkNet network.
 *
 * @param deployerAccount - The account used to deploy the simple account.
 * @param publicKey - The public key associated with the simple account.
 * @param more - Additional information for the simple account.
 * @returns A promise that resolves to the deployed simple account.
 */
export const deploySimpleAccount = async (
  deployerAccount: Account,
  publicKey: string,
  more: string,
  details?: UniversalDetails
) => {
  const callData = new CallData(SimpleAccountABI).compile("constructor", {
    public_key: publicKey,
    more: more,
  });
  return await deployAccount(
    deployerAccount,
    classNames.SimpleAccount,
    publicKey,
    callData,
    details
  );
};

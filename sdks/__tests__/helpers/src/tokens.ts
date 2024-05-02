import { Contract, RpcProvider, Account, CallData, uint256 } from "starknet";
import { deployContract } from "./contract";
import { ABI as TokenAABI } from "./abi/TokenA";
import { ABI as TokenBABI } from "./abi/TokenB";

import { contractAddress } from "./contract";

/**
 * Retrieves the token A address.
 *
 * @param deployerAddress - The address of the deployer.
 * @param recipientAddress - The address of the recipient.
 * @param ownerAddress - The address of the owner.
 * @returns The token A address.
 */
export const tokenAAddress = async (
  deployerAddress: string,
  recipientAddress: string,
  ownerAddress: string
) =>
  contractAddress("TokenA", deployerAddress, [recipientAddress, ownerAddress]);

/**
 * Deploys the TokenA contract.
 * @param deployerAccount - The deployer account.
 * @param ownerAddress - The owner address.
 * @returns A Promise that resolves to the deployed Counter contract.
 */
export const deployTokenA = async (
  deployerAccount: Account,
  recipientAddress: string,
  ownerAddress: string
): Promise<Contract> => {
  const myCallData = new CallData(TokenAABI);
  const _calldata = myCallData.compile("constructor", {
    recipient: recipientAddress,
    owner: ownerAddress,
  });
  return deployContract("TokenA", TokenAABI, deployerAccount, _calldata);
};

/**
 * Retrieves the token B address.
 *
 * @param deployerAddress - The address of the deployer.
 * @param recipientAddress - The address of the recipient.
 * @param ownerAddress - The address of the owner.
 * @returns The token B address.
 */
export const tokenBAddress = async (
  deployerAddress: string,
  recipientAddress: string,
  ownerAddress: string
) =>
  contractAddress("TokenB", deployerAddress, [recipientAddress, ownerAddress]);

/**
 * Deploys the TokenB contract.
 * @param deployerAccount - The deployer account.
 * @param ownerAddress - The owner address.
 * @returns A Promise that resolves to the deployed Counter contract.
 */
export const deployTokenB = async (
  deployerAccount: Account,
  recipientAddress: string,
  ownerAddress: string
): Promise<Contract> => {
  const myCallData = new CallData(TokenBABI);
  const _calldata = myCallData.compile("constructor", {
    recipient: recipientAddress,
    owner: ownerAddress,
  });
  return deployContract("TokenB", TokenBABI, deployerAccount, _calldata);
};

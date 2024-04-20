import { classHash } from "./class";
import { Contract, RpcProvider, Account, CallData } from "starknet";
import { deployContract } from "./contract";
import { ABI as TokenAABI } from "./abi/TokenA";
import { ABI as TokenBABI } from "./abi/TokenB";

import { ABI as ERC20ABI } from "./abi/TokenA";
import { contractAddress } from "./contract";

/**
/**
 * Represents an instance of the ERC20 contract.
 */
export class ERC20 extends Contract {
  /**
   * Constructs a new instance of the `Token` class.
   * @param provider The RPC provider or account to use for interacting with the contract.
   * @param address The address pf the token.
   */
  constructor(address: string, provider: RpcProvider | Account) {
    super(ERC20ABI, address, provider);
  }

  /**
   * Retrieves the balance of the specified address.
   * @param address - The address to retrieve the balance for.
   * @returns A promise that resolves to the balance of the address as a bigint.
   */
  async balanceOf(address: string): Promise<bigint> {
    return this.balanceOf(address);
  }

  /**
   * Transfers a specified amount of tokens to the given address.
   *
   * @param recipient - The address to which the tokens will be transferred.
   * @param amount - The amount of tokens to transfer.
   * @throws {Error} - Throws an error when interacting with a RpcProvider and
   * not an Account.
   */
  async transfer(recipient: string, amount: bigint) {
    const account = this.providerOrAccount as Account;
    if (!account?.address) {
      throw new Error("Using ETH transfer without an account is not supported");
    }
    const call = this.populate("transfer", { recipient, amount });
    return await account.execute(call);
  }
}

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
  return deployContract("TokenA", deployerAccount, _calldata);
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
  return deployContract("TokenB", deployerAccount, _calldata);
};

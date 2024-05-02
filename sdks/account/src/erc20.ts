import { Contract, RpcProvider, Account } from "starknet";

import { ABI as ERC20ABI } from "./abi/ERC20";
import { type Uint256 } from "starknet";

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
  async balanceOf(address: string) {
    const ETH = new Contract(ERC20ABI, address, this.providerOrAccount);
    return await ETH.call("balance_of", [address]);
  }

  /**
   * Transfers a specified amount of tokens to the given address.
   *
   * @param recipient - The address to which the tokens will be transferred.
   * @param amount - The amount of tokens to transfer.
   * @throws {Error} - Throws an error when interacting with a RpcProvider and
   * not an Account.
   */
  async transfer(recipient: string, amount: Uint256) {
    const account = this.providerOrAccount as Account;
    if (!account?.address) {
      throw new Error("Using ETH transfer without an account is not supported");
    }
    const call = this.populate("transfer", { recipient, amount });
    return await account.execute(call);
  }
}

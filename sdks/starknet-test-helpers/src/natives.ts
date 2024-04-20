import { Contract, RpcProvider, Account } from "starknet";
import { ABI as ERC20ABI } from "./abi/TokenA";

const ethAddress =
  "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";

const strkAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/**
 * The address of the UDC (Universal Deployer Contract) in the StarkNet network.
 */
export const udcAddress = BigInt(
  "0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"
);

const ERC20 = (provider: RpcProvider, address: string) => {
  const contract = new Contract(ERC20ABI, address, provider).typedv2(ERC20ABI);
  return contract;
};

/**
 * Creates an instance of the STARK contract.
 *
 * @param provider - The RpcProvider or Account used to interact with the token
 * @returns An instance of the STARK contract.
 */
export const STRK = (provider: RpcProvider) => ERC20(provider, strkAddress);

/**
/**
 * Represents an instance of the ETH contract.
 */
export class ETH extends Contract {
  /**
   * Constructs a new instance of the `ETH` class.
   * @param provider The RPC provider or account to use for interacting with the contract.
   */
  constructor(provider: RpcProvider | Account) {
    super(ERC20ABI, ethAddress, provider);
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

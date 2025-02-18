import { RpcProvider, Account, Contract } from "starknet";
import { ABI as ERC20ABI } from "./abi/ERC20";

export const strkAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/**
 * The address of the UDC (Universal Deployer Contract) in the StarkNet network.
 */
export const udcAddress = BigInt(
  "0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"
);

/**
 * Creates an instance of the STARK contract.
 *
 * @param provider - The RpcProvider or Account used to interact with the token
 * @returns An instance of the STARK contract.
 */
export const STRK = (provider: RpcProvider | Account) =>
  new Contract(ERC20ABI, strkAddress, provider);

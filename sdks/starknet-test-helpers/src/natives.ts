import { Contract, RpcProvider } from "starknet";
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
 * Creates an instance of the ETH contract.
 *
 * @param provider - The RpcProvider or Account used to interact with the token
 * @returns An instance of the ETH contract.
 */
export const ETH = (provider: RpcProvider) => ERC20(provider, ethAddress);

/**
 * Creates an instance of the STARK contract.
 *
 * @param provider - The RpcProvider or Account used to interact with the token
 * @returns An instance of the STARK contract.
 */
export const STRK = (provider: RpcProvider) => ERC20(provider, strkAddress);

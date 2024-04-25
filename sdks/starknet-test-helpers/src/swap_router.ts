import { Contract, Call, Account, CallData } from "starknet";
import { ABI as SwapRouterABI } from "./abi/SwapRouter";
import { contractAddress, deployContract } from "./contract";
import { ERC20 } from "./tokens";
import { type Uint256 } from "starknet";
/**
 * Retrieves the swap router address from its deployer and owner.
 * @param deployerAddress - The address of the deployer.
 * @param ownerAddress - The address of the owner.
 * @returns The address of the swap router contract.
 */
export const swapRouterAddress = async (
  deployerAddress: string,
  ownerAddress: string
) => {
  const myCallData = new CallData(SwapRouterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: ownerAddress,
  });
  return await contractAddress("SwapRouter", deployerAddress, _calldata);
};

/**
 * Deploys the SwapRouter contract.
 * @param deployerAccount - The deployer account.
 * @param ownerAddress - The owner address.
 * @returns A Promise that resolves to the deployed Counter contract.
 */
export const deploySwapRouter = async (
  deployerAccount: Account,
  ownerAddress: string
): Promise<Contract> => {
  const myCallData = new CallData(SwapRouterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: ownerAddress,
  });
  return deployContract(
    "SwapRouter",
    SwapRouterABI,
    deployerAccount,
    _calldata
  );
};

/**
 * Represents a Swap contract.
 */
export class SwapRouter extends Contract {
  /**
   * Creates an instance of the Counter contract.
   * @param address The address of the contract.
   * @param account The account used to interact with the contract.
   */
  constructor(address: string, account: Account) {
    super(SwapRouterABI, address, account);
  }

  /**
   * Sends a request to the faucet to receive a specified amount of Token A.
   * @param amount - The amount of tokens to request from the faucet.
   * @returns A promise that resolves to the transaction receipt once the transfer is complete.
   */
  async faucet(amount: Uint256) {
    let call: Call = this.populate("faucet", {
      amount,
    });
    const a = this.providerOrAccount as Account;
    const { transaction_hash: transferTxHash } = await a.execute(call);
    return await a.waitForTransaction(transferTxHash);
  }

  /**
   * Sets the token addresses for tokenA and tokenB.
   *
   * @param tokenAAddress - The address of tokenA.
   * @param tokenBAddress - The address of tokenB.
   * @returns A promise that resolves to the transaction receipt once the transaction is confirmed.
   */
  async set_tokens(tokenAAddress: string, tokenBAddress: string) {
    let call: Call = this.populate("set_tokens", {
      tokenAAddress,
      tokenBAddress,
    });
    const a = this.providerOrAccount as Account;
    const { transaction_hash: transferTxHash } = await a.execute(call);
    return await a.waitForTransaction(transferTxHash);
  }

  /**
   * Sets the conversion rate for the swap router.
   * @param rate - The conversion rate to be set.
   * @returns A promise that resolves to the transaction receipt once the conversion rate is set.
   */
  async set_conversion_rate(rate: string) {
    let call: Call = this.populate("set_conversion_rate", {
      rate,
    });
    const a = this.providerOrAccount as Account;
    const { transaction_hash: transferTxHash } = await a.execute(call);
    return await a.waitForTransaction(transferTxHash);
  }

  /**
   * Retrieves the conversion rate.
   * @returns A promise that resolves to a bigint representing the conversion rate.
   */
  async get_conversion_rate(): Promise<bigint> {
    return await this.get_conversion_rate();
  }

  /**
   * Swaps a specified amount of a token for another token.
   * @param tokenAAddress The address of the token to be swapped.
   * @param amount The amount of the token to be swapped.
   * @returns A promise that resolves to the transaction receipt once the swap is completed.
   */
  async swap(tokenAAddress: string, amount: Uint256) {
    const a = this.providerOrAccount as Account;
    if (!a.address) {
      throw new Error("Account address is undefined");
    }
    const tokenAContract = new ERC20(tokenAAddress, a);
    let approveCall: Call = tokenAContract.populate("approve", {
      spender: this.address,
      amount,
    });
    let swapCall: Call = this.populate("swap", {
      amount,
    });
    const { transaction_hash: transferTxHash } = await a.execute([
      approveCall,
      swapCall,
    ]);
    return await a.waitForTransaction(transferTxHash);
  }

  /**
   * Executes a swap with a minimum rate and amount.
   * @param tokenAAddress - The address of the token A.
   * @param rate - The rate of the swap.
   * @param amount - The amount to swap.
   * @returns A promise that resolves to the transaction receipt of the swap.
   */
  async swap_minimum_at(tokenAAddress: string, rate: string, amount: Uint256) {
    const a = this.providerOrAccount as Account;
    const tokenAContract = new ERC20(tokenAAddress, a);
    let approveCall: Call = tokenAContract.populate("approve", {
      spender: a.address,
      amount,
    });
    let swapCall: Call = this.populate("swap_minimum_at", {
      rate,
      amount,
    });
    const { transaction_hash: transferTxHash } = await a.execute([
      approveCall,
      swapCall,
    ]);
    return await a.waitForTransaction(transferTxHash);
  }

  /**
   * Swaps the maximum amount of tokens at a given rate.
   *
   * @param tokenAAddress - The address of the token A.
   * @param rate - The rate at which to swap the tokens.
   * @param amount - The amount of tokens to swap.
   * @returns A promise that resolves to the transaction receipt of the swap.
   */
  async swap_maximum_at(tokenAAddress: string, rate: string, amount: Uint256) {
    const a = this.providerOrAccount as Account;
    const tokenAContract = new ERC20(tokenAAddress, a);
    let approveCall: Call = tokenAContract.populate("approve", {
      spender: a.address,
      amount,
    });
    let swapCall: Call = this.populate("swap_maximum_at", {
      rate,
      amount,
    });
    const { transaction_hash: transferTxHash } = await a.execute([
      approveCall,
      swapCall,
    ]);
    return await a.waitForTransaction(transferTxHash);
  }
}

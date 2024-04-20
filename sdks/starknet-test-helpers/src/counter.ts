import { Contract, Call, Account, CallData } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";
import { contractAddress, deployContract } from "./contract";

/**
 * Retrieves the address of the Counter contract.
 * @param deployerAddress - The address of the deployer.
 * @param ownerAddress - The address of the owner.
 * @returns The address of the Counter contract.
 */
export const counterAddress = async (
  deployerAddress: string,
  ownerAddress: string
) => {
  const myCallData = new CallData(CounterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: ownerAddress,
  });
  return contractAddress("Counter", deployerAddress, _calldata);
};

/**
 * Deploys a Counter contract.
 * @param ownerAccount - The owner's account.
 * @param ownerAddress - The owner's address.
 * @returns A Promise that resolves to the deployed Counter contract.
 */
export const deployCounter = async (
  ownerAccount: Account,
  ownerAddress: string
): Promise<Contract> => {
  const myCallData = new CallData(CounterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: ownerAddress,
  });
  return deployContract("Counter", ownerAccount, _calldata);
};

export { CounterABI };

/**
 * Represents a Counter contract.
 */
export class Counter extends Contract {
  /**
   * Creates an instance of the Counter contract.
   * @param address The address of the contract.
   * @param account The account used to interact with the contract.
   */
  constructor(address: string, account: Account) {
    super(CounterABI, address, account);
  }

  /**
   * Increments the counter by 1.
   * @returns A promise that resolves to the result of the execution.
   */
  async increment() {
    let transferCall: Call = this.populate("increment", {});
    return await this.execute(transferCall);
  }

  /**
   * Increments the counter by the specified value.
   * @param value The value to increment the counter by.
   * @returns A promise that resolves to the result of the execution.
   */
  async increment_by(value: number) {
    let transferCall: Call = this.populate("increment_by", { value });
    return await this.execute(transferCall);
  }

  /**
   * Increments the counter by an array of numbers using a multicall of increment_by.
   * @param values The array of values to increment the counter by.
   * @returns A promise that resolves to the result of the execution.
   */
  async increment_by_multicall(values: number[]) {
    if (values.length === 0) {
      throw new Error("values should not be empty");
    }
    let transferCalls: Call[] = [];
    for (const value of values) {
      const transferCall: Call = this.populate("increment_by", { value });
      transferCalls.push(transferCall);
    }
    return await this.execute(transferCalls);
  }

  /**
   * Increments the counter by an array of numbers using increment_by_array.
   * @param args The array of values to increment the counter by.
   * @returns A promise that resolves to the result of the execution.
   */
  async increment_by_array(args: number[]) {
    if (!Array.isArray(args)) {
      throw new Error("args should not be empty");
    }
    let transferCall: Call = this.populate("increment_by_array", { args });
    return await this.execute(transferCall);
  }

  /**
   * Resets the counter.
   * @returns A promise that resolves to the result of the execution.
   * @remarks This function requires the Account used by the Counter to be its owner.
   */
  async reset() {
    let transferCall: Call = this.populate("reset", {});
    return await this.execute(transferCall);
  }

  /**
   * Gets the current value of the counter.
   * @returns A promise that contains the counter value.
   */
  async get(): Promise<bigint> {
    return await this.get();
  }
}

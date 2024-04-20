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

// export const increment = async (
//   a: Account,
//   counterAddress: string,
//   values: number[] | number = 1
// ) => {
//   if (!Array.isArray(values)) {
//     values = [values];
//   }
//   if (values.length === 0) {
//     throw new Error("values should not be empty");
//   }
//   const contract = new Contract(CounterABI, counterAddress, a).typedv2(
//     CounterABI
//   );
//   let transferCalls: Call[] = [];
//   for (const value of values) {
//     let transferCall: Call = contract.populate("increment", {});
//     if (value > 1) {
//       transferCall = contract.populate("increment_by", {
//         value: value,
//       });
//     }
//     transferCalls.push(transferCall);
//   }
//   const { transaction_hash: transferTxHash } = await a.execute(transferCalls);
//   return await a.waitForTransaction(transferTxHash);
// };

// export const increment_by_array = async (
//   a: Account,
//   counterAddress: string,
//   values: number[] | number = 1
// ) => {
//   if (!Array.isArray(values)) {
//     values = [values];
//   }
//   const contract = new Contract(CounterABI, counterAddress, a).typedv2(
//     CounterABI
//   );
//   const transferCall = contract.populate("increment_by_array", {
//     args: values,
//   });
//   let transferCalls: Call[] = [transferCall, transferCall];

//   const { transaction_hash: transferTxHash } = await a.execute(transferCalls);
//   return await a.waitForTransaction(transferTxHash);
// };

// export const reset = async (a: Account, counterAddress: string) => {
//   const contract = new Contract(CounterABI, counterAddress, a).typedv2(
//     CounterABI
//   );
//   const transferCall: Call = contract.populate("reset", {});
//   const { transaction_hash: transferTxHash } = await a.execute(transferCall);
//   return await a.waitForTransaction(transferTxHash);
// };

// export const get = async (a: Account, counterAddress: string) => {
//   const contract = new Contract(CounterABI, counterAddress, a).typedv2(
//     CounterABI
//   );
//   return await contract.get();
// };

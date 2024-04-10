import type { Call } from "starknet";
import { Account, Contract, Signer, type Signature } from "starknet";
import { ABI as AccountABI } from "./abi/SmartrAccount";

export const is_module = async (a: Account, class_hash: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  return await contract.is_module(class_hash);
};

export const add_module = async (a: Account, class_hash: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const transferCall: Call = contract.populate("add_module", {
    class_hash: class_hash,
    args: ["0x7", "0x8"],
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get_initialization = async (a: Account) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  return await contract.get_initialization("0x7");
};

export const remove_module = async (a: Account, class_hash: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const transferCall: Call = contract.populate("remove_module", {
    class_hash: class_hash,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

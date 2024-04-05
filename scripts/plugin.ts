import { Call, Account, Contract } from "starknet";
import { ABI as AccountABI } from "./abi/Account";
import { accountAddress } from "./account";

export const is_plugin = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(AccountABI, accountAddress(), a).typedv2(
    AccountABI
  );
  return await contract.is_plugin(class_hash);
};

export const add_plugin = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(AccountABI, accountAddress(), a).typedv2(
    AccountABI
  );
  const transferCall: Call = contract.populate("add_plugin", {
    class_hash: class_hash,
    calls: [],
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const remove_plugin = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(AccountABI, accountAddress(), a).typedv2(
    AccountABI
  );
  const transferCall: Call = contract.populate("remove_plugin", {
    class_hash: class_hash,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

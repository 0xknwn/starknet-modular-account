import { Signer } from "starknet";
import type { Call } from "starknet";
import { Account, Contract } from "starknet";
import { ABI as AccountABI } from "./abi/Account";
import { accountAddress } from "./account";

export const is_module = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(
    AccountABI,
    accountAddress("Account", env),
    a
  ).typedv2(AccountABI);
  return await contract.is_module(class_hash);
};

export const add_module = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(
    AccountABI,
    accountAddress("Account", env),
    a
  ).typedv2(AccountABI);
  const transferCall: Call = contract.populate("add_module", {
    class_hash: class_hash,
    args: ["0x7", "0x8"],
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get_initialization = async (
  a: Account,
  env: string = "devnet"
) => {
  const contract = new Contract(
    AccountABI,
    accountAddress("Account", env),
    a
  ).typedv2(AccountABI);
  return await contract.get_initialization("0x7");
};

export const remove_module = async (
  a: Account,
  class_hash: string,
  env: string = "devnet"
) => {
  const contract = new Contract(
    AccountABI,
    accountAddress("Account", env),
    a
  ).typedv2(AccountABI);
  const transferCall: Call = contract.populate("remove_module", {
    class_hash: class_hash,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export class SessionKey extends Signer {
  public contractAddress: string;
  public classHash: string;
  constructor(
    pk: Uint8Array | string,
    contractAddress: string,
    classHash: string
  ) {
    super(pk);
    this.contractAddress = contractAddress;
    this.classHash = classHash;
  }

  public prefix(): Call {
    return {
      contractAddress: this.contractAddress,
      entrypoint: "__module__validate__",
      calldata: [this.classHash],
    };
  }
}

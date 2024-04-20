import { ethTransfer } from "./utils";
import { classHash } from "./class";
import { hash, Account, CallData } from "starknet";
import { initial_EthTransfer } from "./constants";
import { ABI as AccountABI } from "./abi/SimpleAccount";

// accountAddress compute the account address from the account public key.
export const accountAddress = (
  name: string = "SimpleAccount",
  publicKey: string,
  more: string
): string => {
  if (name !== "SimpleAccount") {
    throw new Error(`Unsupported account class: ${name}`);
  }
  const AccountClassHash = classHash(name);
  const calldata = [publicKey, more];
  return hash.calculateContractAddressFromHash(
    publicKey,
    AccountClassHash,
    calldata,
    0
  );
};

export const deployAccount = async (
  deployerAccount: Account,
  name: string = "SimpleAccount",
  publicKey: string,
  more: string
) => {
  if (name !== "SimpleAccount") {
    throw new Error(`Unsupported account class: ${name}`);
  }
  const computedClassHash = classHash(name);
  const AccountAddress = accountAddress(name, publicKey, more);
  try {
    const deployedClassHash =
      await deployerAccount.getClassHashAt(AccountAddress);
    if (deployedClassHash !== computedClassHash) {
      throw new Error(
        `Class mismatch: expect ${computedClassHash}, got ${deployedClassHash}`
      );
    }
    return AccountAddress;
  } catch (e) {}
  const tx = await ethTransfer(
    deployerAccount,
    AccountAddress,
    initial_EthTransfer
  );
  if (!tx.isSuccess()) {
    throw new Error(`Failed to transfer eth to account: ${tx.statusReceipt}`);
  }
  const calldata = new CallData(AccountABI).compile("constructor", {
    public_key: publicKey,
    more: more,
  });
  const { transaction_hash } = await deployerAccount.deployAccount({
    classHash: computedClassHash,
    constructorCalldata: calldata,
    addressSalt: publicKey,
  });
  const txReceipt = await deployerAccount.waitForTransaction(transaction_hash);
  if (!txReceipt.isSuccess()) {
    throw new Error(`Failed to deploy account: ${txReceipt.status}`);
  }
  return AccountAddress;
};

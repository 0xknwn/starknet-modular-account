import { ethTransfer } from "./utils";
import { classHash } from "./class";
import { Call, CallData, hash, Account, Contract } from "starknet";
import { ABI as AccountABI } from "./abi/SmartrAccount";
import { initial_EthTransfer } from "./constants";

// accountAddress compute the account address from the account public key.
export const accountAddress = (
  name: string = "SmartrAccount",
  publicKey: string
): string => {
  if (name !== "SmartrAccount") {
    throw new Error(`Unsupported account class: ${name}`);
  }
  const AccountClassHash = classHash(name);
  const calldata = CallData.compile({
    core_validator: classHash("CoreValidator"),
    public_key: publicKey,
  });
  return hash.calculateContractAddressFromHash(
    publicKey,
    AccountClassHash,
    calldata,
    0
  );
};

export const deployAccount = async (
  deployerAccount: Account,
  name: string = "SmartrAccount",
  publicKey: string
) => {
  if (name !== "SmartrAccount") {
    throw new Error(`Unsupported account class: ${name}`);
  }
  const computedClassHash = classHash(name);
  const AccountAddress = accountAddress(name, publicKey);
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
    core_validator: classHash("CoreValidator"),
    public_key: publicKey,
  });
  console.log(`calldata: ${calldata}`);
  console.log(`core validator: ${classHash("CoreValidator")}`);
  console.log(`public key: ${publicKey}`);

  const { transaction_hash, contract_address } =
    await deployerAccount.deployAccount({
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

export const upgrade = async (a: Account, classHash: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const upgradeCall: Call = contract.populate("upgrade", {
    new_class_hash: classHash,
  });
  const { transaction_hash: transferTxHash } = await a.execute(upgradeCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get_public_keys = async (a: Account) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  return await contract.get_public_keys();
};

export const get_threshold = async (a: Account) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  return await contract.get_threshold();
};

export const add_public_key = async (a: Account, new_public_key: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const transferCall: Call = contract.populate("add_public_key", {
    new_public_key: new_public_key,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const remove_public_key = async (a: Account, old_public_key: string) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const transferCall: Call = contract.populate("remove_public_key", {
    old_public_key: old_public_key,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const set_threshold = async (a: Account, new_threshold: bigint) => {
  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const transferCall: Call = contract.populate("set_threshold", {
    new_threshold: new_threshold,
  });
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

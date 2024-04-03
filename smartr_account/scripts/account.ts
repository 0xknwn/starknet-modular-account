import { account, config, classHash, provider, ethTransfer } from "./utils";
import { ec, Call, CallData, hash, Account, Contract } from "starknet";
import { ABI as AccountABI } from "./abi/Account";

// accountAddress compute the account address from the account public key.
export const accountAddress = (name: string = "Account"): string => {
  const AccountClassHash = classHash(name);
  const c = config();
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ public_keys: starkKeyPub });
  return hash.calculateContractAddressFromHash(
    starkKeyPub,
    AccountClassHash,
    calldata,
    0
  );
};

export const deployAccount = async (name: string = "Account") => {
  const computedClassHash = classHash(name);
  const AccountAddress = accountAddress(name);
  const c = config();
  const a = account();
  try {
    const deployedClassHash = await a.getClassHashAt(AccountAddress);
    if (deployedClassHash !== computedClassHash) {
      throw new Error(
        `Class mismatch: expect ${computedClassHash}, got ${deployedClassHash}`
      );
    }
    return AccountAddress;
  } catch (e) {}
  const tx = await ethTransfer(a, AccountAddress, 10n ** 17n);
  if (!tx.isSuccess()) {
    throw new Error(`Failed to transfer eth to account: ${tx.statusReceipt}`);
  }
  const p = provider();
  const newAccount = new Account(p, AccountAddress, c.accounts[0].privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ public_keys: starkKeyPub });
  const { transaction_hash, contract_address } = await newAccount.deployAccount(
    {
      classHash: computedClassHash,
      constructorCalldata: calldata,
      addressSalt: starkKeyPub,
    }
  );
  const txReceipt = await p.waitForTransaction(transaction_hash);
  if (!txReceipt.isSuccess()) {
    throw new Error(`Failed to deploy account: ${txReceipt.status}`);
  }
  return AccountAddress;
};

export const upgrade = async (
  a: Account,
  classHash: string,
  env: string = "devnet"
) => {
  const conf = config(env);

  const contract = new Contract(AccountABI, a.address, a).typedv2(AccountABI);
  const upgradeCall: Call = contract.populate("upgrade", {
    new_class_hash: classHash,
  });
  const { transaction_hash: transferTxHash } = await a.execute(upgradeCall);
  return await a.waitForTransaction(transferTxHash);
};

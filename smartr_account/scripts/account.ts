import { account, config, classHash, provider, ethTransfer } from "./utils";
import { ec, CallData, hash, Account } from "starknet";

// accountAddress compute the account address from the account public key.
export const accountAddress = (name: string = "Account"): string => {
  const AccountClassHash = classHash(name);
  const c = config();
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ publicKey: starkKeyPub });
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
  const tx = await ethTransfer(a, AccountAddress, 10n ** 16n);
  if (tx.execution_status !== "SUCCEEDED") {
    throw new Error(
      `Failed to transfer eth to account: ${tx.execution_status}`
    );
  }
  const p = provider();
  const newAccount = new Account(p, AccountAddress, c.accounts[0].privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ publicKey: starkKeyPub });
  const { transaction_hash, contract_address } = await newAccount.deployAccount(
    {
      classHash: computedClassHash,
      constructorCalldata: calldata,
      addressSalt: starkKeyPub,
    }
  );
  const txReceipt = await p.waitForTransaction(transaction_hash);
  if (txReceipt.execution_status !== "SUCCEEDED") {
    throw new Error(`Failed to deploy account: ${txReceipt.execution_status}`);
  }
  return AccountAddress;
};

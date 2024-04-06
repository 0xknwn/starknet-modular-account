import { account, classHash } from "./utils";
import { Contract, Call, Account, CallData, hash, ec } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";
import { udcAddress } from "./addresses";

// accountAddress compute the account address from the account public key.
export const counterAddress = (name: string = "Counter"): string => {
  const a = account();
  const myCallData = new CallData(CounterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: account().address,
  });
  return hash.calculateContractAddressFromHash(
    ec.starkCurve.pedersen(a.address, 0),
    classHash(name),
    _calldata,
    udcAddress()
  );
};

export const deployContract = async (): Promise<Contract> => {
  const a = account();
  const CounterClassHash = classHash("Counter");
  try {
    const v = await a.getContractVersion(counterAddress());
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(CounterABI, counterAddress(), a);
    }
  } catch (e) {}
  const deployResponse = await a.deployContract({
    classHash: CounterClassHash,
    constructorCalldata: [account().address],
    salt: "0x0",
  });
  await a.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(CounterABI, deployResponse.contract_address, a);
};

export const increment = async (
  a: Account,
  values: number[] | number = 1,
  env: string = "devnet"
) => {
  if (!Array.isArray(values)) {
    values = [values];
  }
  if (values.length === 0) {
    throw new Error("values should not be empty");
  }
  const contract = new Contract(CounterABI, counterAddress(), a).typedv2(
    CounterABI
  );
  let transferCalls: Call[] = [];
  for (const value of values) {
    let transferCall: Call = contract.populate("increment", {});
    if (value > 1) {
      transferCall = contract.populate("increment_by", {
        value: value,
      });
    }
    transferCalls.push(transferCall);
  }
  const { transaction_hash: transferTxHash } = await a.execute(transferCalls);
  return await a.waitForTransaction(transferTxHash);
};

export const reset = async (a: Account, env: string = "devnet") => {
  const contract = new Contract(CounterABI, counterAddress(), a).typedv2(
    CounterABI
  );
  const transferCall: Call = contract.populate("reset", {});
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get = async (a: Account, env: string = "devnet") => {
  const contract = new Contract(CounterABI, counterAddress(), a).typedv2(
    CounterABI
  );
  return await contract.get();
};

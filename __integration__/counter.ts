import { classHash } from "./class";
import { Contract, Call, Account, CallData, hash, ec } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";
import { udcAddress } from "./addresses";

// accountAddress compute the account address from the account public key.
export const counterAddress = (ownerAddress: string): string => {
  const name = "Counter";
  const myCallData = new CallData(CounterABI);
  const _calldata = myCallData.compile("constructor", {
    owner: ownerAddress,
  });
    // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
    // to understand the calculateContractAddressFromHash function works with the UDC
    return hash.calculateContractAddressFromHash(
    ec.starkCurve.pedersen(ownerAddress, 0),
    classHash(name),
    _calldata,
    udcAddress()
  );
};

export const deployCounterContract = async (
  ownerAccount: Account
): Promise<Contract> => {
  const name = "Counter";
  const CounterClassHash = classHash(name);
  try {
    const v = await ownerAccount.getContractVersion(
      counterAddress(ownerAccount.address)
    );
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(
        CounterABI,
        counterAddress(ownerAccount.address),
        ownerAccount
      );
    }
  } catch (e) {}
  const deployResponse = await ownerAccount.deployContract({
    classHash: CounterClassHash,
    constructorCalldata: [ownerAccount.address],
    salt: "0x0",
  });
  await ownerAccount.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(
    CounterABI,
    deployResponse.contract_address,
    ownerAccount
  );
};

export const increment = async (
  a: Account,
  counterAddress: string,
  values: number[] | number = 1
) => {
  if (!Array.isArray(values)) {
    values = [values];
  }
  if (values.length === 0) {
    throw new Error("values should not be empty");
  }
  const contract = new Contract(CounterABI, counterAddress, a).typedv2(
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

export const increment_by_array = async (
  a: Account,
  counterAddress: string,
  values: number[] | number = 1
) => {
  if (!Array.isArray(values)) {
    values = [values];
  }
  const contract = new Contract(CounterABI, counterAddress, a).typedv2(
    CounterABI
  );
  const transferCall = contract.populate("increment_by_array", {
    args: values,
  });
  let transferCalls: Call[] = [transferCall, transferCall];

  const { transaction_hash: transferTxHash } = await a.execute(transferCalls);
  return await a.waitForTransaction(transferTxHash);
};

export const reset = async (a: Account, counterAddress: string) => {
  const contract = new Contract(CounterABI, counterAddress, a).typedv2(
    CounterABI
  );
  const transferCall: Call = contract.populate("reset", {});
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get = async (a: Account, counterAddress: string) => {
  const contract = new Contract(CounterABI, counterAddress, a).typedv2(
    CounterABI
  );
  return await contract.get();
};

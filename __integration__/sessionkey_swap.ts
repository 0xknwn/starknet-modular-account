import { classHash } from "./class";
import { Contract, Call, Account, CallData, hash, ec } from "starknet";
import { ABI as TokenAABI } from "./abi/TokenA";
import { ABI as TokenBABI } from "./abi/TokenB";
import { ABI as SwapRouterABI } from "./abi/SwapRouter";
import { udcAddress } from "./addresses";

// swapRouterAddress compute the swapRouter address from the owner.
export const swapRouterAddress = (ownerAddress: string): string => {
  const name = "SwapRouter";
  const myCallData = new CallData(SwapRouterABI);
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

export const deploySwapRouterContract = async (
  ownerAccount: Account
): Promise<Contract> => {
  const name = "SwapRouter";
  const CounterClassHash = classHash(name);
  try {
    const v = await ownerAccount.getContractVersion(
      swapRouterAddress(ownerAccount.address)
    );
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(
        SwapRouterABI,
        swapRouterAddress(ownerAccount.address),
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
    SwapRouterABI,
    deployResponse.contract_address,
    ownerAccount
  );
};

export const set_swapRouter_tokens = async (
  a: Account,
  swapRouterAddress: string,
  tokenAAddress: string,
  tokenBAddress: string
) => {
  const contract = new Contract(SwapRouterABI, swapRouterAddress, a).typedv2(
    SwapRouterABI
  );
  let call: Call = contract.populate("set_tokens", {
    tokenAAddress,
    tokenBAddress,
  });
  const { transaction_hash: transferTxHash } = await a.execute(call);
  return await a.waitForTransaction(transferTxHash);
};

// tokenAAddress compute the tokenA address from the recipient and owner.
export const tokenAAddress = (
  creatorAddress: string,
  recipientAddress: string,
  ownerAddress: string
): string => {
  const name = "TokenA";
  const myCallData = new CallData(TokenAABI);
  const _calldata = myCallData.compile("constructor", {
    recipient: recipientAddress,
    owner: ownerAddress,
  });
  // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
  // to understand the calculateContractAddressFromHash function works with the UDC
  return hash.calculateContractAddressFromHash(
    ec.starkCurve.pedersen(creatorAddress, 0),
    classHash(name),
    _calldata,
    udcAddress()
  );
};

export const deployTokenAContract = async (
  recipientAddress: string,
  ownerAccount: Account
): Promise<Contract> => {
  const name = "TokenA";
  const tokenAClassHash = classHash(name);
  try {
    const v = await ownerAccount.getContractVersion(
      tokenAAddress(
        ownerAccount.address,
        recipientAddress,
        ownerAccount.address
      )
    );
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(
        TokenAABI,
        tokenAAddress(
          ownerAccount.address,
          recipientAddress,
          ownerAccount.address
        ),
        ownerAccount
      );
    }
  } catch (e) {}
  const deployResponse = await ownerAccount.deployContract({
    classHash: tokenAClassHash,
    constructorCalldata: [recipientAddress, ownerAccount.address],
    salt: "0x0",
  });
  await ownerAccount.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(TokenAABI, deployResponse.contract_address, ownerAccount);
};

// tokenBAddress compute the tokenB address from the recipient and owner.
export const tokenBAddress = (
  creatorAddress: string,
  recipientAddress: string,
  ownerAddress: string
): string => {
  const name = "TokenB";
  const myCallData = new CallData(TokenBABI);
  const _calldata = myCallData.compile("constructor", {
    recipient: recipientAddress,
    owner: ownerAddress,
  });
  // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
  // to understand the calculateContractAddressFromHash function works with the UDC
  return hash.calculateContractAddressFromHash(
    ec.starkCurve.pedersen(creatorAddress, 0),
    classHash(name),
    _calldata,
    udcAddress()
  );
};

export const deployTokenBContract = async (
  recipientAddress: string,
  ownerAccount: Account
): Promise<Contract> => {
  const name = "TokenB";
  const CounterClassHash = classHash(name);
  try {
    const v = await ownerAccount.getContractVersion(
      tokenBAddress(
        ownerAccount.address,
        recipientAddress,
        ownerAccount.address
      )
    );
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(
        TokenBABI,
        tokenBAddress(
          ownerAccount.address,
          recipientAddress,
          ownerAccount.address
        ),
        ownerAccount
      );
    }
  } catch (e) {}
  const deployResponse = await ownerAccount.deployContract({
    classHash: CounterClassHash,
    constructorCalldata: [recipientAddress, ownerAccount.address],
    salt: "0x0",
  });
  await ownerAccount.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(TokenBABI, deployResponse.contract_address, ownerAccount);
};

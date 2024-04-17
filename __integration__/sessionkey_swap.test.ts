import { deployClass, classHash } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { coreValidatorClassHash } from "./core_validator";
import {
  chain,
  config,
  testAccount,
  provider,
  type AccountConfig,
  type ContractConfig,
} from "./utils";
import { udcAddress } from "./addresses";
import {
  swapRouterAddress,
  deploySwapRouterContract,
  tokenAAddress,
  deployTokenAContract,
  tokenBAddress,
  deployTokenBContract,
  set_swapRouter_tokens,
  faucet,
  balance_of,
  swap,
} from "./sessionkey_swap";
import { Multisig } from "./multisig";
import { add_module, is_module, remove_module } from "./module";
import { timeout } from "./constants";
import { SessionKeyModule, SessionKeyGrantor } from "./sessionkey_validator";
import { Account, ec, hash, num } from "starknet";
import type { Uint256 } from "starknet";
import { hash_auth_message } from "./message";

describe("swap router", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  let targetAccounts: Account[];
  let tokenAContract: ContractConfig;
  let tokenAInitialBalance: number | bigint | Uint256;
  let tokenBContract: ContractConfig;
  let tokenBInitialBalance: number | bigint | Uint256;
  let SwapRouterContract: ContractConfig;
  let connectedChain: string | undefined;
  let sessionKeyModule: SessionKeyModule | undefined;
  let altProviderURL: string;

  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
    targetAccountConfigs = [
      {
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
      {
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
        publicKey: conf.accounts[1].publicKey,
        privateKey: conf.accounts[1].privateKey,
      },
    ];
    targetAccounts = [
      new Account(
        provider(conf.providerURL),
        targetAccountConfigs[0].address,
        targetAccountConfigs[0].privateKey
      ),
    ];
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      connectedChain = await chain(conf.providerURL);
      switch (env) {
        case "sepolia":
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
        default:
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
      }
    },
    timeout
  );

  it(
    "deploys the SwapRouter class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SwapRouter");
      expect(c.classHash).toEqual(classHash("SwapRouter"));
    },
    timeout
  );

  it(
    "deploys the SwapRouter contract",
    async () => {
      const a = testAccounts[0];
      const c = await deploySwapRouterContract(a);
      SwapRouterContract = {
        classHash: classHash("SwapRouter"),
        address: swapRouterAddress(a.address),
      };
      expect(c.address).toEqual(swapRouterAddress(a.address));
    },
    timeout
  );

  it(
    "deploys the TokenA class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "TokenA");
      expect(c.classHash).toEqual(classHash("TokenA"));
    },
    timeout
  );

  it(
    "deploys the TokenA contract",
    async () => {
      const a = testAccounts[0];
      const c = await deployTokenAContract(swapRouterAddress(a.address), a);
      expect(c.address).toEqual(
        tokenAAddress(a.address, swapRouterAddress(a.address), a.address)
      );
      tokenAContract = {
        classHash: classHash("TokenA"),
        address: c.address,
      };
    },
    timeout
  );

  it("compute and check TokenA address", async () => {
    const a = testAccounts[0];
    const creatorAddress = a.address;
    const recipientAddress = swapRouterAddress(a.address);
    const ownerAddress = a.address;
    const factoryAddress = udcAddress();
    const h = classHash("TokenA");
    const salt = ec.starkCurve.pedersen(creatorAddress, 0);
    // This test just shows how to use calculateContractAddressFromHash for new devs
    // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
    // to understand the calculateContractAddressFromHash function works
    const res = hash.calculateContractAddressFromHash(
      salt,
      h,
      [recipientAddress, ownerAddress],
      factoryAddress
    );
    expect(res).toBe(
      tokenAAddress(a.address, swapRouterAddress(a.address), a.address)
    );
  });

  it(
    "deploys the TokenB class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "TokenB");
      expect(c.classHash).toEqual(classHash("TokenB"));
    },
    timeout
  );

  it(
    "deploys the TokenB contract",
    async () => {
      const a = testAccounts[0];
      const c = await deployTokenBContract(swapRouterAddress(a.address), a);
      expect(c.address).toEqual(
        tokenBAddress(a.address, swapRouterAddress(a.address), a.address)
      );
      tokenBContract = {
        classHash: classHash("TokenB"),
        address: c.address,
      };
    },
    timeout
  );

  it(
    "sets the tokens in the SwapRouter",
    async () => {
      const a = testAccounts[0];
      const c = await set_swapRouter_tokens(
        a,
        SwapRouterContract.address,
        tokenAContract.address,
        tokenBContract.address
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks tokenA initial account balance",
    async () => {
      const a = testAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenAInitialBalance = c;
    },
    timeout
  );

  it(
    "requests tokenA to the faucet",
    async () => {
      const a = testAccounts[0];
      const c = await faucet(
        a,
        SwapRouterContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks the account has been funded with tokenA",
    async () => {
      if (tokenAInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const a = testAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenAInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "checks tokenB initial account balance",
    async () => {
      const a = testAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenBInitialBalance = c;
    },
    timeout
  );

  it(
    "swaps tokenA for tokenB",
    async () => {
      const a = testAccounts[0];
      const c = await swap(
        a,
        SwapRouterContract.address,
        tokenAContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks the account has been funded with tokenB",
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenBInitialBalance is undefined");
      }
      const a = testAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenBInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "deploys the CoreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(`0x${coreValidatorClassHash().toString(16)}`);
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const a = testAccounts[0];
      const publicKey = await testAccounts[0].signer.getPubKey();
      const c = await deployAccount(a, "SmartrAccount", publicKey);
      expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
    },
    timeout
  );

  it(
    "checks tokenA initial target[0] balance",
    async () => {
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenAInitialBalance = c;
    },
    timeout
  );

  it(
    "requests tokenA from target[0] to the faucet",
    async () => {
      const a = targetAccounts[0];
      const c = await faucet(
        a,
        SwapRouterContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks target[0] has been funded with tokenA",
    async () => {
      if (tokenAInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenAInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "checks tokenB initial target[0] balance",
    async () => {
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenBInitialBalance = c;
    },
    timeout
  );

  it(
    "swaps tokenA for tokenB from target[0]",
    async () => {
      const a = targetAccounts[0];
      const c = await swap(
        a,
        SwapRouterContract.address,
        tokenAContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks target[0] has been funded with tokenB",
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenBInitialBalance is undefined");
      }
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenBInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "deploys the SessionKeyValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SessionKeyValidator");
      expect(c.classHash).toEqual(classHash("SessionKeyValidator"));
    },
    timeout
  );

  it(
    "adds a module to the account",
    async () => {
      const a = targetAccounts[0];
      const c = await add_module(a, classHash("SessionKeyValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const a = targetAccounts[0];
      const value = await is_module(a, classHash("SessionKeyValidator"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "creates a typescript session key module",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const module = new SessionKeyModule(
        targetAccountConfigs[1].publicKey,
        targetAccountConfigs[0].address,
        classHash("SessionKeyValidator"),
        connectedChain
      );
      sessionKeyModule = module;
      let r = await module.request(
        `0x${coreValidatorClassHash().toString(16)}`
      );
      if (!connectedChain) {
        expect(connectedChain).toBeDefined();
        return;
      }
      expect(r.hash).toBe(
        hash_auth_message(
          targetAccountConfigs[0].address,
          classHash("SessionKeyValidator"),
          classHash("CoreValidator"),
          targetAccountConfigs[1].publicKey,
          "0x0",
          "0x0",
          connectedChain
        )
      );
    },
    timeout
  );

  it("signs the typescript session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    let grantor = new SessionKeyGrantor(
      `0x${coreValidatorClassHash().toString(16)}`,
      targetAccountConfigs[0].privateKey
    );
    let signature = await grantor.sign(sessionKeyModule);
    expect(signature.length).toEqual(2);
    sessionKeyModule.add_signature(signature);
  });

  it("creates an account with the session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = provider(conf.providerURL);
    const a = new Multisig(
      p,
      targetAccountConfigs[0].address,
      [targetAccountConfigs[1].privateKey],
      sessionKeyModule
    );
    targetAccounts.push(a);
  });

  it(
    "checks tokenA initial account balance",
    async () => {
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenAInitialBalance = c;
    },
    timeout
  );

  it(
    "requests tokenA to the faucet",
    async () => {
      const a = targetAccounts[0];
      const c = await faucet(
        a,
        SwapRouterContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks the account has been funded with tokenA",
    async () => {
      if (tokenAInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenAContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenAInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "checks tokenB initial account balance",
    async () => {
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(c).toBeGreaterThanOrEqual(0n);
      tokenBInitialBalance = c;
    },
    timeout
  );

  it(
    "swaps tokenA for tokenB",
    async () => {
      const a = targetAccounts[1];
      const c = await swap(
        a,
        SwapRouterContract.address,
        tokenAContract.address,
        "0x1bc16d674ec80000"
      );
      expect(c.isSuccess()).toBe(true);
    },
    timeout
  );

  it(
    "checks the account has been funded with tokenB",
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenBInitialBalance is undefined");
      }
      const a = targetAccounts[0];
      const c = await balance_of(a, tokenBContract.address);
      expect(
        num.toBigInt(`0x${c.toString(16)}`) -
          num.toBigInt(`0x${tokenBInitialBalance.toString(16)}`)
      ).toBeGreaterThanOrEqual(2000000000000000000n);
    },
    timeout
  );

  it(
    "removes the module from account",
    async () => {
      const a = targetAccounts[0];
      const c = await remove_module(a, classHash("SessionKeyValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );
});

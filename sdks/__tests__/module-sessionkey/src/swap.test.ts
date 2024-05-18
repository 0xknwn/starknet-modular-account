import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  config,
  testAccounts,
  tokenAAddress,
  deployTokenA,
  tokenBAddress,
  deployTokenB,
  swapRouterAddress,
  deploySwapRouter,
  SwapRouter,
  default_timeout,
  initial_EthTransfer,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  hash_auth_message,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { cairo, RpcProvider, CallData, Contract } from "starknet";
import {
  SessionKeyModule,
  SessionKeyGrantor,
  declareClass as declareSessionkeyClass,
  classHash as sessionkeyClassHash,
} from "@0xknwn/starknet-module-sessionkey";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";

describe("sessionkey swap", () => {
  let env: string;
  let altProviderURL: string;
  let swapRouterContract: SwapRouter;
  let swapRouterWithSmartAccountContract: SwapRouter;
  let tokenA: Contract, tokenB: Contract;
  let tokenAInitialBalance: bigint, tokenBInitialBalance: bigint;
  let smartrAccount: SmartrAccount;
  let sessionKeyModule: SessionKeyModule;
  let smartrAccountWithSessionKey: SmartrAccount;
  let connectedChain: string;

  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      connectedChain = await account.getChainId();
    },
    default_timeout
  );

  it(
    "declares the SwapRouter class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareHelperClass(a, "SwapRouter");
      expect(c.classHash).toEqual(helperClassHash("SwapRouter"));
    },
    default_timeout
  );

  it(
    "deploys the SwapRouter contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deploySwapRouter(a, a.address);
      const routerAddress = await swapRouterAddress(a.address, a.address);
      swapRouterContract = new SwapRouter(routerAddress, a);
      expect(c.address).toEqual(routerAddress);
    },
    default_timeout
  );

  it(
    "declares the TokenA class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareHelperClass(a, "TokenA");
      expect(c.classHash).toEqual(helperClassHash("TokenA"));
    },
    default_timeout
  );

  it(
    "deploys the TokenA contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deployTokenA(a, swapRouterContract.address, a.address);
      tokenA = c;
      expect(c.address).toEqual(
        await tokenAAddress(a.address, swapRouterContract.address, a.address)
      );
    },
    default_timeout
  );

  it(
    "declares the TokenB class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareHelperClass(a, "TokenB");
      expect(c.classHash).toEqual(helperClassHash("TokenB"));
    },
    default_timeout
  );

  it(
    "deploys the TokenB contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deployTokenB(a, swapRouterContract.address, a.address);
      tokenB = c;
      expect(c.address).toEqual(
        await tokenBAddress(a.address, swapRouterContract.address, a.address)
      );
    },
    default_timeout
  );

  it(
    "sets the tokens in the SwapRouter",
    async () => {
      const is_paused = await swapRouterContract.is_paused();
      if (!is_paused) {
        // the tokens have not already been configure
        return;
      }
      const receipt = await swapRouterContract.set_tokens(
        tokenA.address,
        tokenB.address
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks tokenA and tokenB initial account balance",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      let balance = await tokenA.balance_of(a.address);
      expect(balance).toBeGreaterThanOrEqual(0n);
      tokenAInitialBalance = balance;
      balance = await tokenB.balance_of(a.address);
      expect(balance).toBeGreaterThanOrEqual(0n);
      tokenBInitialBalance = balance;
    },
    default_timeout
  );

  it(
    "declares the starkValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    "declares the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "sends ETH to the account address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = accountAddress("SmartrAccount", publicKey, calldata);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[0].publicKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_key",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "deploys the SessionKeyValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareSessionkeyClass(a, "SessionKeyValidator");
      expect(c.classHash).toEqual(sessionkeyClassHash("SessionKeyValidator"));
    },
    default_timeout
  );

  it(
    "adds a module to the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.addModule(
        sessionkeyClassHash("SessionKeyValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SessionKeyValidator is installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        sessionkeyClassHash("SessionKeyValidator")
      );
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    "creates a typescript session key module",
    async () => {
      if (!connectedChain) {
        expect(connectedChain).toBeDefined();
        return;
      }
      const conf = config(env);
      const next_timestamp = BigInt(
        Math.floor(Date.now() / 1000) + 24 * 60 * 60
      );
      sessionKeyModule = new SessionKeyModule(
        conf.accounts[1].publicKey,
        smartrAccount.address,
        sessionkeyClassHash("SessionKeyValidator"),
        connectedChain,
        `0x${next_timestamp.toString(16)}`
      );
      const r = await sessionKeyModule.request(
        accountClassHash("StarkValidator")
      );
      expect(r.hash).toBe(
        hash_auth_message(
          smartrAccount.address,
          sessionkeyClassHash("SessionKeyValidator"),
          accountClassHash("StarkValidator"),
          conf.accounts[1].publicKey,
          `0x${next_timestamp.toString(16)}`,
          "0x0",
          connectedChain
        )
      );
    },
    default_timeout
  );

  it("signs the typescript session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const grantor = new SessionKeyGrantor(
      accountClassHash("StarkValidator"),
      conf.accounts[0].privateKey
    );
    const signature = await grantor.sign(sessionKeyModule);
    expect(signature.length).toEqual(2);
    sessionKeyModule.add_signature(signature);
  });

  it("creates an account with the session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    smartrAccountWithSessionKey = new SmartrAccount(
      p,
      smartrAccount.address,
      conf.accounts[1].privateKey,
      sessionKeyModule
    );
  });

  it(
    "requests tokenA to the faucet",
    async () => {
      const conf = config(env);
      swapRouterWithSmartAccountContract = new SwapRouter(
        swapRouterContract.address,
        smartrAccountWithSessionKey
      );
      const receipt = await swapRouterWithSmartAccountContract.faucet(
        cairo.uint256(2n * 10n ** 18n)
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the account has been funded with tokenA",
    async () => {
      if (tokenAInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const conf = config(env);
      const balance = await tokenA.balance_of(
        smartrAccountWithSessionKey.address
      );
      expect(balance - tokenAInitialBalance).toBeGreaterThanOrEqual(
        2000000000000000000n
      );
    },
    default_timeout
  );

  it(
    "swaps tokenA for tokenB",
    async () => {
      // @todo: fix this test and/or the swap function
      const receipt = await swapRouterWithSmartAccountContract.swap(
        tokenA.address,
        cairo.uint256(10n ** 15n)
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the account has been funded with tokenB",
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const conf = config(env);
      const balance = await tokenB.balance_of(
        smartrAccountWithSessionKey.address
      );
      expect(balance - tokenBInitialBalance).toBeGreaterThanOrEqual(10n ** 15n);
    },
    default_timeout
  );

  it(
    "removes the module from the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        sessionkeyClassHash("SessionKeyValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SessionKeyValidator is not installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        sessionkeyClassHash("SessionKeyValidator")
      );
      expect(output).toBe(false);
    },
    default_timeout
  );
});

import {
  classHash,
  declareClass,
  config,
  testAccounts,
  tokenAAddress,
  deployTokenA,
  tokenBAddress,
  deployTokenB,
  swapRouterAddress,
  deploySwapRouter,
  SwapRouter,
  ERC20,
  default_timeout,
} from "starknet-test-helpers";
import {
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
  hash_auth_message,
} from "@0xknwn/starknet-account";
import { cairo, RpcProvider } from "starknet";
import { SessionKeyModule, SessionKeyGrantor } from "./sessionkey_validator";

describe("sessionkey swap", () => {
  let env: string;
  let altProviderURL: string;
  let swapRouterContract: SwapRouter;
  let swapRouterWithSmartAccountContract: SwapRouter;
  let tokenA: ERC20, tokenB: ERC20;
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
      const c = await declareClass(a, "SwapRouter");
      expect(c.classHash).toEqual(classHash("SwapRouter"));
    },
    default_timeout
  );

  it(
    "deploys the SwapRouter contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deploySwapRouter(a, a.address);
      let routerAddress = await swapRouterAddress(a.address, a.address);
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
      const c = await declareClass(a, "TokenA");
      expect(c.classHash).toEqual(classHash("TokenA"));
    },
    default_timeout
  );

  it(
    "deploys the TokenA contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deployTokenA(a, swapRouterContract.address, a.address);
      tokenA = new ERC20(
        await tokenAAddress(a.address, swapRouterContract.address, a.address),
        a
      );
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
      const c = await declareClass(a, "TokenB");
      expect(c.classHash).toEqual(classHash("TokenB"));
    },
    default_timeout
  );

  it(
    "deploys the TokenB contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await deployTokenB(a, swapRouterContract.address, a.address);
      tokenB = new ERC20(
        await tokenBAddress(a.address, swapRouterContract.address, a.address),
        a
      );
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
    "declares the coreValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "CoreValidator");
      expect(c.classHash).toEqual(classHash("CoreValidator"));
    },
    default_timeout
  );

  it(
    "declares the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const coreValidatorAddress = classHash("CoreValidator");
      const accountAddress = await deploySmartrAccount(
        a,
        publicKey,
        coreValidatorAddress
      );
      expect(accountAddress).toEqual(
        smartrAccountAddress(publicKey, coreValidatorAddress)
      );
      smartrAccount = new SmartrAccount(p, accountAddress, [privateKey]);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await smartrAccount.get_public_keys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount threshhold",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await smartrAccount.get_threshold();
      expect(c).toEqual(1n);
    },
    default_timeout
  );

  it(
    "deploys the SessionKeyValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SessionKeyValidator");
      expect(c.classHash).toEqual(classHash("SessionKeyValidator"));
    },
    default_timeout
  );

  it(
    "adds a module to the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.add_module(
        classHash("SessionKeyValidator")
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
      const output = await smartrAccount.is_module(
        classHash("SessionKeyValidator")
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
      sessionKeyModule = new SessionKeyModule(
        conf.accounts[1].publicKey,
        smartrAccount.address,
        classHash("SessionKeyValidator"),
        connectedChain
      );
      let r = await sessionKeyModule.request(classHash("CoreValidator"));
      expect(r.hash).toBe(
        hash_auth_message(
          smartrAccount.address,
          classHash("SessionKeyValidator"),
          classHash("CoreValidator"),
          conf.accounts[1].publicKey,
          "0x0",
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
    let grantor = new SessionKeyGrantor(
      classHash("CoreValidator"),
      conf.accounts[0].privateKey
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
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    smartrAccountWithSessionKey = new SmartrAccount(
      p,
      smartrAccount.address,
      [conf.accounts[1].privateKey],
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
      let balance = await tokenA.balance_of(
        smartrAccountWithSessionKey.address
      );
      expect(balance - tokenAInitialBalance).toBeGreaterThanOrEqual(
        2000000000000000000n
      );
    },
    default_timeout
  );

  it.skip(
    "swaps tokenA for tokenB",
    async () => {
      // @todo: fix this test and/or the swap function
      let receipt = await swapRouterWithSmartAccountContract.swap(
        tokenA.address,
        cairo.uint256(10n ** 15n)
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it.skip(
    "checks the account has been funded with tokenB",
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const conf = config(env);
      let balance = await tokenB.balance_of(
        smartrAccountWithSessionKey.address
      );
      expect(balance - tokenBInitialBalance).toBeGreaterThanOrEqual(10n ** 15n);
    },
    default_timeout
  );
});

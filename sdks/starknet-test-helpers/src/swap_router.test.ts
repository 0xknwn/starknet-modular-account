import { classHash, declareClass } from "./class";
import { config, testAccounts } from "./utils";
import { udcAddress } from "./natives";
import {
  tokenAAddress,
  deployTokenA,
  tokenBAddress,
  deployTokenB,
} from "./tokens";
import { swapRouterAddress, deploySwapRouter } from "./swap_router";
import { default_timeout } from "./parameters";
import { ec, hash, cairo, uint256 } from "starknet";
import { SwapRouter } from "./swap_router";
import { ERC20 } from "./tokens";

describe("swap router", () => {
  let env: string;
  let altProviderURL: string;
  let swapRouterContract: SwapRouter;
  let tokenA: ERC20, tokenB: ERC20;
  let tokenAInitialBalance: bigint, tokenBInitialBalance: bigint;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
  });

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

  it("compute and check TokenA address", async () => {
    const conf = config(env);
    const a = testAccounts(conf)[0];
    const creatorAddress = a.address;
    const recipientAddress = swapRouterContract.address;
    const ownerAddress = a.address;
    const factoryAddress = udcAddress;
    const h = classHash("TokenA");
    // This test just shows how to use calculateContractAddressFromHash for new devs
    // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
    // to understand the calculateContractAddressFromHash function works
    const salt = ec.starkCurve.pedersen(creatorAddress, 0);
    const res = hash.calculateContractAddressFromHash(
      salt,
      h,
      [recipientAddress, ownerAddress],
      factoryAddress
    );
    expect(res).toBe(
      await tokenAAddress(a.address, swapRouterContract.address, a.address)
    );
  });

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
    "requests tokenA to the faucet",
    async () => {
      const receipt = await swapRouterContract.faucet(
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
      const a = testAccounts(conf)[0];
      let balance = await tokenA.balance_of(a.address);
      expect(balance - tokenAInitialBalance).toBeGreaterThanOrEqual(
        2000000000000000000n
      );
    },
    default_timeout
  );

  it(
    "swaps tokenA for tokenB",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      // @todo: fix this test and/or the swap function
      let receipt = await swapRouterContract.swap(
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
      const a = testAccounts(conf)[0];
      let balance = await tokenB.balance_of(a.address);
      console.log(balance, tokenBInitialBalance);
      expect(balance - tokenBInitialBalance).toBeGreaterThanOrEqual(10n ** 15n);
    },
    default_timeout
  );
});

import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { config, testAccounts } from "./utils";
import { udcAddress } from "./natives";
import {
  tokenAAddress,
  deployTokenA,
  tokenBAddress,
  deployTokenB,
} from "./tokens";
import { ABI as TokenAABI } from "./abi/TokenA";
import { ABI as TokenBABI } from "./abi/TokenB";
import { swapRouterAddress, deploySwapRouter } from "./swap_router";
import { default_timeout } from "./parameters";
import { ec, hash, cairo, Contract } from "starknet";
import { SwapRouter } from "./swap_router";
import { data } from "./data.fixture";

describe.each(data)("swap router", ({ fees, version, accountID }) => {
  let env: string;
  let altProviderURL: string;
  let swapRouterContract: SwapRouter;
  let tokenA: Contract, tokenB: Contract;
  let tokenAInitialBalance: bigint, tokenBInitialBalance: bigint;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
  });

  it(
    `[${fees}] deploys the SwapRouter contract`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const c = await deploySwapRouter(a, a.address, {
        version: version.invoke,
      });
      const routerAddress = await swapRouterAddress(a.address, a.address);
      swapRouterContract = new SwapRouter(routerAddress, a);
      expect(c.address).toEqual(routerAddress);
    },
    default_timeout
  );

  it(
    `[${fees}] deploys the TokenA contract`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const c = await deployTokenA(a, swapRouterContract.address, a.address, {
        version: version.invoke,
      });
      tokenA = new Contract(
        TokenAABI,
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
    `[${fees}] deploys the TokenB contract`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const c = await deployTokenB(a, swapRouterContract.address, a.address, {
        version: version.invoke,
      });
      tokenB = new Contract(
        TokenBABI,
        await tokenBAddress(a.address, swapRouterContract.address, a.address),
        a
      );
      expect(c.address).toEqual(
        await tokenBAddress(a.address, swapRouterContract.address, a.address)
      );
    },
    default_timeout
  );

  it(`[${fees}] compute and check TokenA address`, async () => {
    const conf = config(env);
    const a = testAccounts(conf)[accountID];
    const creatorAddress = a.address;
    const recipientAddress = swapRouterContract.address;
    const ownerAddress = a.address;
    const factoryAddress = udcAddress;
    const h = classHash(classNames.TokenA);
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
    `[${fees}] sets the tokens in the SwapRouter`,
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
    `[${fees}] checks tokenA and tokenB initial account balance`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
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
    `[${fees}] requests tokenA to the faucet`,
    async () => {
      const receipt = await swapRouterContract.faucet(
        cairo.uint256(2n * 10n ** 18n)
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the account has been funded with tokenA`,
    async () => {
      if (tokenAInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const balance = await tokenA.balance_of(a.address);
      expect(balance - tokenAInitialBalance).toBeGreaterThanOrEqual(
        2000000000000000000n
      );
    },
    default_timeout
  );

  it(
    `[${fees}] swaps tokenA for tokenB`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      // @todo: fix this test and/or the swap function
      const receipt = await swapRouterContract.swap(
        tokenA.address,
        cairo.uint256(10n ** 15n)
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the account has been funded with tokenB`,
    async () => {
      if (tokenBInitialBalance === undefined) {
        throw new Error("tokenAInitialBalance is undefined");
      }
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const balance = await tokenB.balance_of(a.address);
      expect(balance - tokenBInitialBalance).toBeGreaterThanOrEqual(10n ** 15n);
    },
    default_timeout
  );
});

import {
  chain,
  config,
  testAccount,
  provider,
  ethBalance,
  strkBalance,
  ethTransfer,
} from "./utils";
import { initial_EthTransfer, timeout } from "./constants";
import { Account } from "starknet";

describe.skip("utilities (helpers)", () => {
  let env: string;
  let testAccounts: Account[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
  });

  it("checks the config file", async () => {
    const c = config(env);
    switch (env) {
      case "sepolia":
        expect(c.providerURL).toBe(
          "https://starknet-sepolia.public.blastapi.io"
        );
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
      default:
        expect(c.providerURL).toBe("http://127.0.0.1:5050/rpc");
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
    }
  });

  it("tests chain", async () => {
    const c = config(env);
    const chainId = await chain(c.providerURL);
    switch (env) {
      case "sepolia":
        expect(chainId).toBe("0x534e5f5345504f4c4941");
        break;
      default:
        expect(chainId).toBe("0x534e5f5345504f4c4941");
        break;
    }
  });

  it("checks the provider version", async () => {
    const conf = config(env);
    const p = provider(conf.providerURL);
    switch (env) {
      case "sepolia":
        expect(await p.getSpecVersion()).toBe("0.6.0");
        break;
      default:
        expect(await p.getSpecVersion()).toBe("0.7.1");
        break;
    }
  });

  it("checks the $ETH balance", async () => {
    const c = config(env);
    const amount = await ethBalance(c.accounts[0].address, c);
    expect(amount).toBeGreaterThanOrEqual(3n * initial_EthTransfer);
  });

  it("checks the $STRK balance", async () => {
    const c = config(env);
    const amount = await strkBalance(c.accounts[0].address, c);
    switch (env) {
      case "sepolia":
        expect(amount).toBe(0n);
        break;
      default:
        expect(amount).toBeGreaterThanOrEqual(100000000000000000000n);
        break;
    }
  });

  it(
    "transfers $ETH to new account",
    async () => {
      const conf = config(env);
      const a = testAccounts[0];
      const destAddress = conf.accounts[1].address;
      const initialAmount = (await ethBalance(
        conf.accounts[0].address,
        conf
      )) as bigint;
      const receipt = await ethTransfer(a, destAddress, initial_EthTransfer);
      expect(receipt.isSuccess()).toBe(true);
      const finalAmount = (await ethBalance(
        conf.accounts[0].address,
        conf
      )) as bigint;
      expect(initialAmount - finalAmount).toBeGreaterThanOrEqual(
        initial_EthTransfer - 1n
      );
    },
    timeout
  );
});

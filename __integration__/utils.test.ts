import {
  config,
  account,
  provider,
  ethBalance,
  strkBalance,
  ethTransfer,
} from "./utils";
import { initial_EthTransfer, timeout } from "./constants";

describe("utilities (helpers)", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it("checks the config file", async () => {
    const c = config(env);
    switch (env) {
      case "sepolia":
        expect(c.providerURL).toBe(
          "https://starknet-sepolia.public.blastapi.io"
        );
        expect(c.chainID).toBe("0x534e5f5345504f4c4941");
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
      default:
        expect(c.providerURL).toBe("http://127.0.0.1:5050/rpc");
        expect(c.chainID).toBe("0x534e5f474f45524c49");
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
    }
  });

  it("checks the provider version", async () => {
    const p = provider(env);
    switch (env) {
      case "sepolia":
        expect(await p.getSpecVersion()).toBe("0.6.0");
        break;
      default:
        expect(await p.getSpecVersion()).toBe("0.7.0");
        break;
    }
  });

  it("checks the $ETH balance", async () => {
    const c = config(env);
    const amount = await ethBalance(c.accounts[0].address, env);
    expect(amount).toBeGreaterThanOrEqual(10000000000000000n);
  });

  it("checks the $STRK balance", async () => {
    const c = config(env);
    const amount = await strkBalance(c.accounts[0].address, env);
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
      const c = config(env);
      const a = account(0, env);
      const destAddress = c.accounts[1].address;
      const initialAmount = (await ethBalance(
        c.accounts[0].address,
        env
      )) as bigint;
      const receipt = await ethTransfer(
        a,
        destAddress,
        initial_EthTransfer,
        env
      );
      expect(receipt.isSuccess()).toBe(true);
      const finalAmount = (await ethBalance(
        c.accounts[0].address,
        env
      )) as bigint;
      expect(initialAmount - finalAmount).toBeGreaterThanOrEqual(
        initial_EthTransfer - 1n
      );
    },
    timeout
  );
});

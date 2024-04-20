import { config, testAccounts } from "./utils";
import { initial_EthTransfer, default_timeout } from "./parameters";
import { ETH, STRK } from "./natives";
import { RpcProvider, type Call } from "starknet";

describe("native tokens management", () => {
  let env = "devnet";

  it("checks an $ETH balance", async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await (
      await new ETH(provider)
    ).balance_of(testAccounts(conf)[0].address);
    expect(amount).toBeGreaterThanOrEqual(3n * initial_EthTransfer);
  });

  it("checks an $STRK balance", async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await new ETH(provider).balance_of(
      testAccounts(conf)[0].address
    );
    switch (env) {
      case "sepolia":
        expect(amount).toBe(0n);
        break;
      default:
        expect(amount).toBeGreaterThanOrEqual(3n * initial_EthTransfer);
        break;
    }
  });

  it(
    "transfers $ETH",
    async () => {
      const conf = config(env);
      const accounts = testAccounts(conf);
      const eth = new ETH(accounts[0]);
      const destAddress = accounts[1].address;
      const initialAmount = (await eth.balance_of(destAddress)) as bigint;

      const { transaction_hash } = await eth.transfer(
        destAddress,
        initialAmount
      );
      const receipt = await accounts[0].waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
      const finalAmount = (await eth.balance_of(destAddress)) as bigint;
      expect(finalAmount - initialAmount).toBe(initial_EthTransfer);
    },
    default_timeout
  );
});

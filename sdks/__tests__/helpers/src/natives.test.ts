import { config, testAccounts } from "./utils";
import { initial_EthTransfer, default_timeout } from "./parameters";
import { ETH } from "./natives";
import { RpcProvider, uint256, cairo } from "starknet";

describe("native tokens management", () => {
  let env = "devnet";

  it("checks an $ETH balance", async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await (
      await ETH(provider)
    ).balance_of(testAccounts(conf)[0].address);
    expect(amount).toBeGreaterThanOrEqual(
      3n * uint256.uint256ToBN(initial_EthTransfer)
    );
  });

  it("checks an $STRK balance", async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await ETH(provider).balance_of(
      testAccounts(conf)[0].address
    );
    switch (env) {
      case "sepolia":
        expect(amount).toBe(0n);
        break;
      default:
        expect(amount).toBeGreaterThanOrEqual(
          3n * uint256.uint256ToBN(initial_EthTransfer)
        );
        break;
    }
  });

  it(
    "transfers $ETH",
    async () => {
      const conf = config(env);
      const accounts = testAccounts(conf);
      const eth = ETH(accounts[0]);
      const destAddress = accounts[1].address;
      const initialAmount = (await eth.balance_of(destAddress)) as bigint;

      const { transaction_hash } = await eth.transfer(
        destAddress,
        initial_EthTransfer
      );
      const receipt = await accounts[0].waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
      const finalAmount = (await eth.balance_of(destAddress)) as bigint;
      expect(finalAmount - initialAmount).toBe(
        uint256.uint256ToBN(initial_EthTransfer)
      );
    },
    default_timeout
  );
});

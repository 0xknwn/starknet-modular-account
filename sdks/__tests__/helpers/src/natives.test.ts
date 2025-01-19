import { config, testAccounts } from "./utils";
import { initial_EthTransfer, default_timeout } from "./parameters";
import { ETH, STRK } from "./natives";
import { RpcProvider, uint256 } from "starknet";

import { data } from "./data.fixture";


describe.each(data)("native tokens management", ({ fees, accountID }) => {
  let env = "devnet";

  it(`[${fees}] checks an $ETH balance`, async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await (
      await ETH(provider)
    ).balance_of(testAccounts(conf)[accountID].address);
    expect(amount).toBeGreaterThanOrEqual(
      3n * uint256.uint256ToBN(initial_EthTransfer)
    );
  });

  it(`[${fees}] checks an $STRK balance`, async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await ETH(provider).balance_of(
      testAccounts(conf)[accountID].address
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
    `[${fees}] transfers ${fees === "WEI" ? "$ETH" : "$STRK"}`,
    async () => {
      const conf = config(env);
      const accounts = testAccounts(conf);
      const TOKEN = (fees === "WEI" ? ETH : STRK)
      const eth = TOKEN(accounts[accountID]);
      const destAddress = accounts[2].address;
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

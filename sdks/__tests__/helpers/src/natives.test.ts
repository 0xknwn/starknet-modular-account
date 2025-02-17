import { config, testAccounts } from "./utils";
import { initial_StrkTransfer, default_timeout } from "./parameters";
import { STRK } from "./natives";
import { RpcProvider, uint256 } from "starknet";

import { data } from "./data.fixture";

describe.each(data)("native tokens management", ({ fees, accountID }) => {
  let env = "devnet";

  it(`[${fees}] checks an $STRK balance`, async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    const amount = await STRK(provider).balance_of(
      testAccounts(conf)[accountID].address
    );
    switch (env) {
      case "sepolia":
        expect(amount).toBe(0n);
        break;
      default:
        expect(amount).toBeGreaterThanOrEqual(
          3n * uint256.uint256ToBN(initial_StrkTransfer)
        );
        break;
    }
  });

  it(
    `[${fees}] transfers "$STRK"`,
    async () => {
      const conf = config(env);
      const accounts = testAccounts(conf);
      const TOKEN = STRK;
      const token = TOKEN(accounts[accountID]);
      const destAddress = accounts[2].address;
      const initialAmount = (await token.balance_of(destAddress)) as bigint;

      const { transaction_hash } = await token.transfer(
        destAddress,
        initial_StrkTransfer
      );
      const receipt = await accounts[0].waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
      const finalAmount = (await token.balance_of(destAddress)) as bigint;
      expect(finalAmount - initialAmount).toBe(
        uint256.uint256ToBN(initial_StrkTransfer)
      );
    },
    default_timeout
  );
});

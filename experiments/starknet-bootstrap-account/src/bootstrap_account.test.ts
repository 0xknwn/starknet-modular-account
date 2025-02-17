import {
  testAccounts,
  default_timeout,
  config,
  initial_EthTransfer,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import { classNames, classHash } from "@0xknwn/starknet-contracts";
import { bootstrapAccountAddress } from "./bootstrap_account";
import { deployAccount } from "./contract";
import { Account, RpcProvider, CallData } from "starknet";
import { ABI as AccountABI } from "./abi/BootstrapAccount";

describe("bootstrapping an account", () => {
  let env: string;
  let account: Account;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "sends ETH to the BootstrapAccount address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const address = bootstrapAccountAddress(
        publicKey,
        classHash(classNames.SimpleValidator)
      );
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      let receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      account = new Account(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys the BootstrapAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const calldata = new CallData(AccountABI).compile("constructor", {
        public_key: publicKey,
        target_class: classHash(classNames.SimpleValidator),
      });
      const address = await deployAccount(
        account,
        classNames.BootstrapAccount,
        publicKey,
        calldata
      );
      expect(address).toEqual(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          classHash(classNames.SimpleValidator)
        )
      );
    },
    default_timeout
  );

  it(
    "checks the account class is now SimpleValidator",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const accountClass = await a.getClassHashAt(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          classHash(classNames.SimpleValidator)
        )
      );
      expect(accountClass).toEqual(classHash(classNames.SimpleValidator));
    },
    default_timeout
  );
});

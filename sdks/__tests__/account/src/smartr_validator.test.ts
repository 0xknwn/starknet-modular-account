import {
  testAccounts,
  default_timeout,
  config,
  initial_EthTransfer,
  initial_StrkTransfer,
  ETH,
  STRK,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { RpcProvider, num, CallData, shortString } from "starknet";
import { data } from "./data.fixture";

describe.each(data)(
  "call and execute on validator",
  ({ name, version, accountID }) => {
    let env: string;
    let smartrAccount: SmartrAccount;

    beforeAll(() => {
      env = "devnet";
    });

    it(
      `[${name}] deploys the starkValidator class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareAccountClass(a, "StarkValidator", {
          version: version.declare,
        });
        expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
      },
      default_timeout
    );

    it(
      `[${name}] deploys the SmartrAccount class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareAccountClass(a, "SmartrAccount", {
          version: version.declare,
        });
        expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
      },
      default_timeout
    );

    it(
      `[${name}] sends ${name === "WEI" ? "$ETH" : "FRI"} to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const publicKey = conf.accounts[accountID].publicKey;
        const privateKey = conf.accounts[accountID].privateKey;
        const starkValidatorClassHash = accountClassHash("StarkValidator");
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: starkValidatorClassHash,
          args: [publicKey],
        });
        const address = accountAddress("SmartrAccount", publicKey, calldata);
        const TOKEN = name === "WEI" ? ETH : STRK;
        const initial_transfer =
          name === "WEI" ? initial_EthTransfer : initial_StrkTransfer;
        const { transaction_hash } = await TOKEN(sender).transfer(
          address,
          initial_transfer
        );
        const receipt = await sender.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toEqual(true);
        smartrAccount = new SmartrAccount(
          p,
          address,
          privateKey,
          undefined,
          "1",
          name === "WEI" ? "0x2" : "0x3"
        );
      },
      default_timeout
    );

    it(
      `[${name}] deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const publicKey = conf.accounts[accountID].publicKey;
        const starkValidatorClassHash = accountClassHash("StarkValidator");
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: starkValidatorClassHash,
          args: [publicKey],
        });
        const address = await deployAccount(
          smartrAccount,
          "SmartrAccount",
          publicKey,
          calldata,
          { version: version.deploy_account }
        );
        expect(address).toEqual(
          accountAddress("SmartrAccount", publicKey, calldata)
        );
      },
      default_timeout
    );

    it(
      `[${name}] checks the StarkValidator name`,
      async () => {
        const conf = config(env);

        const calldata = new CallData(StarkValidatorABI);
        const data = calldata.compile("get_name", {});
        const output = await smartrAccount.callOnModule(
          accountClassHash("StarkValidator"),
          "get_name",
          data
        );
        expect(Array.isArray(output)).toBe(true);
        expect(output.length).toEqual(1);
        expect(`0x${num.toBigInt(output[0]).toString(16)}`).toEqual(
          shortString.encodeShortString("stark-validator")
        );
      },
      default_timeout
    );
  }
);

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
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { RpcProvider, num, CallData, shortString } from "starknet";
import { data } from "./data.fixture";

describe.each(data)(
  "call and execute on validator",
  ({ fees, version, accountID }) => {
    let env: string;
    let smartrAccount: SmartrAccount;

    beforeAll(() => {
      env = "devnet";
    });

    it(
      `[${fees}] sends "$STRK" to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const publicKey = conf.accounts[accountID].publicKey;
        const privateKey = conf.accounts[accountID].privateKey;
        const starkValidatorClassHash = classHash(classNames.StarkValidator);
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: starkValidatorClassHash,
          args: [publicKey],
        });
        const address = accountAddress(
          classNames.SmartrAccount,
          publicKey,
          calldata
        );
        const TOKEN = STRK;
        const initial_transfer = initial_StrkTransfer;
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
          "0x3"
        );
      },
      default_timeout
    );

    it(
      `[${fees}] deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const publicKey = conf.accounts[accountID].publicKey;
        const starkValidatorClassHash = classHash(classNames.StarkValidator);
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: starkValidatorClassHash,
          args: [publicKey],
        });
        const address = await deployAccount(
          smartrAccount,
          classNames.SmartrAccount,
          publicKey,
          calldata,
          { version: version.deploy_account }
        );
        expect(address).toEqual(
          accountAddress(classNames.SmartrAccount, publicKey, calldata)
        );
      },
      default_timeout
    );

    it(
      `[${fees}] checks the StarkValidator name`,
      async () => {
        const conf = config(env);

        const calldata = new CallData(StarkValidatorABI);
        const data = calldata.compile("get_name", {});
        const output = await smartrAccount.callOnModule(
          classHash(classNames.StarkValidator),
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

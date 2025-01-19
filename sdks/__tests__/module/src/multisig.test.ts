import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  CounterABI,
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
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  MultisigValidatorABI,
} from "@0xknwn/starknet-module";
import { Contract, RpcProvider, CallData } from "starknet";
import { data } from "./data.fixture";

describe.each([data[0]])(
  "multiple signature",
  ({ fees, accountID, altAccountID, thirdAccountID, version }) => {
    let env: string;
    let counterContract: Counter;
    let smartrAccount: SmartrAccount;
    let smartrAccount2: SmartrAccount;

    beforeAll(() => {
      env = "devnet";
    });

    it(
      `[${fees}][multisig]: declares the Counter class`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await declareHelperClass(account, "Counter", {
          version: version.declare,
        });
        expect(c.classHash).toEqual(helperClassHash("Counter"));
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: deploys the Counter contract`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await deployCounter(account, account.address, {
          version: version.invoke,
        });
        expect(c.address).toEqual(
          await counterAddress(account.address, account.address)
        );
        counterContract = new Counter(c.address, testAccounts(conf)[accountID]);
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: declares the MultisigValidator class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareModuleClass(a, "MultisigValidator", {
          version: version.declare,
        });
        expect(c.classHash).toEqual(moduleClassHash("MultisigValidator"));
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: declares the SmartrAccount class`,
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
      `[${fees}][multisig]: sends ${fees === "WEI" ? "$ETH" : "$STRK"} to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const privateKey = conf.accounts[accountID].privateKey;
        const publicKey = conf.accounts[accountID].publicKey;
        const moduleValidatorClassHash = moduleClassHash("MultisigValidator");
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: moduleValidatorClassHash,
          args: [publicKey],
        });
        const address = accountAddress("SmartrAccount", publicKey, calldata);
        const TOKEN = fees === "WEI" ? ETH : STRK;
        const initial_transfer =
          fees === "WEI" ? initial_EthTransfer : initial_StrkTransfer;
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
          fees === "WEI" ? "0x2" : "0x3"
        );
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const publicKey = conf.accounts[accountID].publicKey;
        const moduleValidatorClassHash = moduleClassHash("MultisigValidator");
        const calldata = new CallData(SmartrAccountABI).compile("constructor", {
          core_validator: moduleValidatorClassHash,
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
      `[${fees}][multisig]: checks the SmartAccount public keys`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_public_keys", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_public_keys",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        expect(`0x${c[0].toString(16)}`).toEqual(
          conf.accounts[accountID].publicKey
        );
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: checks the SmartAccount threshold`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_threshold", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_threshold",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        expect(`${c[0].toString(10)}`).toEqual("1");
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: resets the counter`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const { transaction_hash } = await counterContract.reset();
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: increments the counter from SmartrAccount and succeed`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        if (!smartrAccount) {
          throw new Error("SmartrAccount not installed");
        }
        const counterWithSmartrAccount = new Counter(
          counterContract.address,
          smartrAccount
        );
        const { transaction_hash } = await counterWithSmartrAccount.increment();
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: reads the counter`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const c = await counterContract.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: resets the counter from SmartrAccount and fails`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        if (!smartrAccount) {
          throw new Error("SmartrAccount not installed");
        }
        const counterWithSmartrAccount = new Counter(
          counterContract.address,
          smartrAccount
        );
        try {
          await counterWithSmartrAccount.reset();
          expect(true).toBe(false);
        } catch (e) {
          expect(e).toBeDefined();
        }
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: checks the SmartAccount threshold`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_threshold", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_threshold",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        expect(`${c[0].toString(10)}`).toEqual("1");
      },
      default_timeout
    );

    it(
      `[${fees}][multisig]: adds a 2nd public key to the account`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const privateKey = conf.accounts[altAccountID].privateKey;
        const data = calldata.compile("add_public_key", {
          new_public_key: conf.accounts[altAccountID].publicKey,
        });
        const { transaction_hash } = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "add_public_key",
          data
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        smartrAccount2 = new SmartrAccount(
          p,
          smartrAccount.address,
          privateKey,
          undefined,
          "1",
          fees === "WEI" ? "0x2" : "0x3"
        );
      },
      default_timeout
    );

    //     {
    //       "id": 24,
    //       "jsonrpc": "2.0",
    //       "method": "starknet_addInvokeTransaction",
    //       "params": {
    //           "invoke_transaction": {
    //               "sender_address": "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //               "calldata": [
    //                   "0x1",
    //                   "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //                   "0xbfb2f3450c21a965fd95a307de13dc3a3a2e895295bd1e0dd0bb0a4becda91",
    //                   "0x5",
    //                   "0x19da2f37761c714440e9df65c8f503633860fabce5e3a6794f951ce4582301b",
    //                   "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //                   "0x10614fbc3f1dc530171581ef560576d6306ca5e57101c8fe0640d7fb209dd54",
    //                   "0x1",
    //                   "0x5e05d2510c6110bde03df9c1c126a1f592207d78cd9e481ac98540d5336d23c"
    //               ],
    //               "type": "INVOKE",
    //               "max_fee": "0x17c9f9fd6a800",
    //               "version": "0x1",
    //               "signature": [
    //                   "0x1ff15f87f1609f48b18a8b0805c669b26635f67b232aff184deefdf4763e189",
    //                   "0x593fb6911f26b3280115b43ba540a75041e3d79940401d61fce77f006a28ec2"
    //               ],
    //               "nonce": "0x2"
    //           }
    //       }
    //   }

    //   {
    //     "jsonrpc": "2.0",
    //     "id": 24,
    //     "result": {
    //         "transaction_hash": "0x41c94a3627ceb487c57f1d08780b6b1395a50dea8831576401059ed5fa5d7c1"
    //     }
    // }

    // {
    //   "jsonrpc": "2.0",
    //   "id": 26,
    //   "result": {
    //       "type": "INVOKE",
    //       "transaction_hash": "0x41c94a3627ceb487c57f1d08780b6b1395a50dea8831576401059ed5fa5d7c1",
    //       "actual_fee": {
    //           "unit": "WEI",
    //           "amount": "0x1a02f4d73000"
    //       },
    //       "messages_sent": [],
    //       "events": [
    //           {
    //               "from_address": "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //               "keys": [
    //                   "0x38f6a5b87c23cee6e7294bcc3302e95019f70f81586ff3cac38581f5ca96381",
    //                   "0x1",
    //                   "0x5e05d2510c6110bde03df9c1c126a1f592207d78cd9e481ac98540d5336d23c"
    //               ],
    //               "data": []
    //           },
    //           {
    //               "from_address": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    //               "keys": [
    //                   "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9",
    //                   "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //                   "0x1000"
    //               ],
    //               "data": [
    //                   "0x1a02f4d73000",
    //                   "0x0"
    //               ]
    //           }
    //       ],
    //       "execution_status": "SUCCEEDED",
    //       "finality_status": "ACCEPTED_ON_L2",
    //       "block_hash": "0x29a5cf5db156ce4c37f3d2a5768ecfe4cddc784136892e3678d6805fe6400e",
    //       "block_number": 9,
    //       "execution_resources": {
    //           "steps": 11266,
    //           "memory_holes": 56,
    //           "range_check_builtin_applications": 428,
    //           "pedersen_builtin_applications": 24,
    //           "poseidon_builtin_applications": 5,
    //           "ec_op_builtin_applications": 3,
    //           "data_availability": {
    //               "l1_gas": 0,
    //               "l1_data_gas": 256
    //           }
    //       }
    //   }
    // }

    it(
      `[${fees}][multisig]: checks the new public key with the account`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_public_keys", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_public_keys",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(2);
        expect(`0x${c[1].toString(16)}`).toEqual(
          conf.accounts[altAccountID].publicKey
        );
      },
      default_timeout
    );

    //   {
    //     "id": 27,
    //     "jsonrpc": "2.0",
    //     "method": "starknet_call",
    //     "params": {
    //         "request": {
    //             "contract_address": "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //             "entry_point_selector": "0x2bd15d41c1a8af64fef878fc63438199c8705040c251dc6fd3ac2b9ff059498",
    //             "calldata": [
    //                 "0x19da2f37761c714440e9df65c8f503633860fabce5e3a6794f951ce4582301b",
    //                 "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //                 "0x31ebf1e6b0cb31ee2c1b4eec8fc04b526210f1b97fc1c99c5b1baa10d820bf8",
    //                 "0x0"
    //             ]
    //         },
    //         "block_id": "pending"
    //     }
    // }

    //   {
    //     "jsonrpc": "2.0",
    //     "id": 27,
    //     "result": [
    //         "0x2",
    //         "0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b",
    //         "0x5e05d2510c6110bde03df9c1c126a1f592207d78cd9e481ac98540d5336d23c"
    //     ]
    // }

    it(
      `[${fees}][multisig]: resets the counter with owner`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const { transaction_hash } = await counterContract.reset();
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    //   {
    //     "id": 11,
    //     "jsonrpc": "2.0",
    //     "method": "starknet_addInvokeTransaction",
    //     "params": {
    //         "invoke_transaction": {
    //             "sender_address": "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    //             "calldata": [
    //                 "0x1",
    //                 "0x2ae7a2b0ede9a997e2d53e2b99f67877ac68e8de4266f30706b24bd6cd53190",
    //                 "0x2eb92e3029c3933e5350d8418880dd9fa7c329cb0cbf40a904129df80f1a668",
    //                 "0x0"
    //             ],
    //             "type": "INVOKE",
    //             "max_fee": "0x256156e67800",
    //             "version": "0x1",
    //             "signature": [
    //                 "0x75ed599f47b2fbb5df5aaba7b3d8170a91e990533dba4fdc0a3815e38b77b30",
    //                 "0x4d0c9f7f70bb941bb55a29a03a6b1157d1ffe267075f671d6be86bb0d8ecce8"
    //             ],
    //             "nonce": "0x6"
    //         }
    //     }
    // }

    //   {
    //     "jsonrpc": "2.0",
    //     "id": 2,
    //     "result": {
    //         "type": "INVOKE",
    //         "transaction_hash": "0x338669c5fcda183c8ae59d06e70e0c86d5251eb3b4db6d87a3905b205d881a1",
    //         "actual_fee": {
    //             "unit": "WEI",
    //             "amount": "0x191a20322000"
    //         },
    //         "messages_sent": [],
    //         "events": [
    //             {
    //                 "from_address": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    //                 "keys": [
    //                     "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9",
    //                     "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    //                     "0x1000"
    //                 ],
    //                 "data": [
    //                     "0x191a20322000",
    //                     "0x0"
    //                 ]
    //             }
    //         ],
    //         "execution_status": "SUCCEEDED",
    //         "finality_status": "ACCEPTED_ON_L2",
    //         "block_hash": "0x755444aa2164a4603ce3619d937abf751fb9547807595c5cf861091717cae59",
    //         "block_number": 10,
    //         "execution_resources": {
    //             "steps": 7556,
    //             "memory_holes": 127,
    //             "range_check_builtin_applications": 265,
    //             "pedersen_builtin_applications": 18,
    //             "poseidon_builtin_applications": 5,
    //             "ec_op_builtin_applications": 3,
    //             "data_availability": {
    //                 "l1_gas": 0,
    //                 "l1_data_gas": 256
    //             }
    //         }
    //     }
    // }

    it(
      `[${fees}][multisig]: increments the counter with newly added owner`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        if (!smartrAccount2) {
          throw new Error("SmartrAccount not installed");
        }
        const conf = config(env);
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const counterFromAltSmartrAccount = new Counter(
          counterContract.address,
          smartrAccount2
        );
        const { transaction_hash } =
          await counterFromAltSmartrAccount.increment();
        const receipt =
          await smartrAccount2.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    //   {
    //     "id": 6,
    //     "jsonrpc": "2.0",
    //     "method": "starknet_addInvokeTransaction",
    //     "params": {
    //         "invoke_transaction": {
    //             "sender_address": "0xf88b855a7edf7f098ad72666752437c581e47e136ddaf953f6d1abc48e0616",
    //             "calldata": [
    //                 "0x1",
    //                 "0x2ae7a2b0ede9a997e2d53e2b99f67877ac68e8de4266f30706b24bd6cd53190",
    //                 "0x7a44dde9fea32737a5cf3f9683b3235138654aa2d189f6fe44af37a61dc60d",
    //                 "0x0"
    //             ],
    //             "type": "INVOKE",
    //             "max_fee": "0x17312e7118000",
    //             "version": "0x1",
    //             "signature": [
    //                 "0x78551fab3d8872a6f99e0b572acebc1e60a9e0a1d5c6f32aacf6b74aa100b27",
    //                 "0x5bd333e5a1458330f202ae7ccf2ead42c69109557562e8342a29d2d19622f10"
    //             ],
    //             "nonce": "0x3"
    //         }
    //     }
    // }

    it.skip(
      `[${fees}][multisig]: reads the counter`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const c = await counterContract.get();
        expect(c).toBe(1n);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: resets the counter with owner`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const { transaction_hash } = await counterContract.reset();
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: updates the account threshold to 2`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("set_threshold", {
          new_threshold: 2,
        });
        const { transaction_hash } = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "set_threshold",
          data
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: adds a 3rd public key to the account`,
      async () => {
        const conf = config(env);
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("add_public_key", {
          new_public_key: conf.accounts[thirdAccountID].publicKey,
        });
        const transactions = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "add_public_key",
          data,
          false
        );
        const detail = await smartrAccount.prepareMultisig(transactions);
        const signature1 = await smartrAccount.signMultisig(
          transactions,
          detail
        );
        const signature2 = await smartrAccount2.signMultisig(
          transactions,
          detail
        );
        const { transaction_hash } = await smartrAccount.executeMultisig(
          transactions,
          detail,
          [...signature1, ...signature2]
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: checks the new public key with the account"`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_public_keys", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_public_keys",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(3);
        expect(`0x${c[2].toString(16)}`).toEqual(
          conf.accounts[thirdAccountID].publicKey
        );
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: increments the counter with 2 of 3 signers`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const conf = config(env);
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const counter = new Contract(CounterABI, counterContract.address, p);
        const transaction = counter.populate("increment", []);
        const transactions = [transaction];
        const detail = await smartrAccount.prepareMultisig(transactions);
        const signature1 = await smartrAccount.signMultisig(
          transactions,
          detail
        );
        const signature2 = await smartrAccount2.signMultisig(
          transactions,
          detail
        );
        const { transaction_hash } = await smartrAccount.executeMultisig(
          transactions,
          detail,
          [...signature1, ...signature2]
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: reads the counter`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const c = await counterContract.get();
        expect(c).toBe(1n);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: increments the counter with 1 of 3 signers and fails`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const conf = config(env);
        // @todo manage the 2 account to run this
        const counterFromAltSmartrAccount = new Counter(
          counterContract.address,
          smartrAccount
        );
        try {
          // @todo: change this to 1n
          const { transaction_hash } =
            await counterFromAltSmartrAccount.increment();
          expect(true).toBe(false);
        } catch (e) {
          expect(e).toBeDefined();
        }
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: resets the counter with owner`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const { transaction_hash } = await counterContract.reset();
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: updates the account threshold to 1`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("set_threshold", {
          new_threshold: 1,
        });
        const transactions = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "set_threshold",
          data,
          false
        );
        const detail = await smartrAccount.prepareMultisig(transactions);
        const signature1 = await smartrAccount.signMultisig(
          transactions,
          detail
        );
        const signature2 = await smartrAccount2.signMultisig(
          transactions,
          detail
        );
        const { transaction_hash } = await smartrAccount.executeMultisig(
          transactions,
          detail,
          [...signature1, ...signature2]
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: checks the SmartAccount threshold is back to 1`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_threshold", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_threshold",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        expect(`${c[0].toString(10)}`).toEqual("1");
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: increments the counter from SmartrAccount and succeed`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        if (!smartrAccount) {
          throw new Error("SmartrAccount not installed");
        }
        const { transaction_hash } = await counterContract.increment();
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: removes the 2nd public key from the account`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("remove_public_key", {
          old_public_key: conf.accounts[altAccountID].publicKey,
        });
        const { transaction_hash } = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "remove_public_key",
          data
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: checks the public key with the account are 2`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_public_keys", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_public_keys",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(2);
        const conf = config(env);
        expect(`0x${c[1].toString(16)}`).toEqual(
          conf.accounts[thirdAccountID].publicKey
        );
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: removes the ex-3rd public key from the account`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("remove_public_key", {
          old_public_key: conf.accounts[thirdAccountID].publicKey,
        });
        const { transaction_hash } = await smartrAccount.executeOnModule(
          moduleClassHash("MultisigValidator"),
          "remove_public_key",
          data
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: checks the public key with the account are 1`,
      async () => {
        const calldata = new CallData(MultisigValidatorABI);
        const data = calldata.compile("get_public_keys", {});
        const c = await smartrAccount.callOnModule(
          moduleClassHash("MultisigValidator"),
          "get_public_keys",
          data
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        const conf = config(env);
        expect(`0x${c[0].toString(16)}`).toEqual(
          conf.accounts[accountID].publicKey
        );
      },
      default_timeout
    );

    it.skip(
      `[${fees}][multisig]: increments the counter from SmartrAccount and succeed`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const { transaction_hash } = await counterContract.increment();
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );
  }
);

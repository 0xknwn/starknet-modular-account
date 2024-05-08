import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  initial_EthTransfer,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData } from "starknet";
import { EthModule } from "@0xknwn/starknet-module-eth";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";

describe("sessionkey management", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithEth: SmartrAccount;
  let connectedChain: string;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      connectedChain = await account.getChainId();
    },
    default_timeout
  );

  it(
    "declare the Counter class",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
    },
    default_timeout
  );

  it(
    "deploys the Counter contract",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await deployCounter(account, account.address);
      expect(c.address).toEqual(
        await counterAddress(account.address, account.address)
      );
      counterContract = new Counter(c.address, testAccounts(conf)[0]);
    },
    default_timeout
  );

  it(
    "deploys the starkValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    "deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "sends ETH to the account address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        public_key: [publicKey],
      });
      const address = accountAddress("SmartrAccount", publicKey, calldata);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[0].publicKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        public_key: [publicKey],
      });
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount threshold",
    async () => {
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
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
    "resets the counter",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
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
    "increments the counter from SmartrAccount and succeed",
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
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "reads the counter",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const c = await counterContract.get();
      expect(c).toBeGreaterThan(0n);
    },
    default_timeout
  );

  // it(
  //   "deploys the EthValidator class",
  //   async () => {
  //     const conf = config(env);
  //     const a = testAccounts(conf)[0];
  //     const c = await declareSessionkeyClass(a, "SessionKeyValidator");
  //     expect(c.classHash).toEqual(sessionkeyClassHash("SessionKeyValidator"));
  //   },
  //   default_timeout
  // );

  // it(
  //   "adds a module to the account",
  //   async () => {
  //     if (!smartrAccount) {
  //       throw new Error("SmartrAccount is not deployed");
  //     }
  //     const { transaction_hash } = await smartrAccount.addModule(
  //       sessionkeyClassHash("SessionKeyValidator")
  //     );
  //     const receipt = await smartrAccount.waitForTransaction(transaction_hash);
  //     expect(receipt.isSuccess()).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "checks the SessionKeyValidator is installed",
  //   async () => {
  //     if (!smartrAccount) {
  //       throw new Error("SmartrAccount is not deployed");
  //     }
  //     const output = await smartrAccount.isModule(
  //       sessionkeyClassHash("SessionKeyValidator")
  //     );
  //     expect(output).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "resets the counter",
  //   async () => {
  //     const conf = config(env);
  //     const account = testAccounts(conf)[0];
  //     if (!counterContract) {
  //       throw new Error("Counter not deployed");
  //     }
  //     const { transaction_hash } = await counterContract.reset();
  //     const receipt = await account.waitForTransaction(transaction_hash);
  //     expect(receipt.isSuccess()).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "creates a typescript session key module",
  //   async () => {
  //     if (!connectedChain) {
  //       expect(connectedChain).toBeDefined();
  //       return;
  //     }
  //     const conf = config(env);
  //     const next_timestamp = BigInt(
  //       Math.floor(Date.now() / 1000) + 24 * 60 * 60
  //     );
  //     sessionKeyModule = new SessionKeyModule(
  //       conf.accounts[1].publicKey,
  //       smartrAccount.address,
  //       sessionkeyClassHash("SessionKeyValidator"),
  //       connectedChain,
  //       `0x${next_timestamp.toString(16)}`
  //     );
  //     const r = await sessionKeyModule.request(
  //       accountClassHash("StarkValidator")
  //     );
  //     expect(r.hash).toBe(
  //       hash_auth_message(
  //         smartrAccount.address,
  //         sessionkeyClassHash("SessionKeyValidator"),
  //         accountClassHash("StarkValidator"),
  //         conf.accounts[1].publicKey,
  //         `0x${next_timestamp.toString(16)}`,
  //         "0x0",
  //         connectedChain
  //       )
  //     );
  //   },
  //   default_timeout
  // );

  // it("signs the typescript session key module", async () => {
  //   if (!sessionKeyModule) {
  //     expect(sessionKeyModule).toBeDefined();
  //     return;
  //   }
  //   const conf = config(env);
  //   const grantor = new SessionKeyGrantor(
  //     accountClassHash("StarkValidator"),
  //     conf.accounts[0].privateKey
  //   );
  //   const signature = await grantor.sign(sessionKeyModule);
  //   expect(signature.length).toEqual(2);
  //   sessionKeyModule.add_signature(signature);
  // });

  // it("creates an account with the session key module", async () => {
  //   if (!sessionKeyModule) {
  //     expect(sessionKeyModule).toBeDefined();
  //     return;
  //   }
  //   const conf = config(env);
  //   const p = new RpcProvider({ nodeUrl: conf.providerURL });
  //   smartrAccountWithSessionKey = new SmartrAccount(
  //     p,
  //     smartrAccount.address,
  //     conf.accounts[1].privateKey,
  //     sessionKeyModule
  //   );
  // });

  // it(
  //   "resets and read the counter from owner account",
  //   async () => {
  //     const conf = config(env);
  //     const a = testAccounts(conf)[0];
  //     const c1 = await counterContract.get();
  //     if (c1 !== 0n) {
  //       const { transaction_hash } = await counterContract.reset();
  //       const receipt = await a.waitForTransaction(transaction_hash);
  //       expect(receipt.isSuccess()).toBe(true);
  //     }
  //     const c2 = await counterContract.get();
  //     expect(c2).toBe(0n);
  //   },
  //   default_timeout
  // );

  // it(
  //   "increments the counter from SmartrAccount with Module and succeed",
  //   async () => {
  //     if (!counterContract) {
  //       throw new Error("Counter not deployed");
  //     }
  //     if (!smartrAccountWithSessionKey) {
  //       throw new Error("SmartrAccount with SessionKey not installed");
  //     }
  //     const counterWithSmartrAccountAndModule = new Counter(
  //       counterContract.address,
  //       smartrAccountWithSessionKey
  //     );
  //     const { transaction_hash } =
  //       await counterWithSmartrAccountAndModule.increment();
  //     const receipt = await smartrAccountWithSessionKey.waitForTransaction(
  //       transaction_hash
  //     );
  //     expect(receipt.isSuccess()).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "disables the sessionkey",
  //   async () => {
  //     const conf = config(env);
  //     const calldata = new CallData(SessionKeyValidatorABI);
  //     const sessionkey = await sessionKeyModule.get_session_key();
  //     const data = calldata.compile("disable_session_key", {
  //       sessionkey,
  //     });
  //     const { transaction_hash } = await smartrAccount.executeOnModule(
  //       sessionkeyClassHash("SessionKeyValidator"),
  //       "disable_session_key",
  //       data
  //     );
  //     const receipt = await smartrAccount.waitForTransaction(transaction_hash);
  //     expect(receipt.isSuccess()).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "checks the sessionkey is disabled",
  //   async () => {
  //     const conf = config(env);
  //     const calldata = new CallData(SessionKeyValidatorABI);
  //     const sessionkey = await sessionKeyModule.get_session_key();
  //     const data = calldata.compile("is_disabled_session_key", {
  //       sessionkey,
  //     });
  //     const output = await smartrAccount.callOnModule(
  //       sessionkeyClassHash("SessionKeyValidator"),
  //       "is_disabled_session_key",
  //       data
  //     );
  //     expect(output.length).toBe(1);
  //     expect(output[0]).toBe(1n);
  //   },
  //   default_timeout
  // );

  // it(
  //   "increments the counter from SmartrAccount with Module and fails",
  //   async () => {
  //     if (!counterContract) {
  //       throw new Error("Counter not deployed");
  //     }
  //     if (!smartrAccountWithSessionKey) {
  //       throw new Error("SmartrAccount with SessionKey not installed");
  //     }
  //     const counterWithSmartrAccountAndModule = new Counter(
  //       counterContract.address,
  //       smartrAccountWithSessionKey
  //     );
  //     try {
  //       const { transaction_hash } =
  //         await counterWithSmartrAccountAndModule.increment();
  //       expect(true).toBe(false);
  //     } catch (e) {
  //       expect(e).toBeDefined();
  //     }
  //   },
  //   default_timeout
  // );

  // it(
  //   "reads the counter",
  //   async () => {
  //     if (!counterContract) {
  //       throw new Error("Counter not deployed");
  //     }
  //     const c = await counterContract.get();
  //     expect(c).toBeGreaterThan(0n);
  //   },
  //   default_timeout
  // );

  // it(
  //   "removes the module from the account",
  //   async () => {
  //     if (!smartrAccount) {
  //       throw new Error("SmartrAccount is not deployed");
  //     }
  //     const { transaction_hash } = await smartrAccount.removeModule(
  //       sessionkeyClassHash("SessionKeyValidator")
  //     );
  //     const receipt = await smartrAccount.waitForTransaction(transaction_hash);
  //     expect(receipt.isSuccess()).toBe(true);
  //   },
  //   default_timeout
  // );

  // it(
  //   "checks the SessionKeyValidator is not installed",
  //   async () => {
  //     if (!smartrAccount) {
  //       throw new Error("SmartrAccount is not deployed");
  //     }
  //     const output = await smartrAccount.isModule(
  //       sessionkeyClassHash("SessionKeyValidator")
  //     );
  //     expect(output).toBe(false);
  //   },
  //   default_timeout
  // );
});

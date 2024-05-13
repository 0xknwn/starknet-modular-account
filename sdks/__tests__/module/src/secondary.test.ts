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
import { RpcProvider, CallData, EthSigner } from "starknet";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  EthModule,
  P256Module,
} from "../../../module/src";
import { P256Signer } from "@0xknwn/starknet-module";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";

const dataset = [
  {
    name: "secp256k1",
    data: {
      privateKey:
        "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2",
      publicKeyArray: [
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ],
      className: "EthValidator" as "EthValidator",
      module: EthModule,
      signer: EthSigner,
    },
  },
  {
    name: "p256",
    data: {
      privateKey:
        "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e",
      // let x: u256 = 0x097420e05fbc83afe4d73b31890187d0cacf2c3653e27f434701a91625f916c2_u256;
      // let y: u256 = 0x98a304ff544db99c864308a9b3432324adc6c792181bae33fe7a4cbd48cf263a_u256;
      publicKeyArray: [
        "269579757328574126121444003492591638210",
        "12566025211498978771503502663570524112",
        "230988565823064299531546210785320445498",
        "202889101106158949967186230758848275236",
      ],
      className: "P256Validator" as "P256Validator",
      module: P256Module,
      signer: P256Signer,
    },
  },
];

describe.each(dataset)("secondary validator management", ({ name, data }) => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithModule: SmartrAccount;
  let connectedChain: string;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    `[${name}]: gets the chain id`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      connectedChain = await account.getChainId();
    },
    default_timeout
  );

  it(
    `[${name}]: declares the Counter class`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
    },
    default_timeout
  );

  it(
    `[${name}]: deploys the Counter contract`,
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
    `[${name}]: declares the starkValidator class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    `[${name}]: declares the SmartrAccount class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    `[${name}]: sends ETH to the account address`,
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
    `[${name}]: deploys a SmartrAccount account`,
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
    `[${name}]: checks the SmartAccount public key`,
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_key",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    `[${name}]: resets the counter`,
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
    `[${name}]: increments the counter from SmartrAccount and succeeds`,
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
    `[${name}]: reads the counter`,
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
    `[${name}]: deploys the Validator class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareModuleClass(a, data.className);
      expect(c.classHash).toEqual(moduleClassHash(data.className));
    },
    default_timeout
  );

  it(
    `[${name}]: adds a module to the account`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const isInstalled = await smartrAccount.isModule(
        moduleClassHash(data.className)
      );
      if (isInstalled) {
        return;
      }
      const { transaction_hash } = await smartrAccount.addModule(
        moduleClassHash(data.className)
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${name}]: checks the module is installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        moduleClassHash(data.className)
      );
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    `[${name}]: sets the public key`,
    async () => {
      if (!Array.isArray(data.publicKeyArray)) {
        throw new Error("Public key array not defined");
      }
      const { transaction_hash } = await smartrAccount.executeOnModule(
        moduleClassHash(data.className),
        "set_public_key",
        data.publicKeyArray
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${name}]: gets the public key`,
    async () => {
      if (!Array.isArray(data.publicKeyArray)) {
        throw new Error("Public key array not defined");
      }
      const result = await smartrAccount.callOnModule(
        moduleClassHash(data.className),
        "get_public_key",
        []
      );
      expect(result.length).toEqual(4);
      expect(result[0]).toEqual(BigInt(data.publicKeyArray[0]));
      expect(result[1]).toEqual(BigInt(data.publicKeyArray[1]));
      expect(result[2]).toEqual(BigInt(data.publicKeyArray[2]));
      expect(result[3]).toEqual(BigInt(data.publicKeyArray[3]));
    },
    default_timeout
  );

  it(
    `[${name}]: resets the counter`,
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

  it(`[${name}]: creates an typescript account with the module`, async () => {
    if (!module) {
      expect(module).toBeDefined();
      return;
    }
    if (!data.privateKey) {
      throw new Error("Wrong private key");
    }
    const conf = config(env);
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    const m = new data.module(smartrAccount.address);
    const signer = new data.signer(data.privateKey);
    smartrAccountWithModule = new SmartrAccount(
      p,
      smartrAccount.address,
      signer,
      m
    );
  });

  it(
    `[${name}]: increments the counter with the account/module and succeeds`,
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccountWithModule) {
        throw new Error("SmartrAccount with Eth Validator not installed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        smartrAccountWithModule
      );
      const { transaction_hash } =
        await counterWithSmartrAccountAndModule.increment();
      const receipt = await smartrAccountWithModule.waitForTransaction(
        transaction_hash
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${name}]: increments the counter with wrong key and fails`,
    async () => {
      if (!module) {
        expect(module).toBeDefined();
        return;
      }
      if (!data.privateKey) {
        throw new Error("Wrong private key");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const m = new data.module(smartrAccount.address);
      const signer = new data.signer("0x1");
      let failedsmartrAccountWithModule = new SmartrAccount(
        p,
        smartrAccount.address,
        signer,
        m
      );
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        failedsmartrAccountWithModule
      );
      try {
        await counterWithSmartrAccountAndModule.increment();
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    `[${name}]: removes the Validator module from the account`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        moduleClassHash(data.className)
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${name}]: checks the Validator is not installed anymore`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        moduleClassHash(data.className)
      );
      expect(output).toBe(false);
    },
    default_timeout
  );
});

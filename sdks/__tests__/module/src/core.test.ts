import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, EthSigner, hash, cairo } from "starknet";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  EthValidatorABI,
} from "../../../module/src";
const initial_EthTransfer = cairo.uint256(10n * 10n ** 15n);

const _more_data = {
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
    module: EthSigner,
  },
};

describe.each([
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
      module: EthSigner,
    },
  },
])("core validator management", ({ name, data }) => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithModule: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      await account.getChainId();
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
    `deploys the ${data.className} class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareModuleClass(a, data.className);
      expect(c.classHash).toEqual(moduleClassHash(data.className));
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
      const privateKey = conf.accounts[0].privateKey;
      const moduleValidatorClassHash = moduleClassHash(data.className);
      const calldata = [
        moduleValidatorClassHash,
        data.publicKeyArray.length.toString(10),
        ...data.publicKeyArray,
      ];
      const salt = hash.computeHashOnElements(data.publicKeyArray);
      const address = accountAddress("SmartrAccount", salt, calldata);
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
    "configures the SmartrAccount with the EthSigner",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const signer = new data.module(data.privateKey);
      smartrAccountWithModule = new SmartrAccount(
        p,
        smartrAccount.address,
        signer
      );
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const moduleValidatorClassHash = moduleClassHash(data.className);
      const calldata = [
        moduleValidatorClassHash,
        data.publicKeyArray.length.toString(10),
        ...data.publicKeyArray,
      ];
      const salt = hash.computeHashOnElements(data.publicKeyArray);
      const address = await deployAccount(
        smartrAccountWithModule,
        "SmartrAccount",
        salt,
        calldata
      );
      expect(address).toEqual(accountAddress("SmartrAccount", salt, calldata));
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public key",
    async () => {
      const conf = config(env);
      const calldata = new CallData(EthValidatorABI);
      const nestedCalldata = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash(data.className),
        "get_public_key",
        nestedCalldata
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(4);
      expect(c[0].toString(10)).toEqual(data.publicKeyArray[0]);
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
      if (!smartrAccountWithModule) {
        throw new Error("SmartrAccount not installed");
      }
      const counterWithSmartrAccount = new Counter(
        counterContract.address,
        smartrAccountWithModule
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
});

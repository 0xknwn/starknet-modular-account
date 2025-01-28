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
  STRK,
  initial_EthTransfer,
  initial_StrkTransfer,
  classNames as helperClassNames,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  classNames as accountClassNames,
} from "@0xknwn/starknet-modular-account";
import {
  RpcProvider,
  CallData,
  EthSigner,
  Signer,
  hash,
  cairo,
  UniversalDetails,
  Account,
  BigNumberish,
} from "starknet";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  EthValidatorABI,
  P256ValidatorABI,
  P256Signer,
  classNames as moduleClassNames,
} from "@0xknwn/starknet-module";
import { V1, V2, V3 } from "./data.fixture";

const declareClass = async (
  a: Account,
  className: moduleClassNames | accountClassNames.StarkValidator,
  version: BigNumberish | undefined
) => {
  if (className === accountClassNames.StarkValidator) {
    const c = await declareAccountClass(a, className, {
      version,
    });
    return c;
  }
  const c = await declareModuleClass(a, className, {
    version,
  });
  return c;
};

const classHash = (
  className: moduleClassNames | accountClassNames.StarkValidator
) => {
  if (className === accountClassNames.StarkValidator) {
    const c = accountClassHash(className);
    return c;
  }
  const c = moduleClassHash(className);
  return c;
};

const dataset = [
  {
    name: "stark",
    fees: "WEI",
    version: {
      invoke: V1,
      declare: V2,
      deploy_account: V1,
    },
    accountID: 0,
    data: {
      privateKey: "0xabcdef",
      publicKeyArray: [
        "0x636891ed7d6a8a4bf0c6c96cf3a1562b03d6fb63909691f9504f2f2b67d43be",
      ],
      className: accountClassNames.StarkValidator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: Signer,
      validatorABI: EthValidatorABI,
    },
  },
  {
    name: "stark",
    fees: "FRI",
    version: {
      invoke: V3,
      declare: V3,
      deploy_account: V3,
    },
    accountID: 1,
    data: {
      privateKey: "0xabcdef",
      publicKeyArray: [
        "0x636891ed7d6a8a4bf0c6c96cf3a1562b03d6fb63909691f9504f2f2b67d43be",
      ],
      className: accountClassNames.StarkValidator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: Signer,
      validatorABI: EthValidatorABI,
    },
  },
  {
    name: "secp256k1",
    fees: "WEI",
    version: {
      invoke: V1,
      declare: V2,
      deploy_account: V1,
    },
    accountID: 0,
    data: {
      privateKey:
        "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2",
      publicKeyArray: [
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ],
      className: moduleClassNames.EthValidator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: EthSigner,
      validatorABI: EthValidatorABI,
    },
  },
  {
    name: "secp256k1",
    fees: "FRI",
    version: {
      invoke: V3,
      declare: V3,
      deploy_account: V3,
    },
    accountID: 1,
    data: {
      privateKey:
        "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2",
      publicKeyArray: [
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ],
      className: moduleClassNames.EthValidator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: EthSigner,
      validatorABI: EthValidatorABI,
    },
  },
  {
    name: "p256",
    fees: "WEI",
    version: {
      invoke: V1,
      declare: V2,
      deploy_account: V1,
    },
    accountID: 0,
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
      className: moduleClassNames.P256Validator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: P256Signer,
      validatorABI: P256ValidatorABI,
    },
  },
  {
    name: "p256",
    fees: "FRI",
    version: {
      invoke: V3,
      declare: V3,
      deploy_account: V3,
    },
    accountID: 1,
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
      className: moduleClassNames.P256Validator as
        | moduleClassNames
        | accountClassNames.StarkValidator,
      signer: P256Signer,
      validatorABI: P256ValidatorABI,
    },
  },
];

describe.each([dataset[3], dataset[5]])(
  "core validator management",
  ({ name, fees, accountID, version, data }) => {
    let env: string;
    let counterContract: Counter;
    let smartrAccountWithModule: SmartrAccount;

    beforeAll(() => {
      env = "devnet";
    });

    it(
      `[${fees}][${name}]: gets the chain id`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        await account.getChainId();
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: declares the Counter class`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await declareHelperClass(account, helperClassNames.Counter, {
          version: version.declare,
        });
        expect(c.classHash).toEqual(helperClassHash(helperClassNames.Counter));
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: deploys the Counter contract`,
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
      `[${fees}][${name}]: declares the ${data.className} class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareClass(a, data.className, version.declare);
        expect(c.classHash).toEqual(classHash(data.className));
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: declares the SmartrAccount class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareAccountClass(
          a,
          accountClassNames.SmartrAccount,
          {
            version: version.declare,
          }
        );
        expect(c.classHash).toEqual(
          accountClassHash(accountClassNames.SmartrAccount)
        );
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: sends ${fees === "WEI" ? "$ETH" : "$STRK"} to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const moduleValidatorClassHash = classHash(data.className);
        const calldata = [
          moduleValidatorClassHash,
          data.publicKeyArray.length.toString(10),
          ...data.publicKeyArray,
        ];
        const salt = hash.computeHashOnElements(data.publicKeyArray);
        const address = accountAddress(
          accountClassNames.SmartrAccount,
          salt,
          calldata
        );
        const TOKEN = fees === "WEI" ? ETH : STRK;
        const initial_transfer =
          fees === "WEI" ? initial_EthTransfer : initial_StrkTransfer;
        const { transaction_hash } = await TOKEN(sender).transfer(
          address,
          initial_transfer
        );
        const receipt = await sender.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toEqual(true);
        const signer = new data.signer(data.privateKey);
        smartrAccountWithModule = new SmartrAccount(
          p,
          address,
          signer,
          undefined,
          "1",
          fees === "WEI" ? "0x2" : "0x3"
        );
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: checks ${fees === "WEI" ? "$ETH" : "$STRK"} to the account address`,
      async () => {
        const validatorClassHash = classHash(data.className);
        const calldata = [
          validatorClassHash,
          data.publicKeyArray.length.toString(10),
          ...data.publicKeyArray,
        ];
        const salt = hash.computeHashOnElements(data.publicKeyArray);
        const address = accountAddress(
          accountClassNames.SmartrAccount,
          salt,
          calldata
        );
        const TOKEN = fees === "WEI" ? ETH : STRK;
        const value = await TOKEN(smartrAccountWithModule).balance_of(address);
        expect(cairo.uint256(value)).toEqual(
          fees === "WEI" ? initial_EthTransfer : initial_StrkTransfer
        );
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const moduleValidatorClassHash = classHash(data.className);
        const calldata = [
          moduleValidatorClassHash,
          data.publicKeyArray.length.toString(10),
          ...data.publicKeyArray,
        ];
        let options: UniversalDetails = { maxFee: "0x2000000000000" };
        if (fees === "FRI") {
          options = {
            resourceBounds: {
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
              l1_gas: {
                max_amount: "0x2f100",
                max_price_per_unit: "0x22ecb25c00",
              },
            },
          };
        }
        const salt = hash.computeHashOnElements(data.publicKeyArray);
        const address = await deployAccount(
          smartrAccountWithModule,
          accountClassNames.SmartrAccount,
          salt,
          calldata,
          {
            ...options,
            version: version.deploy_account,
          }
        );
        expect(address).toEqual(
          accountAddress(accountClassNames.SmartrAccount, salt, calldata)
        );
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: checks the SmartAccount public key`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(data.validatorABI);
        const nestedCalldata = calldata.compile("get_public_key", {});
        const c = await smartrAccountWithModule.callOnModule(
          classHash(data.className),
          "get_public_key",
          nestedCalldata
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(data.publicKeyArray.length);
        expect(
          data.publicKeyArray[0].startsWith("0x")
            ? `0x${c[0].toString(16)}`
            : c[0].toString(10)
        ).toEqual(data.publicKeyArray[0]);
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: resets the counter`,
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
      `[${fees}][${name}]: increments the counter from SmartrAccount and succeeds`,
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
        const transaction = counterWithSmartrAccount.populate("increment", []);
        const transactions = [transaction];
        let options: UniversalDetails = {};
        if (fees === "FRI") {
          options = {
            resourceBounds: {
              l2_gas: {
                max_amount: "0x0",
                max_price_per_unit: "0x0",
              },
              l1_gas: {
                max_amount: "0x2f100",
                max_price_per_unit: "0x22ecb25c00",
              },
            },
          };
        }
        const { transaction_hash } = await smartrAccountWithModule.execute(
          transactions,
          {
            ...options,
            version: version.invoke,
          }
        );
        const receipt =
          await smartrAccountWithModule.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][${name}]: reads the counter`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        const c = await counterContract.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );
  }
);

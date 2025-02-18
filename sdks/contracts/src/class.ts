import { hash } from "./hash";

export enum classNames {
  BootstrapAccount = "BootstrapAccount",
  Counter = "Counter",
  EthValidator = "EthValidator",
  FailedAccount = "FailedAccount",
  GuardedValidator = "GuardedValidator",
  MultisigValidator = "MultisigValidator",
  P256Validator = "P256Validator",
  SessionKeyValidator = "SessionKeyValidator",
  SimpleAccount = "SimpleAccount",
  SimpleValidator = "SimpleValidator",
  SmartrAccount = "SmartrAccount",
  StarkValidator = "StarkValidator",
  SwapRouter = "SwapRouter",
  TokenA = "TokenA",
  TokenB = "TokenB",
}

export const classHash = (className: classNames = classNames.Counter) => {
  let output: string = "";
  switch (className) {
    case classNames.BootstrapAccount:
      output = hash.BootstrapAccount;
      break;
    case classNames.Counter:
      output = hash.Counter;
      break;
    case classNames.EthValidator:
      output = hash.EthValidator;
      break;
    case classNames.FailedAccount:
      output = hash.FailedAccount;
      break;
    case classNames.GuardedValidator:
      output = hash.GuardedValidator;
      break;
    case classNames.MultisigValidator:
      output = hash.MultisigValidator;
      break;
    case classNames.P256Validator:
      output = hash.P256Validator;
      break;
    case classNames.SessionKeyValidator:
      output = hash.SessionKeyValidator;
      break;
    case classNames.SimpleAccount:
      output = hash.SimpleAccount;
      break;
    case classNames.SimpleValidator:
      output = hash.SimpleValidator;
      break;
    case classNames.SmartrAccount:
      output = hash.SmartrAccount;
      break;
    case classNames.StarkValidator:
      output = hash.StarkValidator;
      break;
    case classNames.SwapRouter:
      output = hash.SwapRouter;
      break;
    case classNames.TokenA:
      output = hash.TokenA;
      break;
    case classNames.TokenB:
      output = hash.TokenB;
      break;
    default:
      throw new Error("Invalid class name");
  }
  return output;
};

// coreValidatorClassHash returns the class hash of the CoreValidator class.
// changing the contract requires to update the cairo account contract core
// sudo validator.
export const coreValidatorClassHash = () =>
  BigInt("0x5ef687e6ba1e2af9173a89c31de98cba691d109939ff87db146db9b5f03703c");

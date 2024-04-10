// coreValidatorClassHash returns the class hash of the CoreValidator class.
// changing the contract requires to update the cairo account contract core
// sudo validator.
export const coreValidatorClassHash = () =>
  BigInt("0xa30f23324c2a0c8348e3ef1e9dbcdc37f9e602c4937c2fba7f6652e724f5db");

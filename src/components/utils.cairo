use starknet::{ClassHash, ContractAddress};
use core::traits::Into;

// @todo: we use the `to`, i.e. first parameter of the call as a placeholder for
// the plugin address. However, the type does not match because we need a
// ClassHash but we have got a ContractAddress. Yet since the 2 types are
// felt252 under the hood, we can convert one to the other. We should discuss
// how much of a concern this is. A way to recover would be to pass the class
// hash as the first parameter of the call and set 0 in the contract address.
// However, this makes the management of parameters more complex and would break
// also if at some point the class_hash does not map a felt252 anymore.
pub fn contractAddress_to_classhash(address: ContractAddress) -> ClassHash {
    let feltAddress: felt252 = address.try_into().unwrap();
    let feltClassHash: ClassHash = feltAddress.try_into().unwrap();
    feltClassHash
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use starknet::{ClassHash, ContractAddress};
    use core::traits::Into;
    use super::contractAddress_to_classhash;

    #[test]
    fn test_map_contractaddress_classhash() {
    let address: ContractAddress = 0x496e76616c696420636c61737320686173682076616c7565.try_into().unwrap();
    let expected_class_hash: ClassHash = 0x496e76616c696420636c61737320686173682076616c7565.try_into().unwrap();
    let class_hash: ClassHash = contractAddress_to_classhash(address);
    assert(class_hash == expected_class_hash, 'Invalid class hash value');
    }
}

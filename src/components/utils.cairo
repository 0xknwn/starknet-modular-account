use starknet::{ClassHash, ContractAddress};
use core::traits::Into;

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

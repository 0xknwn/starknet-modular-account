use starknet::account::Call;
use starknet::{ContractAddress, ClassHash};
use core::pedersen::pedersen;
use core::traits::Into;

const STARKNET_DOMAIN_TYPE_HASH: felt252 = selector!("StarkNetDomain(chainId:felt)");
const SESSION_TYPE_HASH: felt252 =
    selector!("Session(validator:felt,key:felt,expires:felt,root:merkletree)");
const POLICY_TYPE_HASH: felt252 = selector!("Policy(contractAddress:felt,selector:selector)");

pub fn hash_authz(
    account_address: ContractAddress,
    account_class: ClassHash,
    authorized_key: felt252,
    expires: felt252,
    merkle_root: felt252,
    chain_id: felt252
) -> felt252 {
    let key = array_hash(array![authorized_key, expires, merkle_root]);
    let account_address_felt = account_address.try_into().unwrap();
    let account_class_felt = account_class.try_into().unwrap();
    array_hash(array!['StarkNet Message', account_address_felt, account_class_felt, key, chain_id])
}

fn array_hash(data: Array<felt252>) -> felt252 {
    let mut i = 0;
    let len = data.len();
    let mut v: felt252 = 0;
    while i < len {
        v = pedersen(v, *data.at(i));
        i += 1;
    };
    let felt252_len: felt252 = len.try_into().unwrap();
    v = pedersen(v, felt252_len);
    v
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use starknet::contract_address_const;
    use starknet::class_hash::class_hash_const;
    use starknet::{ContractAddress, ClassHash};
    use super::authz_hash;
    use core::pedersen::pedersen;

    #[test]
    fn test_short_message() {
        assert_eq!('StarkNet Message', 0x537461726b4e6574204d657373616765, "value should match");
    }

    #[test]
    fn test_authz_hash() {
        let account_address: ContractAddress = contract_address_const::<0x123>();
        let account_class: ClassHash = class_hash_const::<0x234>();
        let authorized_key: felt252 = 0x1;
        let expires: felt252 = 0x2;
        let merkle_root: felt252 = 0x3;
        let chain_id: felt252 = 0x4;
        let hash = authz_hash(
            account_address, account_class, authorized_key, expires, merkle_root, chain_id
        );
        assert_eq!(
            hash,
            0x4bf9baea6574851c9a8156450442e8db4de44284bba58ab79e634380e3fd294,
            "value should match"
        );
    }
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
use starknet::contract_address_const;
use starknet::class_hash::class_hash_const;
use starknet::{ContractAddress, ClassHash};
use smartr::utils::hash_auth_message;

#[test]
fn test_hash_auth_message() {
    let account_address: ContractAddress = contract_address_const::<0x123>();
    let validator_class: ClassHash = class_hash_const::<0x234>();
    let grantor_class: ClassHash = class_hash_const::<0x456>();
    let authn_key: felt252 = 0x1;
    let expires: felt252 = 0x2;
    let root: felt252 = 0x3;
    let chain_id: felt252 = 0x4;
    let hash = hash_auth_message(
        account_address, validator_class, grantor_class, authn_key, expires, root, chain_id
    );
    assert_eq!(
        hash,
        3607702933816136767961445235909759424846066858635070681944709519388181433692,
        "value should match"
    );
}

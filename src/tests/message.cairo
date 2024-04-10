
use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use starknet::contract_address_const;
    use starknet::class_hash::class_hash_const;
    use starknet::{ContractAddress, ClassHash};
    use smartr::message::hash_authz;
    use core::pedersen::pedersen;

    #[test]
    fn test_message_authz_hash() {
        let account_address: ContractAddress = contract_address_const::<0x123>();
        let account_class: ClassHash = class_hash_const::<0x234>();
        let authorized_key: felt252 = 0x1;
        let expires: felt252 = 0x2;
        let merkle_root: felt252 = 0x3;
        let chain_id: felt252 = 0x4;
        let hash = hash_authz(
            account_address, account_class, authorized_key, expires, merkle_root, chain_id
        );
        assert_eq!(
            hash,
            0x4bf9baea6574851c9a8156450442e8db4de44284bba58ab79e634380e3fd294,
            "value should match"
        );
    }
}

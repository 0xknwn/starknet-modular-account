// SPDX-License-Identifier: MIT

#[starknet::interface]
pub trait IGuardedKeys<TState> {
    fn cancel_ejection(ref self: TState);
    fn change_backup_gardian(ref self: TState, new_guardian: felt252);
    fn change_gardian(ref self: TState, new_guardian: felt252);
    fn change_owner(ref self: TState, new_owner: felt252);
    fn finalize_eject_guardian(ref self: TState);
    fn finalize_eject_owner(ref self: TState);
    fn get_ejection_status(self: @TState) -> EjectionStatus;
    fn get_ejection(self: @TState) -> Ejection;
    fn get_guardian_backup(self: @TState) -> felt252;
    fn get_guardian_ejection_attempts(self: @TState) -> u32;
    fn get_guardian(self: @TState) -> felt252;
    fn get_owner_ejection_attempts(self: @TState) -> u32;
    fn get_owner(self: @TState) -> felt252;
    fn request_guardian_ejection(ref self: TState, new_guardian: felt252);
    fn request_owner_ejection(ref self: TState, new_owner: felt252);
}

#[derive(Drop, Copy, Serde, PartialEq)]
pub enum EjectionStatus {
    None,
    NotReady,
    Ready,
    Expired,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct Ejection {
    ready_at: u64,
    ejection_type: felt252,
    signer: felt252,
}

// A guarded account should protect against the following attacks with a limited
// impact, assuming it is properly configured:
// - scenario 1: you loose your password
// - scenario 2: the guardian is compromised or goes rogue
// - scenario 3: your email is hijacked and the attacker can request the account
//   key to be changed
// - scenario 4: your password gets hijacked
// 
// > Notes: for the later scenarios, we can not guaranty there will not be any
// > loss but, at least, we can limit the amount at stake. Also, the guardian
// > is a very active third party because it will sign almost all the
// > transactions.
//
// > Additional notes: multi-scenarios attacks are not considered here. For
// > instance, if the guardian is compromised and you loose your password, then
// > the attacker will take over the account.
//
// In order to successfully implement that pattern, we need the following
// features to be implemented:
// - the owner can eject the guardian alone, i.e. without the guardian signing
//   the transaction. If that is the case, the guardian cannot try to eject the
//   owner without the help of the owner.
// - there must be a limit in the amount of attempts for the owner to attempt
//   to eject the guardian
// - the guardian alone can request the owner to be ejected but that could be
//   canceled by the owner
// - there should be a "pending" period to react
// - the guardian should be basically a yea-sayer for the owner except for some
//   specific rules. The max allowance per week should be the most important
//   one.
// - there might be an alt-guardians but this would also require a grace period
//   to be used. It should be carefully checked because it is a potential attack
//   vector.
// - the guardian should be able to monitor what is happening on the account and
//   especially the request for its ejections. It should notify the user by
//   email to make sure the request is legitimate.

#[starknet::contract]
mod GuardedValidator {
    use core::traits::Into;
    use openzeppelin::account::utils::is_valid_stark_signature;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component::InternalTrait as SRC5InternalTrait;
    use smartr::component::AccountComponent;
    use smartr::component::AccountComponent::InternalTrait as AccountInternalTrait;
    use smartr::component::ValidatorComponent;
    use smartr::component::{IValidator, ICoreValidator, IValidator_ID, IConfigure};
    use smartr::component::IVersion;
    use starknet::account::Call;
    use starknet::class_hash::ClassHash;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::get_tx_info;
    use super::IGuardedKeys;
    use super::{EjectionStatus, Ejection};

    component!(path: ValidatorComponent, storage: validator, event: ValidatorEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccountComponent, storage: account, event: AccountEvent);

    #[constructor]
    fn constructor(ref self: ContractState) {
        assert(false, 'deployment not allowed')
    }

    #[abi(embed_v0)]
    pub impl ValidatorImpl of IValidator<ContractState> {
        fn validate(self: @ContractState, grantor_class: ClassHash, calls: Array<Call>) -> felt252 {
            let tx_info = get_tx_info().unbox();
            let tx_hash = array![tx_info.transaction_hash];
            let signature = tx_info.signature;
            let signature_len = signature.len();
            let mut i: usize = 0;
            let mut sig: Array<felt252> = ArrayTrait::<felt252>::new();
            while i < signature_len {
                sig.append(*signature.at(i));
                i += 1;
            };
            self.is_valid_signature(tx_hash, sig)
        }
    }

    #[abi(embed_v0)]
    pub impl GuardedKeysImpl of IGuardedKeys<ContractState> {
        fn cancel_ejection(ref self: ContractState) {}
        fn change_backup_gardian(ref self: ContractState, new_guardian: felt252) {}
        fn change_gardian(ref self: ContractState, new_guardian: felt252) {}
        fn change_owner(ref self: ContractState, new_owner: felt252) {}
        fn finalize_eject_guardian(ref self: ContractState) {}
        fn finalize_eject_owner(ref self: ContractState) {}
        fn get_ejection_status(self: @ContractState) -> EjectionStatus {
          EjectionStatus::None
        }
        fn get_ejection(self: @ContractState) -> Ejection {
          Ejection {
            ready_at: 0,
            ejection_type: 0,
            signer: 0,
          }
        }
        fn get_guardian_backup(self: @ContractState) -> felt252 {
            0
        }
        fn get_guardian_ejection_attempts(self: @ContractState) -> u32 {
            0_u32
        }
        fn get_guardian(self: @ContractState) -> felt252 {
            0
        }
        fn get_owner_ejection_attempts(self: @ContractState) -> u32 {
            0_u32
        }
        fn get_owner(self: @ContractState) -> felt252 {
            0
        }
        fn request_guardian_ejection(ref self: ContractState, new_guardian: felt252) {}
        fn request_owner_ejection(ref self: ContractState, new_owner: felt252) {}
    }

    #[abi(embed_v0)]
    impl VersionImpl of IVersion<ContractState> {
        fn get_name(self: @ContractState) -> felt252 {
            'guarded-validator'
        }
        fn get_version(self: @ContractState) -> felt252 {
            'v0.1.10-alpha'
        }
    }

    #[abi(embed_v0)]
    pub impl CoreValidator of ICoreValidator<ContractState> {
        /// Verifies that the given signature is valid for the given hash.
        fn is_valid_signature(
            self: @ContractState, hash: Array<felt252>, signature: Array<felt252>
        ) -> felt252 {
            if hash.len() != 1 {
                return 0;
            }
            let hash_value = *hash.at(0);
            if self._is_valid_signature(hash_value, signature.span()) {
                starknet::VALIDATED
            } else {
                0
            }
        }

        fn initialize(ref self: ContractState, public_key: Array<felt252>) {
            assert(public_key.len() == 1, 'Invalid public key');
            let public_key_felt = *public_key.at(0);
            self.Account_public_key.write(public_key_felt);
            self.account.Account_forward_validate_module.write(true);
        }
    }

    mod Errors {
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        Account_public_key: felt252,
        #[substorage(v0)]
        validator: ValidatorComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        account: AccountComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ValidatorEvent: ValidatorComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AccountEvent: AccountComponent::Event,
    }


    #[abi(embed_v0)]
    pub impl ConfigureImpl of IConfigure<ContractState> {
        fn call(self: @ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if call.selector == selector!("get_version") {
                found = true;
                let out = self.get_version();
                output.append(out);
            }
            if call.selector == selector!("get_name") {
                found = true;
                let out = self.get_name();
                output.append(out);
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }

        fn execute(ref self: ContractState, call: Call) -> Array<felt252> {
            let mut output = ArrayTrait::<felt252>::new();
            let mut found = false;
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }

    #[generate_trait]
    impl Internal of InternalTrait {
        /// Validates that the caller is the account itself. Otherwise it reverts.
        fn assert_only_self(self: @ContractState) {
            let caller = get_caller_address();
            let self = get_contract_address();
            assert(self == caller, Errors::UNAUTHORIZED);
        }

        /// Returns whether the given signature is valid for the given hash
        /// using the account's current public key.
        fn _is_valid_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let public_key: felt252 = self.Account_public_key.read();
            is_valid_stark_signature(hash, public_key, signature)
        }
    }
}

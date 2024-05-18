// SPDX-License-Identifier: MIT

#[starknet::interface]
pub trait IGuardedKeys<TState> {
    fn cancel_ejection(ref self: TState);
    fn change_backup_gardian(ref self: TState, new_guardian: felt252);
    fn change_gardian(ref self: TState, new_guardian: felt252);
    fn change_owner(ref self: TState, new_owner: felt252);
    fn finalize_guardian_ejection(ref self: TState);
    fn finalize_owner_ejection(ref self: TState);
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

#[derive(Drop, Copy, Serde, PartialEq, starknet::Store)]
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
    use starknet::ContractAddress;
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
            self.assert_no_module_multicall(calls.span());
            let tx_info = get_tx_info().unbox();
            let tx_hash = tx_info.transaction_hash;
            let signature = tx_info.signature;

            if calls.len() == 1 {
                if *calls.at(0).to == get_contract_address() && *calls.at(0).selector == selector!("execute_on_module") {
                    let calldata = *calls.at(0).calldata;
                    assert(calldata.len() >= 3, 'Validator: invalid call');
                    let module_account_address_felt = *calldata.at(1);
                    let module_account_address: ContractAddress = module_account_address_felt.try_into().unwrap();
                    assert(module_account_address == get_contract_address(), 'Validator: invalid account');
                    let module_selector = *calldata.at(2);
                    if module_selector == selector!("request_owner_ejection") {
                        let is_valid = self._is_valid_guardian_signature(tx_hash, signature);
                        assert(is_valid, Errors::INVALID_GUARDIAN_SIGNATURE);
                        return starknet::VALIDATED;
                    }
                    if module_selector == selector!("finalize_owner_ejection") {
                        let is_valid = self._is_valid_guardian_signature(tx_hash, signature);
                        assert(is_valid, Errors::INVALID_GUARDIAN_SIGNATURE);
                        return starknet::VALIDATED;
                    }
                    if module_selector == selector!("request_guardian_ejection") {
                        let is_valid = self._is_valid_owner_signature(tx_hash, signature);
                        assert(is_valid, Errors::INVALID_OWNER_SIGNATURE);
                        return starknet::VALIDATED;
                    }
                    if module_selector == selector!("finalize_guardian_ejection") {
                        let is_valid = self._is_valid_owner_signature(tx_hash, signature);
                        assert(is_valid, Errors::INVALID_OWNER_SIGNATURE);
                        return starknet::VALIDATED;
                    }
                } 
            } 
            let is_valid = self._is_valid_signature(tx_hash, signature);
            assert(is_valid, Errors::INVALID_SIGNATURE);
            return starknet::VALIDATED;
        }
    }

    #[abi(embed_v0)]
    pub impl GuardedKeysImpl of IGuardedKeys<ContractState> {
        fn cancel_ejection(ref self: ContractState) {}
        fn change_backup_gardian(ref self: ContractState, new_guardian: felt252) {}
        fn change_gardian(ref self: ContractState, new_guardian: felt252) {}
        fn change_owner(ref self: ContractState, new_owner: felt252) {}
        fn finalize_guardian_ejection(ref self: ContractState) {}
        fn finalize_owner_ejection(ref self: ContractState) {}
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
        fn request_guardian_ejection(ref self: ContractState, new_guardian: felt252) {
          // do it, even if there is a pending owner ejection and cancel the
          // pending owner ejection
        }
        fn request_owner_ejection(ref self: ContractState, new_owner: felt252) {
          // if there is a pending guardian ejection, do nothing
        }
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

        fn initialize(ref self: ContractState, args: Array<felt252>) {
            let key_number = args.len();
            assert(key_number >= 1 && key_number <= 3 , Errors::INVALID_SIGNERS);
            let public_key = *args.at(0);
            self.Account_public_key.write(public_key);
            self.account.Account_forward_validate_module.write(true);
            if key_number >= 2 {
                let guardian_key = *args.at(1);
                self.Account_guardian_key.write(guardian_key);
            }
            if key_number == 3 {
                let backup_guardian_key = *args.at(2);
                self.Account_backup_guardian_key.write(backup_guardian_key);
            }
        }
    }

    mod Errors {
        pub const INVALID_SIGNERS: felt252 = 'Account: invalid signers';
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const INVALID_OWNER_SIGNATURE: felt252 = 'Account: invalid owner sig.';
        pub const INVALID_GUARDIAN: felt252 = 'Account: invalid guardian';
        pub const INVALID_GUARDIAN_SIGNATURE: felt252 = 'Account: invalid guardian sig.';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        Account_public_key: felt252,
        Account_guardian_key: felt252,
        Account_backup_guardian_key: felt252,
        Account_ejection_current: Ejection,
        Account_ejection_status: EjectionStatus,
        Account_ejection_attempts: u64,
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

        /// Validates that there is no internal module call in an array of calls.
        fn assert_no_module_multicall(self: @ContractState, calls: Span<Call>) {
            let call_num = calls.len();
            if call_num <= 1 {
                return;
            }
            let account_address = get_contract_address();
            let mut i: usize = 0;
            while i < call_num {
                assert(account_address != *calls.at(i).to && *calls.at(i).selector != selector!("execute_on_module"), Errors::UNAUTHORIZED);
                i += 1;
            }
        }

        /// Returns whether the given signature is valid for the given hash
        /// using the account's current public key.
        fn _is_valid_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let signature_len = signature.len();
            assert(signature_len >= 2 , Errors::INVALID_SIGNATURE);
            let public_key: felt252 = self.Account_public_key.read();
            let mut signature_owner: Array<felt252> = ArrayTrait::<felt252>::new();
            signature_owner.append(*signature.at(0));
            signature_owner.append(*signature.at(1));
            assert(is_valid_stark_signature(hash, public_key, signature_owner.span()), Errors::INVALID_OWNER_SIGNATURE);
            let guardian_key = self.Account_guardian_key.read();
            let backup_guardian_key = self.Account_backup_guardian_key.read();
            if guardian_key == 0 && backup_guardian_key == 0 {
                return true;
            }
            assert(signature_len == 4 , Errors::INVALID_GUARDIAN_SIGNATURE);
            let mut signature_guardian: Array<felt252> = ArrayTrait::<felt252>::new();
            signature_guardian.append(*signature.at(2));
            signature_guardian.append(*signature.at(3));
            let signature = signature_guardian.span();
            let mut is_valid_guardian_key = is_valid_stark_signature(hash, guardian_key, signature);
            if !is_valid_guardian_key && backup_guardian_key != 0 {
              is_valid_guardian_key = is_valid_stark_signature(hash, backup_guardian_key, signature);
            }
            assert(is_valid_guardian_key, Errors::INVALID_GUARDIAN_SIGNATURE);
            true
        }

        fn _is_valid_owner_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let signature_len = signature.len();
            assert(signature_len == 2 , Errors::INVALID_OWNER_SIGNATURE);
            let public_key: felt252 = self.Account_public_key.read();
            let mut signature_owner: Array<felt252> = ArrayTrait::<felt252>::new();
            signature_owner.append(*signature.at(0));
            signature_owner.append(*signature.at(1));
            assert(is_valid_stark_signature(hash, public_key, signature_owner.span()), Errors::INVALID_OWNER_SIGNATURE);
            true
        }

        fn _is_valid_guardian_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let signature_len = signature.len();
            assert(signature_len == 2 , Errors::INVALID_GUARDIAN_SIGNATURE);
            let guardian_key = self.Account_guardian_key.read();
            assert(guardian_key != 0, Errors::INVALID_GUARDIAN_SIGNATURE);
            let backup_guardian_key = self.Account_backup_guardian_key.read();
            if guardian_key == 0 && backup_guardian_key == 0 {
                return false;
            }
            assert(signature_len == 2 , Errors::INVALID_GUARDIAN_SIGNATURE);
            let mut signature_guardian: Array<felt252> = ArrayTrait::<felt252>::new();
            signature_guardian.append(*signature.at(0));
            signature_guardian.append(*signature.at(1));
            let signature = signature_guardian.span();
            let mut is_valid_guardian_key = is_valid_stark_signature(hash, guardian_key, signature);
            if !is_valid_guardian_key && backup_guardian_key != 0 {
              is_valid_guardian_key = is_valid_stark_signature(hash, backup_guardian_key, signature);
            }
            assert(is_valid_guardian_key, Errors::INVALID_GUARDIAN_SIGNATURE);
            true
        }
    }
}

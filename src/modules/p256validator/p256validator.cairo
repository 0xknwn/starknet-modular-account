// SPDX-License-Identifier: MIT

use openzeppelin::account::utils::secp256r1::Secp256r1PointSerde;
use openzeppelin::account::interface::P256PublicKey;

#[starknet::interface]
pub trait IPublicKey<TState> {
    fn set_public_key(ref self: TState, new_public_key: P256PublicKey);
    fn get_public_key(self: @TState) -> P256PublicKey;
}

#[starknet::contract]
mod P256Validator {
    use core::traits::Into;
    use openzeppelin::account::utils::is_valid_p256_signature;
    use openzeppelin::account::utils::secp256r1::{Secp256r1PointStorePacking, Secp256r1PointSerde};
    use openzeppelin::account::interface::P256PublicKey;
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
    use super::IPublicKey;

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
    impl VersionImpl of IVersion<ContractState> {
        fn get_name(self: @ContractState) -> felt252 {
            'p256-validator'
        }
        fn get_version(self: @ContractState) -> felt252 {
            'v0.1.10'
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
            let mut value = public_key.span();
            let p256_public_key = Serde::<P256PublicKey>::deserialize(ref value);
            match p256_public_key {
                Option::Some(key) => {
                    self.P256Account_public_key.write(key);
                    self.account.notify_owner_addition(public_key);
                },
                Option::None => { assert(false, 'Invalid public key'); },
            }
        }
    }

    mod Errors {
        pub const INVALID_SIGNATURE: felt252 = 'Account: invalid signature';
        pub const UNAUTHORIZED: felt252 = 'Account: unauthorized';
    }

    #[storage]
    struct Storage {
        P256Account_public_key: P256PublicKey,
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
            if call.selector == selector!("get_public_key") {
                found = true;
                let keys = self.get_public_key();
                keys.serialize(ref output);
            }
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
            if call.selector == selector!("set_public_key") {
                found = true;
                if call.calldata.len() != 4 {
                    assert(false, 'Invalid payload');
                }
                // let me: Array<felt252> = call.calldata;
                let mut value = call.calldata;
                assert(value.len() == 4, 'Ough, try again!');
                let p256_public_key = Serde::<P256PublicKey>::deserialize(ref value);
                match p256_public_key {
                    Option::Some(key) => { self.set_public_key(key); },
                    Option::None => { assert(false, 'Invalid public key'); },
                }
            }
            if !found {
                assert(false, 'Invalid selector');
            }
            output
        }
    }


    #[abi(embed_v0)]
    pub impl PublicKey of IPublicKey<ContractState> {
        /// Add a key to the current public keys of the account.
        fn set_public_key(ref self: ContractState, new_public_key: P256PublicKey) {
            self.P256Account_public_key.write(new_public_key);
            let mut public_key_felt = ArrayTrait::<felt252>::new();
            new_public_key.serialize(ref public_key_felt);
            self.account.notify_owner_addition(public_key_felt);
        }

        /// Returns the current public keys of the account.
        fn get_public_key(self: @ContractState) -> P256PublicKey {
            self.P256Account_public_key.read()
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

        /// Returns wher the given signature is valid for the given hash
        /// using the account's current public key.
        fn _is_valid_signature(
            self: @ContractState, hash: felt252, signature: Span<felt252>
        ) -> bool {
            let public_key: P256PublicKey = self.P256Account_public_key.read();
            is_valid_p256_signature(hash, public_key, signature)
        }
    }
}

#[cfg(test)]
mod tests {
    use openzeppelin::account::utils::secp256r1::Secp256r1PointStorePacking;
    use openzeppelin::account::interface::P256PublicKey;
    use openzeppelin::account::utils::secp256r1::Secp256r1PointSerde;
    use openzeppelin::account::utils::secp256r1::DebugSecp256r1Point;

    #[test]
    fn value_match_key() {
        let value: Array<felt252> = array![
            84367212547305142575912199700718371262,
            258400589869575108989031672267243838881,
            116613713336784839275036561532313383696,
            333360036780834669843466872615052783706
        ];
        let mut value = value.span();
        let p256_public_key = Serde::<P256PublicKey>::deserialize(ref value);
        match p256_public_key {
            Option::Some(_key) => {
                assert(true, 'valid public key'); // println!("{:?}", _key);
            },
            Option::None => { assert(false, 'option is none'); },
        }
    }

    #[test]
    fn play_with_u256() {
        let _privateKey: u256 =
            0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e_u256;
        let x: u256 = 0x097420e05fbc83afe4d73b31890187d0cacf2c3653e27f434701a91625f916c2_u256;
        let y: u256 = 0x98a304ff544db99c864308a9b3432324adc6c792181bae33fe7a4cbd48cf263a_u256;
        assert_eq!(x.low, 269579757328574126121444003492591638210, "x.low");
        assert_eq!(x.high, 12566025211498978771503502663570524112, "x.high");
        assert_eq!(y.low, 230988565823064299531546210785320445498, "y.low");
        assert_eq!(y.high, 202889101106158949967186230758848275236, "y.high");
    }

    #[test]
    fn value_match_key_from_u256() {
        let value: Array<felt252> = array![
            269579757328574126121444003492591638210,
            12566025211498978771503502663570524112,
            230988565823064299531546210785320445498,
            202889101106158949967186230758848275236
        ];
        let mut value = value.span();
        let p256_public_key = Serde::<P256PublicKey>::deserialize(ref value);
        // println!("{:?}", p256_public_key);
        match p256_public_key {
            Option::Some(_key) => { assert(true, 'valid public key'); },
            Option::None => { assert(false, 'option is none'); },
        }
    }
}

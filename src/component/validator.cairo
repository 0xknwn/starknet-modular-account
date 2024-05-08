// SPDX-License-Identifier: MIT

use starknet::class_hash::ClassHash;
use starknet::account::Call;

// use `src5_rs` to generate the interface id
pub const IValidator_ID: felt252 =
    0x12872aa2454ea533052814f27445df0e498eeccaf2035b018153efff642d34d;

#[starknet::interface]
pub trait ICoreValidator<TState> {
    fn is_valid_signature(
        self: @TState, hash: Array<felt252>, signature: Array<felt252>
    ) -> felt252;
    fn initialize(ref self: TState, public_key: Array<felt252>);
}

#[starknet::interface]
pub trait IValidator<TState> {
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}

#[starknet::interface]
pub trait IConfigure<TState> {
    fn call(self: @TState, call: Call) -> Array<felt252>;
    fn execute(ref self: TState, call: Call) -> Array<felt252>;
}

#[starknet::component]
pub mod ValidatorComponent {
    use openzeppelin::introspection::src5::SRC5Component::SRC5;
    use openzeppelin::introspection::src5::SRC5Component;
    use smartr::component::AccountComponent;
    use super::{IValidator, IConfigure};
    use starknet::class_hash::ClassHash;
    use starknet::account::Call;

    #[storage]
    struct Storage {}

    #[event]
    #[derive(Drop, PartialEq, starknet::Event)]
    pub enum Event {}

    #[embeddable_as(ValidatorImpl)]
    pub impl Validator<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IValidator<ComponentState<TContractState>> {
        fn validate(
            self: @ComponentState<TContractState>, grantor_class: ClassHash, calls: Array<Call>
        ) -> felt252 {
            0
        }
    }

    #[embeddable_as(ConfigureImpl)]
    pub impl Configure<
        TContractState,
        +HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +AccountComponent::HasComponent<TContractState>,
        +Drop<TContractState>
    > of IConfigure<ComponentState<TContractState>> {
        fn call(self: @ComponentState<TContractState>, call: Call) -> Array<felt252> {
            array![]
        }
        fn execute(ref self: ComponentState<TContractState>, call: Call) -> Array<felt252> {
            array![]
        }
    }
}

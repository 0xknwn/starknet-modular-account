// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts for Cairo v0.10.0 (account/interface.cairo)

use openzeppelin::account::utils::secp256k1::Secp256k1PointSerde;
use starknet::ContractAddress;
use starknet::account::Call;
use starknet::ClassHash;

pub const ISRC6_ID: felt252 = 0x2ceccef7f994940b3962a6c67e0ba4fcd37df7d131417c604f91e03caecc1cd;

//
// Account
//

#[starknet::interface]
pub trait ISRC6<TState> {
    fn __execute__(self: @TState, calls: Array<Call>) -> Array<Span<felt252>>;
    fn __validate__(self: @TState, calls: Array<Call>) -> felt252;
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
}

#[starknet::interface]
pub trait IDeclarer<TState> {
    fn __validate_declare__(self: @TState, class_hash: felt252) -> felt252;
}

#[starknet::interface]
pub trait IDeployable<TState> {
    fn __validate_deploy__(
        self: @TState, class_hash: felt252, contract_address_salt: felt252, public_key: felt252
    ) -> felt252;
}

#[starknet::interface]
pub trait IPublicKeys<TState> {
    fn add_public_key(ref self: TState, new_public_key: felt252);
    fn get_public_keys(self: @TState) -> Array<felt252>;
    fn get_threshold(self: @TState) -> u8;
    fn remove_public_key(ref self: TState, old_public_key: felt252);
    fn set_threshold(ref self: TState, new_threshold: u8);
}

#[starknet::interface]
pub trait ISRC6CamelOnly<TState> {
    fn isValidSignature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
}

#[starknet::interface]
pub trait IPlugin<TState> {
    fn add_plugin(ref self: TState, class_hash: ClassHash, args: Array<felt252>);
    fn remove_plugin(ref self: TState, class_hash: ClassHash);
    fn get_initialization(self: @TState, key: felt252) -> felt252;
    fn is_plugin(self: @TState, class_hash: ClassHash) -> bool;
    fn read_on_plugin(self: @TState, class_hash: ClassHash, calls: Array<Call>);
    fn execute_on_plugin(ref self: TState, class_hash: ClassHash, calls: Array<Call>);
}
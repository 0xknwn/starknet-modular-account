use starknet::account::Call;

#[starknet::interface]
pub trait IModuleClass<TState> {
    fn initialize(ref self: TState, args: Array<felt252>);
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> bool;
    fn validate(self: @TState, calls: Array<Call>) -> felt252;
}

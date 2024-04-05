use starknet::account::Call;

#[starknet::interface]
pub trait IPluginClass<TState> {
    fn initialize(ref self: TState, calls: Array<Call>);
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> bool;
    fn validate(self: @TState, calls: Array<Call>);
}

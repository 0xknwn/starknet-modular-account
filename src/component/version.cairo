
#[starknet::interface]
pub trait IVersion<TState> {
    fn get_version(self: @TState) -> felt252;
    fn get_name(self: @TState) -> felt252;
}

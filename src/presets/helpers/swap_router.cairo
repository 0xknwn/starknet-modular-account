use starknet::ContractAddress;

#[starknet::interface]
trait ISwapRouter<TContractState> {
    fn faucet(ref self: TContractState, amount: u256) -> bool;
    fn get_conversion_rate(self: @TContractState) -> u256;
    fn get_token_a(self: @TContractState) -> ContractAddress;
    fn get_token_b(self: @TContractState) -> ContractAddress;
    fn set_conversion_rate(ref self: TContractState, rate: u256);
    fn set_tokens(
        ref self: TContractState, tokenAAddress: ContractAddress, tokenBAddress: ContractAddress
    );
    fn swap_maximum_at(ref self: TContractState, rate: u256, amount: u256);
    fn swap_minimum_at(ref self: TContractState, rate: u256, amount: u256);
    fn swap(ref self: TContractState, amount: u256);
}

#[starknet::contract]
mod SwapRouter {
    use core::traits::Into;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::token::erc20::interface::{IERC20DispatcherTrait, IERC20Dispatcher};
    use openzeppelin::upgrades::interface::IUpgradeable;
    use openzeppelin::upgrades::UpgradeableComponent;
    use starknet::{ClassHash, ContractAddress};
    use starknet::{get_contract_address, get_caller_address};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;

    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        tokenAAddress: ContractAddress,
        tokenBAddress: ContractAddress,
        tokenConversionRate: u256,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        PausableEvent: PausableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.pausable._pause();
    }

    #[abi(embed_v0)]
    impl SwapRouterImpl of super::ISwapRouter<ContractState> {
        fn swap_minimum_at(ref self: ContractState, rate: u256, amount: u256) {
            self.pausable.assert_not_paused();
            assert(rate < self.tokenConversionRate.read(), 'Current rate too low');
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            let swaprouter = get_contract_address();
            IERC20Dispatcher { contract_address: tokenA }.transfer_from(caller, swaprouter, amount);
            let amountB: u256 = amount * self.tokenConversionRate.read() / 1000000000000000000;
            let tokenB: ContractAddress = self.tokenBAddress.read();
            IERC20Dispatcher { contract_address: tokenB }.transfer(caller, amountB);
        }

        fn swap_maximum_at(ref self: ContractState, rate: u256, amount: u256) {
            self.pausable.assert_not_paused();
            assert(rate > self.tokenConversionRate.read(), 'Current rate too high');
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            let swaprouter = get_contract_address();
            IERC20Dispatcher { contract_address: tokenA }.transfer_from(caller, swaprouter, amount);
            let amountB: u256 = amount * self.tokenConversionRate.read() / 1000000000000000000;
            let tokenB: ContractAddress = self.tokenBAddress.read();
            IERC20Dispatcher { contract_address: tokenB }.transfer(caller, amountB);
        }

        fn set_conversion_rate(ref self: ContractState, rate: u256) {
            self.pausable.assert_not_paused();
            self.ownable.assert_only_owner();
            self.tokenConversionRate.write(rate);
        }

        fn get_conversion_rate(self: @ContractState) -> u256 {
            self.tokenConversionRate.read()
        }

        fn get_token_a(self: @ContractState) -> ContractAddress {
            self.tokenAAddress.read()
        }

        fn get_token_b(self: @ContractState) -> ContractAddress {
            self.tokenBAddress.read()
        }

        fn swap(ref self: ContractState, amount: u256) {
            self.pausable.assert_not_paused();
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            let swaprouter = get_contract_address();
            IERC20Dispatcher { contract_address: tokenA }.transfer_from(caller, swaprouter, amount);
            let amountB: u256 = amount * self.tokenConversionRate.read() / 1000000000000000000;
            let tokenB: ContractAddress = self.tokenBAddress.read();
            IERC20Dispatcher { contract_address: tokenB }.transfer(caller, amountB);
        }

        fn faucet(ref self: ContractState, amount: u256) -> bool {
            self.pausable.assert_not_paused();
            assert(amount <= (2 * 1000000000000000000), 'Amount too high');
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            IERC20Dispatcher { contract_address: tokenA }.transfer(caller, amount)
        }

        // Set the tokens to be swapped
        fn set_tokens(
            ref self: ContractState, tokenAAddress: ContractAddress, tokenBAddress: ContractAddress
        ) {
            self.ownable.assert_only_owner();
            let tokenA: felt252 = tokenAAddress.into();
            assert(tokenA != 0, 'Token A address not set');
            let tokenB: felt252 = tokenBAddress.into();
            assert(tokenB != 0, 'Token B address not set');
            self.tokenAAddress.write(tokenAAddress);
            self.tokenBAddress.write(tokenBAddress);
            self.tokenConversionRate.write(1000000000000000000);
            self.pausable._unpause();
        }
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable._upgrade(new_class_hash);
        }
    }
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use super::{SwapRouter, ISwapRouterDispatcher, ISwapRouterDispatcherTrait};
    use snforge_std::{declare, ContractClassTrait};
    use starknet::{SyscallResultTrait, ContractAddress, get_caller_address};
    use snforge_std::{start_prank, stop_prank, CheatTarget};
    use starknet::contract_address_const;

    #[test]
    #[should_panic(expected: ('Pausable: paused',))]
    fn test_faucet() {
        let contract = declare("SwapRouter").unwrap();
        let (contract_address, _) = contract.deploy(@array!['owner']).unwrap();
        let dispatcher = ISwapRouterDispatcher { contract_address };
        let status = dispatcher.faucet(100000);
        assert_eq!(status, true, "status should be true");
    }

    #[test]
    fn test_set_tokens() {
        let owner = contract_address_const::<'owner'>();
        let contract = declare("SwapRouter").unwrap();
        let (contract_address, _) = contract.deploy(@array!['owner']).unwrap();
        let token_a = contract_address_const::<'token_a'>();
        let token_b = contract_address_const::<'token_b'>();
        let dispatcher = ISwapRouterDispatcher { contract_address };
        start_prank(CheatTarget::One(contract_address), owner);
        dispatcher.set_tokens(token_a, token_b);
        stop_prank(CheatTarget::One(contract_address));
        let addr_a = dispatcher.get_token_a();
        assert_eq!(addr_a, token_a, "token should be 'token_a'");
        let addr_b = dispatcher.get_token_b();
        assert_eq!(addr_b, token_b, "token should be 'token_b'");
    }
}

use starknet::ContractAddress;

#[starknet::interface]
trait ISwapRouter<TContractState> {
    fn swap(ref self: TContractState, amount: u256);
    fn faucet(ref self: TContractState, amount: u256);
    fn set_tokens(
        ref self: TContractState, tokenAAddress: ContractAddress, tokenBAddress: ContractAddress
    );
}

#[starknet::contract]
mod SwapRouter {
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::upgrades::UpgradeableComponent;
    use openzeppelin::upgrades::interface::IUpgradeable;
    use openzeppelin::token::erc20::interface::{IERC20DispatcherTrait, IERC20Dispatcher};
    use core::traits::Into;

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

        fn faucet(ref self: ContractState, amount: u256) {
            self.pausable.assert_not_paused();
            assert(amount <= (2 * 1000000000000000000), 'Amount too high');
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            IERC20Dispatcher { contract_address: tokenA }.transfer(caller, amount);
        }

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
mod tests {}

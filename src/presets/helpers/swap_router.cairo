use starknet::ContractAddress;

#[starknet::interface]
trait ISwapRouter<TContractState

> {
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
            // let amountB: u256 = amount * self.tokenConversionRate.read() / 1000000000000000000;
            let tokenB: ContractAddress = self.tokenBAddress.read();
            IERC20Dispatcher { contract_address: tokenB }.transfer(caller, amount);
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
            let tokenA = self.tokenAAddress.read();
            let tokenB = self.tokenBAddress.read();
            let caller = get_caller_address();
            let swaprouter = get_contract_address();
            let dispatchera = IERC20Dispatcher { contract_address: tokenA };
            let dispatcherb = IERC20Dispatcher { contract_address: tokenB };
            let allowed = dispatchera.allowance(caller, swaprouter);
            assert(allowed >= amount, 'Amount exceeds allowance');
            // @todo: check why the estimateFee fails on this line
            // Contract error: {"revert_error":"Error in the called contract (0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691):\nError at pc=0:4835:\nGot an exception while executing a hint.\nCairo traceback (most recent call last):\nUnknown location (pc=0:67)\nUnknown location (pc=0:1835)\nUnknown location (pc=0:2554)\nUnknown location (pc=0:3436)\nUnknown location (pc=0:4054)\nUnknown location (pc=0:4040)\n\nError in the called contract (0x05e59eeb9b47cde522762e280b064a0e8761cd965b99e859017f8243e4e05eda):\nError at pc=0:5904:\nGot an exception while executing a hint: Execution failed. Failure reason: 0x753235365f737562204f766572666c6f77 ('u256_sub Overflow').\nCairo traceback (most recent call last):\nUnknown location (pc=0:1516)\nUnknown location (pc=0:4827)\n\nError in the called contract (0x06c1310199a2c2739d580d98716f7e8261b2580c583b78b8db7fa54040e39e15):\nExecution failed. Failure reason: 0x753235365f737562204f766572666c6f77 ('u256_sub Overflow').\n"}
            dispatchera.transfer_from(caller, swaprouter, amount);
            // @todo: reenable the conversion rate
            // let amountB: u256 = amount * self.tokenConversionRate.read() / 1000000000000000000;
            let transfer = dispatcherb.transfer(caller, amount);
            assert(transfer, 'Transfer failed');
        }

        fn faucet(ref self: ContractState, amount: u256) -> bool {
            self.pausable.assert_not_paused();
            assert(amount <= (2 * 1000000000000000000), 'Amount too high');
            let tokenA: ContractAddress = self.tokenAAddress.read();
            let caller = get_caller_address();
            let tokena = IERC20Dispatcher { contract_address: tokenA };
            tokena.transfer(caller, amount)
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

// use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use super::{SwapRouter, ISwapRouterDispatcher, ISwapRouterDispatcherTrait};
    use snforge_std::{declare, ContractClassTrait};
    use snforge_std::{start_prank, stop_prank, CheatTarget};
    use starknet::contract_address_const;
    use core::traits::Into;
    use openzeppelin::token::erc20::interface::{IERC20DispatcherTrait, IERC20Dispatcher};

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

    #[test]
    fn test_simple_swap() {
        let owner = contract_address_const::<'owner'>();
        let swaprouter_class = declare("SwapRouter").unwrap();
        let (swaprouter_address, _) = swaprouter_class.deploy(@array!['owner']).unwrap();
        let swaprouter_address_felt: felt252 = swaprouter_address.try_into().unwrap();
        let token_a_class = declare("TokenA").unwrap();
        let (token_a_address, _) = token_a_class.deploy(@array![swaprouter_address_felt, 'owner']).unwrap();
        let token_b_class = declare("TokenB").unwrap();
        let (token_b_address, _) = token_b_class.deploy(@array![swaprouter_address_felt, 'owner']).unwrap();
        let swaprouter = ISwapRouterDispatcher { contract_address: swaprouter_address };
        let token_a = IERC20Dispatcher { contract_address: token_a_address };
        let token_b = IERC20Dispatcher { contract_address: token_b_address };

        start_prank(CheatTarget::One(swaprouter_address), owner);
        swaprouter.set_tokens(token_a_address, token_b_address);
        let status = swaprouter.faucet(2000000000000000000);
        assert_eq!(status, true, "status should be true");
        stop_prank(CheatTarget::One(swaprouter_address));

        let balance = token_a.balance_of(owner);
        assert_eq!(balance, 2000000000000000000, "balance should be 2000000000000000000");
        let mut router_balance_token_a = token_a.balance_of(swaprouter_address);
        assert_eq!(router_balance_token_a, 999998000000000000000000, "balance should be 999998000000000000000000");
        let mut router_balance_token_b = token_b.balance_of(swaprouter_address);
        assert_eq!(router_balance_token_b, 1000000000000000000000000, "balance should be 1000000000000000000000000");

        start_prank(CheatTarget::One(token_a_address), owner);
        token_a.approve(swaprouter_address, 1000000000000000000);
        stop_prank(CheatTarget::One(token_a_address));

        let allowed = token_a.allowance(owner, swaprouter_address);
        assert_eq!(allowed, 1000000000000000000, "balance should be 1000000000000000000");

        start_prank(CheatTarget::One(swaprouter_address), owner);
        swaprouter.swap(1000000000000000000_u256);
        stop_prank(CheatTarget::One(swaprouter_address));

        let new_balance_a = token_a.balance_of(owner);
        assert_eq!(new_balance_a, 1000000000000000000, "balance should be 1000000000000000000");

        let new_balance_b = token_b.balance_of(owner);
        assert_eq!(new_balance_b, 1000000000000000000, "balance should be 1000000000000000000");

        // let addr_a = dispatcher.get_token_a();
        // assert_eq!(addr_a, token_a, "token should be 'token_a'");
        // let addr_b = dispatcher.get_token_b();
        // assert_eq!(addr_b, token_b, "token should be 'token_b'");
    }
}

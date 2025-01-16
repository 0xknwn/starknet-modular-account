import { cairo } from "starknet";

export const default_timeout = 120000;
export const initial_EthTransfer = cairo.uint256(3n * 10n ** 15n);
export const initial_StrkTransfer = cairo.uint256(10000n * 10n ** 15n);
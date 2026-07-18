// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/WinRollGame.sol";

/**
 * Deploys WinRollGame.
 *
 * Env vars:
 * - DEPLOYER_PRIVATE_KEY
 * - STAKE_TOKEN_ADDRESS  (USDT on Celo)
 * - MIN_BET / MAX_BET    (token base units, defaults 1 / 1000 USDT)
 * - OWNER_ADDRESS        (defaults to the deployer)
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address token = vm.envAddress("STAKE_TOKEN_ADDRESS");
        uint256 minBet = vm.envOr("MIN_BET", uint256(1e6));
        uint256 maxBet = vm.envOr("MAX_BET", uint256(1000e6));
        address owner = vm.envOr("OWNER_ADDRESS", vm.addr(deployerKey));

        vm.startBroadcast(deployerKey);
        WinRollGame game = new WinRollGame(token, minBet, maxBet, owner);
        vm.stopBroadcast();

        console.log("WinRollGame deployed at:", address(game));
    }
}

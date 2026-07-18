// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../src/WinRollGame.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1_000_000e6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}

contract WinRollGameTest is Test {
    WinRollGame internal game;
    MockUSDT internal token;

    address internal owner = address(0xA11CE);
    address internal player = address(0xB0B);

    string internal constant ROUND_ID = "20260718-1400";

    function setUp() public {
        token = new MockUSDT();
        game = new WinRollGame(address(token), 1e6, 1000e6, owner);

        token.transfer(player, 1000e6);
        vm.prank(player);
        token.approve(address(game), type(uint256).max);
    }

    function test_placeBet_escrowsStake() public {
        uint8[] memory numbers = new uint8[](1);
        numbers[0] = 7;

        vm.prank(player);
        game.placeBet(ROUND_ID, 0, numbers, 10e6);

        assertEq(token.balanceOf(address(game)), 10e6);
        assertEq(game.nextTicketId(), 2);
    }

    function test_commitAndReveal_matchesCommittedSeed() public {
        bytes32 seed = keccak256("dice-seed");
        bytes32 commitHash = keccak256(abi.encodePacked(seed));

        vm.prank(owner);
        game.commitRound(ROUND_ID, commitHash);

        vm.prank(owner);
        game.revealRound(ROUND_ID, seed);

        (uint8 die1, uint8 die2, bool committed, bool revealed,) = game.getRound(ROUND_ID);
        assertTrue(committed);
        assertTrue(revealed);
        assertGe(die1, 1);
        assertLe(die1, 6);
        assertGe(die2, 1);
        assertLe(die2, 6);
    }

    function test_revealRound_revertsOnSeedMismatch() public {
        bytes32 commitHash = keccak256(abi.encodePacked(keccak256("real-seed")));

        vm.prank(owner);
        game.commitRound(ROUND_ID, commitHash);

        vm.prank(owner);
        vm.expectRevert(WinRollGame.CommitMismatch.selector);
        game.revealRound(ROUND_ID, keccak256("wrong-seed"));
    }

    function test_placeBet_revertsBelowMinBet() public {
        uint8[] memory numbers = new uint8[](0);

        vm.prank(player);
        vm.expectRevert(WinRollGame.InvalidAmount.selector);
        game.placeBet(ROUND_ID, 1, numbers, 0.5e6);
    }
}

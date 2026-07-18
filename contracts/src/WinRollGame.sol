// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WinRollGame
 * @notice USDT dice-prediction contract for Celo. Stakes are escrowed in the
 *         contract; each round's roll is produced with a commit-reveal
 *         scheme so the operator cannot choose (or change) an outcome after
 *         seeing where the bets landed.
 *
 * @dev Denominated in USDT on Celo (6 decimals). Winners are paid off-chain
 *      by the operator (winroll-cron), funded from escrowed stakes via
 *      `withdrawToken` — same payout model as CbetLotto. Non-upgradeable:
 *      a v1 dice game with a fixed rule set doesn't need upgrade machinery;
 *      redeploy + point the app/cron at a new address if the rules change.
 *
 *      Designed for MiniPay: players call `placeBet` directly (approve +
 *      placeBet), signing with their MiniPay wallet — no permit/relayer needed.
 */
contract WinRollGame is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Stake token (USDT on Celo, 6 decimals).
    IERC20 public immutable token;

    uint256 public nextTicketId;
    uint256 public minBet; // token base units (USDT = 6 decimals, e.g. 1e6 = 1 USDT)
    uint256 public maxBet;

    /**
     * betType encoding:
     * - 0 = exact-sum   (numbers = [sum], sum in 2-12)
     * - 1 = over        (sum > 7, numbers = [])
     * - 2 = under       (sum < 7, numbers = [])
     * - 3 = lucky-seven (sum == 7, numbers = [])
     * - 4 = double      (die1 == die2, numbers = [])
     */
    struct Round {
        bytes32 commitHash;
        uint64 committedAt;
        uint8 die1;
        uint8 die2;
        uint64 revealedAt;
        bool committed;
        bool revealed;
    }

    /// @dev roundIdHash => round state
    mapping(bytes32 => Round) private _rounds;

    event BetPlaced(
        uint256 indexed ticketId,
        address indexed player,
        bytes32 indexed roundIdHash,
        uint8 betType,
        uint8[] numbers,
        uint256 amount,
        string roundId
    );

    event RoundCommitted(bytes32 indexed roundIdHash, bytes32 commitHash, string roundId, uint64 committedAt);

    event RoundRevealed(
        bytes32 indexed roundIdHash,
        uint8 die1,
        uint8 die2,
        string roundId,
        bytes32 seed,
        uint64 revealedAt
    );

    error InvalidAmount();
    error InvalidBetType();
    error InvalidNumbers();
    error RoundAlreadyCommitted();
    error RoundNotCommitted();
    error RoundAlreadyRevealed();
    error CommitMismatch();

    constructor(address _token, uint256 _minBet, uint256 _maxBet, address _owner) Ownable(_owner) {
        if (_token == address(0) || _owner == address(0)) revert InvalidAmount();
        token = IERC20(_token);
        minBet = _minBet;
        maxBet = _maxBet;
        nextTicketId = 1;
    }

    function _roundIdHash(string calldata roundId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(roundId));
    }

    function _validateBet(uint8 betType, uint8[] calldata numbers) internal pure {
        if (betType == 0) {
            if (numbers.length != 1 || numbers[0] < 2 || numbers[0] > 12) revert InvalidNumbers();
            return;
        }
        if (betType >= 1 && betType <= 4) {
            if (numbers.length != 0) revert InvalidNumbers();
            return;
        }
        revert InvalidBetType();
    }

    /**
     * @notice Place a bet on the current round. The player must have
     *         approved at least `amount` of the stake token first.
     * @param roundId Round identifier, e.g. "20260718-1405".
     * @param betType On-chain bet type (see encoding above).
     * @param numbers Prediction payload (only used by exact-sum).
     * @param amount  Stake amount in USDT base units (6 decimals).
     */
    function placeBet(
        string calldata roundId,
        uint8 betType,
        uint8[] calldata numbers,
        uint256 amount
    ) external nonReentrant {
        if (amount < minBet || amount > maxBet) revert InvalidAmount();
        _validateBet(betType, numbers);

        bytes32 roundIdHash = _roundIdHash(roundId);
        if (_rounds[roundIdHash].revealed) revert RoundAlreadyRevealed();

        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 ticketId = nextTicketId++;
        emit BetPlaced(ticketId, msg.sender, roundIdHash, betType, numbers, amount, roundId);
    }

    /// @notice Open a round by publishing a commitment to the seed that will drive it (owner/cron only).
    function commitRound(string calldata roundId, bytes32 commitHash) external onlyOwner {
        bytes32 roundIdHash = _roundIdHash(roundId);
        if (_rounds[roundIdHash].committed) revert RoundAlreadyCommitted();

        _rounds[roundIdHash] = Round({
            commitHash: commitHash,
            committedAt: uint64(block.timestamp),
            die1: 0,
            die2: 0,
            revealedAt: 0,
            committed: true,
            revealed: false
        });

        emit RoundCommitted(roundIdHash, commitHash, roundId, uint64(block.timestamp));
    }

    /**
     * @notice Reveal the seed and roll the dice on-chain (owner/cron only).
     *         Anyone can independently recompute `keccak256(seed)` and
     *         `keccak256(seed, roundIdHash)` to verify the roll wasn't
     *         chosen after the commitment was published.
     */
    function revealRound(string calldata roundId, bytes32 seed) external onlyOwner {
        bytes32 roundIdHash = _roundIdHash(roundId);
        Round storage round_ = _rounds[roundIdHash];

        if (!round_.committed) revert RoundNotCommitted();
        if (round_.revealed) revert RoundAlreadyRevealed();
        if (keccak256(abi.encodePacked(seed)) != round_.commitHash) revert CommitMismatch();

        bytes32 entropy = keccak256(abi.encodePacked(seed, roundIdHash));
        uint8 die1 = uint8(uint256(entropy) % 6) + 1;
        uint8 die2 = uint8((uint256(entropy) >> 8) % 6) + 1;

        round_.die1 = die1;
        round_.die2 = die2;
        round_.revealedAt = uint64(block.timestamp);
        round_.revealed = true;

        emit RoundRevealed(roundIdHash, die1, die2, roundId, seed, round_.revealedAt);
    }

    function getRound(string calldata roundId)
        external
        view
        returns (uint8 die1, uint8 die2, bool committed, bool revealed, uint64 revealedAt)
    {
        Round storage round_ = _rounds[_roundIdHash(roundId)];
        return (round_.die1, round_.die2, round_.committed, round_.revealed, round_.revealedAt);
    }

    function setLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        minBet = _minBet;
        maxBet = _maxBet;
    }

    /// @notice Move escrowed stake token out (e.g. to fund off-chain winner payouts).
    function withdrawToken(address to, uint256 amount) external onlyOwner {
        token.safeTransfer(to, amount);
    }
}

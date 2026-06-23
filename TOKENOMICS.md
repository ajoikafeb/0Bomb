<div align="center">
  <img src="./public/logo.png" alt="0GBomber Logo" width="80" />
  <h1>0GBomber Tokenomics</h1>
  <p><strong>AI-Powered Autonomous Farming Game on 0G</strong></p>
</div>

---

## Overview

0GBomber features a **dual-currency economy** designed for sustainable reward distribution, player retention, and long-term value accrual.

| Currency | Symbol | Type | Use Case |
|---|---|---|---|
| **0BOMB** | `$0BOMB` | On-chain token (0G ERC-20) | Marketplace, rewards, upgrades |
| **Fragment** | `💎` | Off-chain score | In-game progression, conversion |

---

## 0BOMB Token

### Network
- **Blockchain**: 0G Galileo Testnet
- **Chain ID**: 16602
- **Token Standard**: ERC-20
- **Decimals**: 18
- **Contract**: `0xB9Ca501a3e59716F328552C7BA26d1fa68Dc76E6`
- **Treasury**: `0xa8DAb875Eb73173C8C96215445263AA6a6851Af6`

### Utility

| Use | Description |
|---|---|
| **Hero Hatching** | 25 0BOMB to hatch a new hero |
| **Equipment Minting** | 5 0BOMB to mint found equipment on-chain |
| **Cosmetic Minting** | 10 0BOMB to mint cosmetic items on-chain |
| **Marketplace Fees** | 2.5% fee on all trades (configurable by admin) |
| **Hero Upgrades** | Future: pay to boost hero stats |
| **Equipment Upgrades** | Future: pay to add/reroll affixes |
| **Cryo Pods** | Future: preserve hero for bloodline transfer |
| **Gacha System** | Future: randomized loot boxes |
| **Governance** | Future: DAO voting weight |

---

## Fragment Economy

Fragments (`💎`) are the **off-chain score currency** earned through gameplay.

### Earning Fragments

| Activity | Fragment Yield |
|---|---|
| Enemy Kill | 2 per kill |
| Block Destroyed | 0.5 per block |
| Loot Collected | 3 per item |
| Map Clear (Easy) | 5–15 |
| Map Clear (Advanced) | 10–25 |
| Map Clear (Nightmare) | 20–40 |
| Boss Kill Bonus | +10–60 (by difficulty) |
| Loot Token Bonus | 3 × loot collected |

All fragment rewards are multiplied by `eventRewardMultiplier` (admin-configurable).

### Fragment → Token Conversion

Fragments can be converted to 0BOMB tokens:

- **Conversion Rate**: 10 fragments = 1 0BOMB
- **Minimum Claim**: 500 0BOMB (5,000 fragments)
- **Process**: Create withdrawal request → Admin approves → On-chain transfer

---

## Reward Chest System

When a map is cleared, a `RewardChest` is generated containing:

| Item | Base Drop Rate | Scaling Factors |
|---|---|---|
| Common Equipment | 20% | Luck, Treasure Hunter, Clear Time Bonus, Difficulty |
| Rare Equipment | 3% | Luck, Treasure Hunter, Clear Time Bonus, Difficulty |
| Upgrade Seed | 5% | Luck, Treasure Hunter, Clear Time Bonus |
| Fragments | 40% | Difficulty Config, Clear Time Bonus |
| Potions | Per-battle find | 30% chance per kill |

### Clear Time Bonus

| Time | Bonus Multiplier |
|---|---|
| ≤ 3 minutes | 100% (1.0x) |
| 4 minutes | 88% (0.88x) |
| 5 minutes | 76% (0.76x) |
| 8 minutes+ | 0% (floor) |

Formula: `bonus = max(0, 1.0 - (elapsedSeconds - 180) * 0.002)`

---

## Marketplace Fees

| Transaction | Fee | Recipient |
|---|---|---|
| Hero Sale | 2.5% | Treasury |
| Equipment Sale | 2.5% | Treasury |
| Cosmetic Sale | 2.5% | Treasury |
| Cryo Pod Sale | 2.5% | Treasury |
| Potion Sale | 2.5% | Treasury |

The marketplace fee rate is configurable by admin (default: 2.5%).

---

## Economy Controls (Admin)

The admin dashboard provides real-time economy tuning:

| Control | Effect |
|---|---|
| `rewardMultiplier` | Global reward scaling (0.0 – 10.0) |
| `currencyDropRate` | Fragment drop frequency modifier |
| `equipmentDropRate` | Equipment drop rate modifier |
| `cosmeticDropRate` | Cosmetic drop rate modifier |
| `upgradeSeedDropRate` | Upgrade seed drop rate modifier |
| `rareLootDropRate` | Rare loot probability modifier |
| `eventRewardMultiplier` | Event bonus multiplier |
| `marketplaceEnabled` | Toggle marketplace on/off |
| `tradingEnabled` | Toggle player-to-player trading |
| `rewardClaimsEnabled` | Toggle reward claiming |
| `currencyConversionEnabled` | Toggle fragment → token conversion |

### Emergency Shutdown

Admin can independently pause:
- Marketplace
- Trading
- Reward claims

With global maintenance mode as an override.

---

## Faucet

New players can claim free 0BOMB from the faucet:

| Property | Value |
|---|---|
| **Claim Amount** | 200 0BOMB |
| **Cooldown** | 24 hours |
| **Eligibility** | Any wallet address |

---

## Token Flow Diagram

```
                    ┌──────────────────┐
                    │    Faucet        │
                    │  (200 0BOMB/24h) │
                    └────────┬─────────┘
                             │
                             ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Gameplay   │    │     Wallet       │    │  Marketplace     │
│   (Kills,    │───>│    Balance       │<───│  (Buy/Sell)      │
│   Clears)    │    │  (0BOMB + 💎)    │    │                  │
└──────┬───────┘    └──────────────────┘    └──────────────────┘
       │                     │  │
       │                     │  │
       ▼                     │  ▼
┌──────────────┐             │  ┌──────────────────┐
│  Fragments   │             │  │   Hero Hatching  │
│  (💎)        │             │  │   (25 0BOMB)     │
│              │             │  └──────────────────┘
│  10💎 = 1    │             │
│  On-chain    │             │  ┌──────────────────┐
│  Withdrawal  │◄────────────┘  │   Equipment      │
│  (min 500)   │                │   Minting         │
└──────────────┘                │   (5 0BOMB)       │
                                └──────────────────┘
                                ┌──────────────────┐
                                │  Cosmetic        │
                                │  Minting         │
                                │  (10 0BOMB)      │
                                └──────────────────┘
```

---

## Future Tokenomics

### Planned Features

| Feature | Description |
|---|---|
| **Cryo Pods** | Pay 0BOMB to freeze a hero for future bloodline transfer |
| **Gacha System** | Randomized loot boxes with tiered drop rates |
| **Equipment Reroll** | Pay to reroll equipment affixes |
| **Hero Enhancement** | Pay to boost specific stats on a hero |
| **DAO Governance** | Vote on economy parameters with 0BOMB stake |
| **Token Burns** | Deflationary mechanisms via marketplace fees or gacha |

### Supply Model

0BOMB is currently a **testnet token** with no fixed supply cap. Future mainnet launch will define:
- Total supply
- Emission schedule
- Burn mechanisms
- Staking rewards

---

<p align="center">
  <a href="./README.md">← Back to README</a> &nbsp;|&nbsp;
  <a href="./GAME_DESIGN.md">Game Design →</a>
</p>

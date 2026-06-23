<div align="center">
  <img src=\"./public/logo.png\" alt=\"0GBomber Logo\" width=\"80\" />
  <h1>0GBomber Game Design</h1>
  <p><strong>AI-Powered Autonomous Farming Game on 0G</strong></p>
</div>

---

## Table of Contents

1. [Hero System](#hero-system)
2. [AI Decision Engine](#ai-decision-engine)
3. [Map System](#map-system)
4. [Auto Farm System](#auto-farm-system)
5. [Equipment System](#equipment-system)
6. [Cosmetic System](#cosmetic-system)
7. [Legacy System](#legacy-system)
8. [Bloodline System](#bloodline-system)
9. [Marketplace](#marketplace)
10. [Memory & Trait System](#memory--trait-system)

---

## Hero System

### Classes

| Class | Specialty | Stat Bonuses |
|---|---|---|
| **Marine** | Combat | Power +15, Defense +10 |
| **Scout** | Speed & Exploration | Speed +15, Exploration +10 |
| **Scientist** | Intelligence & Learning | Intelligence +15, Learning Rate +10 |
| **Miner** | Currency Generation | Mining +15, Efficiency +10 |
| **Medic** | Survivability | Vitality +15 |
| **Commander** | Leadership | Learning Rate +10, Adaptability +10, Risk Awareness +10 |
| **Engineer** | Equipment Synergy | Scavenging +10, Efficiency +10 |

### Rarities

| Rarity | Total Stat Points | Energy Range | Color |
|---|---|---|---|
| Common | 60 | 80-120 | Gray |
| Rare | 90 | 100-150 | Blue |
| Epic | 130 | 130-180 | Purple |
| Legendary | 180 | 160-220 | Gold |
| Mythic | 220 | 200-260 | Red |
| Genesis | 250 | 220-300 | Cyan |

### Core Stats (0-100)

| Stat | Effect |
|---|---|
| **Power** | Bomb damage, alien damage, object destruction |
| **Defense** | Damage reduction, survival rate |
| **Speed** | Movement speed, loot collection, bomb placement, escape |
| **Intelligence** | AI decision making, pathfinding, farming efficiency |
| **Luck** | Equipment drops, cosmetic drops, rare loot, event rewards |
| **Vitality** | HP, energy pool, stamina recovery |

### AI Stats (0-100)

| Stat | Effect |
|---|---|
| **Learning Rate** | Memory gain speed, AI improvement |
| **Adaptability** | Handling map changes, dynamic situations |
| **Risk Awareness** | Trap/lava avoidance, survival decisions |
| **Exploration** | Map coverage, secret loot discovery |
| **Aggression** | Enemy engagement frequency, combat priority |

### Farming Stats (0-100)

| Stat | Effect |
|---|---|
| **Mining** | Currency generation |
| **Scavenging** | Equipment drops |
| **Treasure Hunter** | Rare item discovery |
| **Efficiency** | Reward per energy spent |

### Personality (0-100)

| Trait | Effect |
|---|---|
| **Brave** | Willingness to fight |
| **Greedy** | Prioritizes loot over safety |
| **Curious** | Explores more map areas |
| **Loyal** | Works better in teams |
| **Lazy** | Consumes less energy but farms slower |
| **Tactical** | Makes smarter decisions |

---

## AI Decision Engine

### Action Score System

Every game tick, each hero evaluates 7 possible actions using a weighted scoring formula:

`
Score = BaseValue + IntelligenceMod + PersonalityMod + TraitMod
        + MemoryMod + TeamMod + Threat/OpportunityMod + RandomNoise(+-5%)
`

### Actions

| Action | Base Score | Trigger |
|---|---|---|
| **Bomb** | 50 | Enemy nearby, bombable wall, or combat situation |
| **Collect Loot** | 40 | Loot item within range |
| **Explore** | 30 + modifier | No immediate threats, unexplored tiles |
| **Evade** | 20 | Enemy or bomb threat detected |
| **Avoid Lava** | 10 | Lava tile adjacent |
| **Idle** | 5 | Low energy, no threats |
| **Wander** | 20 | No better option |

### Stuck Detection

- Tracks last 15 position samples
- If 5+ consecutive same-position ticks in 15-tick window -> forced path recalculation
- Clears search target, resets history

### Team AI

- **Loyalty > 60**: Hero seeks to stay near team center
- **Loyalty < 30**: Lone wolf -- explores independently
- Loyalty influences action scores to encourage or discourage grouping

### Difficulty Scaling

| Factor | Easy | Advanced | Nightmare |
|---|---|---|---|
| Enemies | 3-5 | 5-8 | 7-10 |
| Enemy HP Bonus | +0 | +1 | +2 |
| Block Percent | 1.0x | 1.1x | 1.2x |
| Max Ticks | 400 | 500 | 600 |
| Energy Cost | 5 | 10 | 15 |
| XP Multiplier | 1.0x | 1.5x | 2.0x |

---

## Map System

### Grid Generation

- **Dimensions**: 21 columns x 17 rows
- **Border**: Solid walls around perimeter
- **Pattern**: Classic Bomberman -- even coordinates are solid walls
- **Spawn Zone**: Top-left 3x3 cleared area
- **Destructible**: ~30% of remaining cells (scaled by difficulty)
- **Lava**: ~3% of cells (hazard)

### Tile Types

| Type | ID | Behavior |
|---|---|---|
| Empty | 0 | Walkable |
| Solid Wall | 1 | Indestructible |
| Destructible | 2 | Breakable by bombs |
| Lava | 3 | Damages heroes on contact |
| Crystal | 4 | Special resource tile |

### Map Progression

- Maps track: grid state, enemy positions, progress (0-100%)
- Progress = 30% block destruction + 70% enemy elimination
- Maps can be saved, resumed, or discarded
- Up to 4 active maps per player

---

## Auto Farm System

### Features

| Feature | Description |
|---|---|
| **Auto Deploy** | Automatically deploys heroes when energy is available |
| **Auto Redeploy** | After reward claim, automatically starts next battle |
| **Hero Toggle** | Per-hero auto_deploy flag for selective farming |
| **Team Builder** | Automatically selects optimal team by efficiency x2 + energy + intelligence |

### Energy System

- Max energy varies by rarity (80-300)
- Energy cost per deployment: 5 (Easy), 10 (Advanced), 15 (Nightmare)
- Energy drain: 1 point per 10 game ticks
- Energy regen: 1 point per 5 minutes
- Energy potions restore +30 energy instantly
- Heroes with <20% energy prioritize idle to conserve

---

## Equipment System

### Slots

| Slot | Function |
|---|---|
| Bomb Core | Bomb damage, blast radius |
| Engine | Movement speed, evasion |
| Armor | Damage reduction, HP |
| Memory Chip | Intelligence, learning rate |
| Scanner | Exploration, loot detection |
| Utility Device | Farming efficiency, rare find |

### Rarities

Common -> Rare -> Epic -> Legendary -> Mythic

### Affixes

Equipment can have 1-5 random affixes that modify stats:
- Affix tiers scale with equipment rarity
- Higher rarity = more affixes + better stat ranges

### Set Bonuses

Certain equipment combinations grant additional bonuses when 2, 4, or 6 pieces of the same set are equipped.

---

## Cosmetic System

### Slots

| Slot | Examples |
|---|---|
| Helmet | Crown, Mask, Visor |
| Suit | Armor, Robe, Exosuit |
| Trail | Fire, Ice, Void |
| Bomb Effect | Explosion VFX variations |
| Aura | Glowing aura around hero |
| Drone | Floating companion |

Cosmetics are purely visual -- no gameplay impact.

---

## Legacy System

### Becoming Legendary

Requirements:
- Level >= 10
- All core stats >= 70
- Not already legendary

### Legacy Creation

When a hero becomes legendary:
1. Hero is marked as legendary (Tier I)
2. A new hero is created with:
   - Level 1
   - 30% inherits parent's core stats (minimum 10)
   - Parent's genetics
   - Slightly mutated personality
   - First 2 traits inherited
   - Bloodline record established

### Legacy Tiers

Tier I -> Tier II -> Tier III -> Tier IV -> Tier V

### Legacy Cores

When retiring a high-level hero, a Legacy Core is generated containing:
- XP stored
- Memories preserved
- Traits preserved
- DNA fragments
- Tier rating

---

## Bloodline System

### Genetic Inheritance

Parent DNA yields Child DNA with:
- 30-70% stats inherited
- 10% mutation chance per stat (-10 to +15)
- 40% trait inheritance chance per trait

### Genetic Stats

| Stat | Range | Effect |
|---|---|---|
| DNA Quality | 1-100 | Overall genetic potential |
| Potential | 1-100 | Maximum stat growth cap |
| Mutation Chance | 1-100 | Likelihood of rare trait mutations |
| Legacy Affinity | 1-100 | Effectiveness of inherited Legacy Cores |

### Bloodline Record

Each hero carries a BloodlineInfo with parent_id, parent_name, generation, inherited_stats, inherited_traits, and dna_similarity (0-100%).

---

## Marketplace

### Listing Types

Hero, Equipment, Cosmetic, Cryo Pod (future), Potion

### Fees

- 2.5% marketplace fee on all trades (configurable)
- Fees credited to treasury wallet

### Statuses

active -> sold or cancelled

---

## Memory & Trait System

### Memory Events

Heroes generate memories from: Killed Alien, Found Rare Loot, Touched Lava, Near Death Escape, Perfect Clear, Boss Kill, Found Legendary Item, Perfect Farming Run, Died To Trap.

Memories influence future AI decisions.

### Trait Unlocks

| Trait | Requirement | Bonus |
|---|---|---|
| Loot Goblin | Loot >= 5, Luck >= 40 | Luck +15 |
| Bomb Expert | Bombs >= 20 | Power +20 |
| Survivor | Survived >= 10 | Defense +20 |
| Explorer | Clears >= 1 | Exploration +20 |
| Tactical Genius | Boss kills >= 3 | Intelligence +20 |
| Lava Survivor | Level >= 5, Lava >= 1 | Defense +10, Risk Awareness +10 |
| Treasure Hunter | Loot >= 3 | Treasure Hunter +15, Luck +5 |
| Bomb Master | Level >= 3 | Power +10, Intelligence +5 |
| Fast Learner | Level >= 10 | Learning Rate +15 |
| Alien Slayer | Kills >= 5 | Power +10, Aggression +10 |
| Speed Demon | Level >= 8, Speed >= 50 | Speed +15 |
| Iron Will | Level >= 12, Vitality >= 60 | Vitality +15 |

---

<p align="center">
  <a href=\"./README.md\">← Back to README</a> &nbsp;|&nbsp;
  <a href=\"./ARCHITECTURE.md\">Architecture →</a> &nbsp;|&nbsp;
  <a href=\"./TOKENOMICS.md\">Tokenomics →</a>
</p>

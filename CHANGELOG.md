<div align="center">
  <img src="./public/logo.png" alt="0GBomber Logo" width="80" />
  <h1>0GBomber Changelog</h1>
  <p><strong>AI-Powered Autonomous Farming Game on 0G</strong></p>
</div>

---

## [Unreleased]

### Added
- Per-hero auto farm toggle with energy cost display
- Auto team builder button using `autoBuildTeam()`
- Reward chest system with clear time bonus
- Dynamic energy cost by difficulty (Easy=5, Advanced=10, Nightmare=15)
- Clear time display in battle results
- Auto-redeploy after claim using `getAutoFarmEligibleHeroes()`

### Fixed
- Missing `startedAt`, `completedAt`, `autoDeployed` fields in `createNewActiveMap()`

---

## [0.1.0] - 2026-06-23

### Phase 2: AI Evolution

#### Added
- AI Decision Engine with full action scoring system
- Action scoring formula: Base + Intelligence + Personality + Traits + Memories + Team + Threats/Opportunities + Random Noise
- 7 hero actions: bomb, collect_loot, explore, evade, avoid_lava, idle, wander
- Stuck detection with position history tracking and forced path recalculation
- Team AI with loyalty-based grouping (loyalty > 60 groups up, < 30 lone wolf)
- Difficulty scaling affecting aggression, risk awareness, and intelligence weight
- Memory system — heroes record significant events (kills, loot, lava, death escapes)
- 12 unlockable traits with conditional requirements
- AI stat evolution through battle performance
- Learning rate modifier for XP gain
- Personality-driven behavior (6 trait dimensions: brave, greedy, curious, loyal, lazy, tactical)

#### Changed
- Complete rewrite of `GameStateManager.ts` with typed stat objects
- Migration from flat records to `HeroCoreStats`, `HeroAIStats`, `HeroFarmingStats`, `HeroGeneticStats`, `HeroPersonality`
- `addXP()` uses learning_rate modifier: `1 + (lr - 50) / 100`
- `evolveAIStats()` scales with learning_rate + ticks + performance

#### Fixed
- Supabase client initialization — changed from module-level `createClient()` to lazy `getSupabase()` to prevent prerender crash
- TypeScript errors in `admin/page.tsx` (removed `hero.intelligence` reference)
- Type cast issues in `GameStateManager.ts`

---

### Phase 1: Core Gameplay

#### Added
- Next.js 16 project with TypeScript and Tailwind CSS 4
- Landing page with hero section, features showcase, roadmap, token section, footer
- Wallet connection with 0G Galileo testnet (Chain ID 16602)
- Balance display for 0BOMB token
- Hero generation system with 7 classes and 6 rarities
- Class stat bonuses (Marine, Scout, Scientist, Miner, Medic, Commander, Engineer)
- Rarity system (Common, Rare, Epic, Legendary, Mythic, Genesis)
- Weighted stat allocation with class preferences
- 32 unique hero names
- Core stats: power, defense, speed, intelligence, luck, vitality
- AI stats: learning_rate, adaptability, risk_awareness, exploration, aggression
- Farming stats: mining, scavenging, treasure_hunter, efficiency
- Genetic stats: dna_quality, potential, mutation_chance, legacy_affinity
- Personality system: brave, greedy, curious, loyal, lazy, tactical
- Energy system with regeneration and potions
- Basic battle system with grid generation
- 3 difficulty levels: Easy, Advanced, Nightmare
- Hero detail view with 11 tabs
- Admin dashboard with economy controls
- Equipment system with 6 slots
- Cosmetic system with 6 slots
- Auto-deploy system
- Map progression tracking
- Save/load battle state

---

<p align="center">
  <a href="./README.md">← Back to README</a> &nbsp;|&nbsp;
  <a href="./CONTRIBUTING.md">Contributing →</a>
</p>

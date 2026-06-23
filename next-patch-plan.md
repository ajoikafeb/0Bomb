# 0GBomber — Next Patch Plan (v0.2)

## Priority: High
1. **Supabase Integration** — Replace localStorage with PostgreSQL persistence
   - Configure NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
   - Migrate all GameStateManager CRUD to Supabase queries
   - Enable global leaderboard with cross-player data

2. **Owner Wallet Config** — Set OWNER_WALLET in constants.ts
   - Current: 0xa8DAb875Eb73173C8C96215445263AA6a6851Af6
   - Verify admin gating works correctly

3. **Real 0BOMB Token Balance** — Connect to 0G Galileo RPC
   - Fetch on-chain balance via ethers.js
   - Display in wallet connect button + profile

## Priority: Medium
4. **Boss Fights** — Lava Titan, Hive Queen, Ancient Guardian, Void Dragon
   - Phaser boss encounters with unique mechanics
   - Boss drops: rare loot, equipment, cosmetics, badges

5. **Biome System** — Multiple map types
   - Lava Caverns, Ice Caves, Alien Hive, Crystal Mines, Void
   - Each with unique hazards, enemies, and visual themes

6. **Equipment System in Game** — Equip items to heroes, stats affect gameplay
   - Slot-based equipment (Bomb Core, Engine, Armor, etc.)
   - Stats modify bomb range, speed, defense, etc.

7. **Map Switching** — Max 4 active maps, quick-switch UI on /game page

## Priority: Low
8. **Advanced Enemy AI** — Hive Guard, Void Beast, Titan with special attacks
9. **Achievement Badges** — Combat, Loot, Survival, AI Intelligence, etc.
10. **Difficulty Levels** — Easy / Advanced / Nightmare with scaling rewards
11. **Mobile Responsiveness** — Polish touch controls for Phaser game
12. **Animations & Polish** — Smooth transitions, loot animations, particle effects

## Deployment
- Current: Ready for push to GitHub + Vercel deploy
- No env vars configured yet → will build with defaults but Supabase features inactive

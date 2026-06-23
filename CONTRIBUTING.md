<div align="center">
  <img src="./public/logo.png" alt="0GBomber Logo" width="80" />
  <h1>Contributing to 0GBomber</h1>
  <p><strong>AI-Powered Autonomous Farming Game on 0G</strong></p>
</div>

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branch Strategy](#branch-strategy)
5. [Commit Convention](#commit-convention)
6. [Coding Standards](#coding-standards)
7. [Pull Request Process](#pull-request-process)
8. [Project Structure](#project-structure)

---

## Code of Conduct

This project is committed to providing a welcoming, inclusive, and harassment-free experience for everyone. By participating, you agree to:

- Be respectful and constructive
- Accept constructive criticism gracefully
- Focus on what is best for the community and project
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git
- A wallet configured for 0G Galileo testnet

### Local Setup

```bash
# Fork and clone
git clone https://github.com/your-username/0Bomb.git
cd 0Bomb

# Add upstream remote
git remote add upstream https://github.com/ajoikafeb/0Bomb.git

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start dev server
npm run dev
```

### Verify Setup

```bash
# Run the development server
npm run dev

# Should see the app at http://localhost:3000
# Connect wallet using the top-right button
# Hatch a hero via the Heroes page
```

---

## Development Workflow

1. **Sync**: `git checkout develop && git pull upstream develop`
2. **Branch**: Create feature branch from `develop`
3. **Code**: Implement your changes
4. **Test**: `npm run build` (must pass TypeScript check)
5. **Lint**: `npm run lint`
6. **Commit**: Follow commit convention
7. **Push**: `git push origin feature/your-feature`
8. **PR**: Open PR against `develop`

---

## Branch Strategy

```
main
  └── develop
        ├── feature/hero-system
        ├── feature/ai-system
        ├── feature/map-system
        ├── feature/economy
        ├── feature/admin-dashboard
        ├── feature/blockchain
        ├── feature/marketplace
        ├── feature/legacy-system
        └── feature/bloodline-system
```

| Branch | Purpose |
|---|---|
| `main` | Stable production version |
| `develop` | Current development work |
| `feature/*` | Individual features (branch off `develop`, merge back to `develop`) |

---

## Commit Convention

All commits must follow this format:

```
<type>: <description>
```

### Types

| Type | Usage | Example |
|---|---|---|
| `feat` | New feature | `feat: implement hero dna generation` |
| `fix` | Bug fix | `fix: resolve wallet connection issue` |
| `refactor` | Code restructuring | `refactor: optimize hero state management` |
| `style` | UI changes | `style: redesign hero detail page` |
| `docs` | Documentation | `docs: update game architecture documentation` |
| `test` | Testing | `test: add ai decision engine tests` |
| `chore` | Maintenance | `chore: update project dependencies` |
| `release` | Milestone release | `release: beta version 0.1.0` |

### Guidelines

- Use **imperative present tense**: "implement" not "implements" or "implemented"
- First word lowercase, no period at end
- Keep under 72 characters
- Be specific: "feat: add hero energy regen system" not "feat: update"
- Include scope when relevant: `feat(api): add marketplace listings endpoint`

### Examples

```
feat: implement autonomous farming system
feat: add legacy inheritance mechanics
fix: resolve supabase prerender crash
refactor: optimize energy consumption algorithm
style: redesign hero detail page layout
docs: add tokenomics documentation
chore: update typescript to 5.5
release: beta version 0.1.0
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript with proper types
- Prefer interfaces over types for object shapes
- Avoid `any` — use `unknown` when type is uncertain
- Use `as const` for constant arrays/objects
- Export types from a single source (`types.ts`)

### React / Next.js

- Use functional components with hooks
- Use `useCallback` / `useMemo` for expensive computations
- Keep components focused and small
- Use Next.js App Router conventions
- Server components for static content, client components for interactivity

### Game Engine Code

- All game logic lives in `src/lib/game/`
- No React imports in game engine files
- Game state is serializable (localStorage-safe)
- Pure functions preferred over side effects

### Styling

- Use Tailwind CSS utility classes
- Maintain dark theme consistency
- Use the existing color palette (cyan/purple/gray accents)

---

## Pull Request Process

1. **Title**: Use commit convention format: `feat: add hero auto farm toggle`
2. **Description**: Explain what the PR does, why, and how to test
3. **Linked Issues**: Reference related issues
4. **TypeScript Check**: `npm run build` must pass
5. **Review**: At least one approval required
6. **Merge**: Squash merge into `develop`

### PR Template

```markdown
## Description
Brief description of the changes.

## Type
- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] refactor: code restructuring
- [ ] style: UI changes
- [ ] docs: documentation

## How to Test
Steps to verify the changes.

## Checklist
- [ ] TypeScript build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Follows commit convention
- [ ] Self-reviewed
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── game/page.tsx             # Game battle page
│   ├── heroes/page.tsx           # Hero management page
│   ├── marketplace/page.tsx      # Marketplace page
│   └── admin/page.tsx            # Admin dashboard
├── components/                   # Reusable React components
│   ├── pixel-art/               # Pixel art sprites
│   └── wallet/                  # Wallet connection UI
├── hooks/                        # Custom React hooks
└── lib/
    ├── game/                     # Core game engine
    │   ├── types.ts              # All interfaces
    │   ├── constants.ts          # Configuration
    │   ├── heroGenerator.ts      # Hero generation
    │   ├── AIDecisionEngine.ts   # AI behavior
    │   ├── GameStateManager.ts   # State management
    │   ├── equipmentSystem.ts    # Equipment
    │   ├── cosmeticSystem.ts     # Cosmetics
    │   └── dropRates.ts          # Loot tables
    ├── blockchain/               # Blockchain integration
    ├── supabase/                 # Supabase client
    └── audio/                    # Audio management
```

---

## Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Reach out via the project's GitHub Discussions

---

<p align="center">
  <a href="./README.md">← Back to README</a> &nbsp;|&nbsp;
  <a href="./CHANGELOG.md">Changelog →</a>
</p>

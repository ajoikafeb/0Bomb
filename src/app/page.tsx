"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getGlobalLeaderboard } from "@/lib/game/GameStateManager";
import type { LeaderboardEntry } from "@/lib/game/GameStateManager";

// ── Pixel Art Components ──

function PixelHero({ type, size = 48 }: { type: string; size?: number }) {
  const colors: Record<string, string> = {
    Engineer: "#fbbf24", Scout: "#22d3ee", Marine: "#ef4444",
    Scientist: "#a78bfa", Medic: "#34d399", Commander: "#f472b6", Miner: "#fb923c",
  };
  const c = colors[type] || "#22d3ee";
  const s = size / 12;
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges">
      <rect x={4} y={0} width={4} height={2} fill={c} />
      <rect x={3} y={2} width={6} height={2} fill={c} />
      <rect x={2} y={4} width={8} height={2} fill={c} />
      <rect x={4} y={6} width={4} height={4} fill={c} />
      <rect x={3} y={8} width={2} height={2} fill="#fff" />
      <rect x={7} y={8} width={2} height={2} fill="#fff" />
      <rect x={4} y={10} width={2} height={2} fill={c} />
      <rect x={6} y={10} width={2} height={2} fill={c} />
    </svg>
  );
}

function PixelCryoPod({ rarity, size = 48 }: { rarity: string; size?: number }) {
  const glow: Record<string, string> = {
    Common: "#9ca3af", Rare: "#22d3ee", Epic: "#a78bfa",
    Legendary: "#fbbf24", Genesis: "#ef4444",
  };
  const g = glow[rarity] || "#9ca3af";
  const s = size / 16;
  return (
    <svg width={size} height={size} viewBox="0 0 16 24" shapeRendering="crispEdges">
      <rect x={2} y={2} width={12} height={20} rx={2} fill="none" stroke={g} strokeWidth={1.5} />
      <rect x={4} y={4} width={8} height={4} fill={g} opacity={0.3} />
      <rect x={4} y={10} width={8} height={8} fill={g} opacity={0.15} />
      <rect x={6} y={12} width={4} height={6} fill={g} opacity={0.4} />
      <rect x={4} y={20} width={8} height={2} fill={g} opacity={0.5} />
    </svg>
  );
}

function PixelAlien({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" shapeRendering="crispEdges">
      <rect x={2} y={0} width={6} height={2} fill="#22d3ee" />
      <rect x={1} y={2} width={8} height={4} fill="#06b6d4" />
      <rect x={0} y={4} width={2} height={2} fill="#06b6d4" />
      <rect x={8} y={4} width={2} height={2} fill="#06b6d4" />
      <rect x={3} y={3} width={1} height={1} fill="#fff" />
      <rect x={6} y={3} width={1} height={1} fill="#fff" />
      <rect x={3} y={6} width={4} height={2} fill="#0891b2" />
      <rect x={2} y={8} width={2} height={2} fill="#0891b2" />
      <rect x={6} y={8} width={2} height={2} fill="#0891b2" />
    </svg>
  );
}

function PixelItem({ type, size = 24 }: { type: string; size?: number }) {
  const items: Record<string, { color: string; shape: number[][] }> = {
    bomb: { color: "#ef4444", shape: [[1,0,1],[1,1,1],[1,0,1]] },
    shield: { color: "#22d3ee", shape: [[1,1,1],[1,0,1],[1,0,1]] },
    heart: { color: "#f472b6", shape: [[0,1,0],[1,0,1],[1,0,1]] },
    coin: { color: "#fbbf24", shape: [[0,1,0],[1,1,1],[0,1,0]] },
    star: { color: "#a78bfa", shape: [[0,1,0],[1,1,1],[0,1,0]] },
  };
  const item = items[type] || items.coin;
  return (
    <svg width={size} height={size} viewBox="0 0 3 3" shapeRendering="crispEdges">
      {item.shape.map((row, y) => row.map((v, x) => v ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={item.color} /> : null))}
    </svg>
  );
}

// ── Particle Background ──

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles: { x: number; y: number; vx: number; vy: number; s: number; o: number }[] = [];
    const count = Math.min(Math.floor((w * h) / 8000), 120);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        s: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;

    function draw() {
      const c = ctx!;
      c.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

          c.beginPath();
          c.arc(p.x, p.y, p.s, 0, Math.PI * 2);
          c.fillStyle = `rgba(34, 211, 238, ${p.o})`;
          c.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            c.beginPath();
            c.moveTo(p.x, p.y);
            c.lineTo(particles[j].x, particles[j].y);
            c.strokeStyle = `rgba(34, 211, 238, ${(1 - dist / 120) * 0.08})`;
            c.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ── Scroll Reveal ──

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

// ── Glass Card ──

function GlassCard({ children, className = "", glow = "cyan" }: { children: React.ReactNode; className?: string; glow?: string }) {
  const g = glow === "purple"
    ? "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
    : "hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]";
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl hover:border-white/20 transition-all duration-500 ${g} ${className}`}>
      {children}
    </div>
  );
}

// ── Data ──

const FEATURES = [
  { icon: "🧠", title: "AI Learning", desc: "Heroes learn from experience and improve over time through autonomous gameplay." },
  { icon: "💾", title: "Memory System", desc: "Heroes remember past events, battles, and discoveries — adapting their behavior." },
  { icon: "🧬", title: "Legacy System", desc: "Retire legendary heroes and pass their accumulated knowledge to future generations." },
  { icon: "🌳", title: "Bloodlines", desc: "Build powerful family trees. Each generation inherits traits from its ancestors." },
  { icon: "🤖", title: "Autonomous Gameplay", desc: "Heroes farm, fight, explore and evolve on their own — no manual control needed." },
  { icon: "⛓️", title: "Onchain Economy", desc: "Powered by $0BOMB on the 0G Galileo blockchain. Real ownership, real rewards." },
];

const GAMEPLAY_PANELS = [
  { title: "Hero Farming", desc: "AI heroes autonomously navigate alien sectors, collect resources, and avoid threats." },
  { title: "Trait Evolution", desc: "Actions unlock unique traits. Heroes develop distinct personalities and combat styles." },
  { title: "Memory Growth", desc: "Each experience stored as a memory. Memories shape future decision-making." },
  { title: "Marketplace", desc: "Trade hero NFTs, equipment, cosmetics, and rare cryo pods with other players." },
];

const PODS = [
  { name: "Common", color: "#9ca3af", border: "#6b7280", desc: "Standard issue cryo pod. Contains base heroes." },
  { name: "Rare", color: "#22d3ee", border: "#06b6d4", desc: "Enhanced pod. Higher chance of rare traits." },
  { name: "Epic", color: "#a78bfa", border: "#8b5cf6", desc: "Premium pod. Contains heroes with epic potential." },
  { name: "Legendary", color: "#fbbf24", border: "#f59e0b", desc: "Legendary pod. Guarantees legendary hero." },
  { name: "Genesis", color: "#ef4444", border: "#dc2626", desc: "First-generation pod. Rarest of them all." },
];

const CLASSES = [
  { name: "Engineer", color: "#fbbf24", desc: "Builds defenses and repairs structures. High intel, low combat." },
  { name: "Scout", color: "#22d3ee", desc: "Fast explorer. Uncovers map and detects threats early." },
  { name: "Marine", color: "#ef4444", desc: "Front-line combat specialist. High HP, aggressive AI." },
  { name: "Scientist", color: "#a78bfa", desc: "Studies alien tech. Boosts team intelligence growth." },
  { name: "Medic", color: "#34d399", desc: "Heals allies and revives downed heroes in the field." },
  { name: "Commander", color: "#f472b6", desc: "Leadership aura. Boosts nearby hero combat performance." },
  { name: "Miner", color: "#fb923c", desc: "Resource specialist. Increased loot find and collection range." },
];

const EVOLUTION_STEPS = [
  { label: "Deploy", desc: "Hatch from cryo pod as a basic hero" },
  { label: "Experience", desc: "Fight aliens, collect loot, explore sectors" },
  { label: "Unlock Traits", desc: "Earn unique abilities through actions" },
  { label: "Grow Intel", desc: "Intelligence score increases with learning" },
  { label: "Go Legendary", desc: "Max level hero with peak stats" },
  { label: "Create Legacy", desc: "Retire to pass knowledge to next generation" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "Core Gameplay", color: "#22d3ee", items: ["Hero hatching from cryo pods", "Autonomous AI navigation", "Alien combat system", "Wallet integration"] },
  { phase: "Phase 2", title: "Marketplace", color: "#a78bfa", items: ["Hero NFT trading", "Equipment & cosmetics shop", "Cryo pod sales", "Auction system"] },
  { phase: "Phase 3", title: "Legacy System", color: "#f472b6", items: ["Hero retirement mechanics", "Trait inheritance", "Memory preservation", "Generational bonuses"] },
  { phase: "Phase 4", title: "Bloodlines", color: "#fbbf24", items: ["Family tree visualization", "Bloodline stat tracking", "Cross-generation traits", "Hall of lineages"] },
  { phase: "Phase 5", title: "AI Evolution", color: "#ef4444", items: ["Deep learning integration", "Personality emergence", "Emergent strategies", "Tournament mode"] },
];

// ── Section: Hero ──

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-transparent to-purple-900/10" />
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />

      {/* Animated alien planet */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-cyan-900/10 to-purple-900/10 border border-white/[0.03] animate-[spin_60s_linear_infinite]" />

      {/* Floating elements */}
      <div className="absolute top-[15%] left-[10%] animate-float hidden md:block" style={{ animationDelay: "0s" }}><PixelCryoPod rarity="Rare" size={64} /></div>
      <div className="absolute top-[25%] right-[12%] animate-float hidden md:block" style={{ animationDelay: "1.5s" }}><PixelHero type="Marine" size={64} /></div>
      <div className="absolute bottom-[25%] left-[15%] animate-float hidden md:block" style={{ animationDelay: "0.8s" }}><PixelAlien size={48} /></div>
      <div className="absolute bottom-[20%] right-[18%] animate-float hidden md:block" style={{ animationDelay: "2.2s" }}><PixelCryoPod rarity="Legendary" size={56} /></div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <RevealSection>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-mono text-cyan-400 border border-cyan-500/20 rounded-full bg-white/[0.03] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            0G Galileo Testnet — Chain ID: 16602 — Autonomous AI
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              0GBomber
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 font-light mb-2 tracking-wide">
            AI-Powered Autonomous Colony Survival
          </p>
          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Deploy AI heroes from cryo pods. Watch them learn, evolve, build bloodlines
            <br className="hidden md:block" />
            and earn rewards on the 0G blockchain.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/game"
              className="group relative px-8 py-3.5 text-base font-bold text-white rounded-xl overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 group-hover:from-cyan-500 group-hover:to-purple-500 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(34,211,238,0.3)]" />
              <span className="relative z-10">Play Now</span>
            </Link>
            <Link
              href="#features"
              className="px-8 py-3.5 text-base font-bold text-gray-300 border border-white/10 rounded-xl hover:border-cyan-500/40 hover:text-cyan-300 transition-all duration-300 bg-white/[0.02] backdrop-blur-sm"
            >
              View Whitepaper
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 md:gap-10 text-xs text-gray-500 font-mono flex-wrap">
            {["$0BOMB Token", "7 Hero Classes", "6 Rarities", "AI DNA", "Legacy System"].map(s => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400/50" />
                {s}
              </span>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

// ── Section: Features ──

function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              CORE MECHANICS
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Game Features
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <RevealSection key={f.title}>
              <GlassCard className="p-6 md:p-8 h-full">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Gameplay Showcase ──

function GameplaySection() {
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              GAMEPLAY
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GAMEPLAY_PANELS.map((p, i) => (
            <RevealSection key={p.title}>
              <GlassCard className={`p-6 md:p-8 ${i % 2 === 0 ? "md:col-span-1" : "md:col-span-1"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <PixelItem type={["bomb", "shield", "heart", "star"][i]} size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Cryo Pods ──

function CryoPodsSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              CRYO TECHNOLOGY
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Cryo Pods
              </span>
            </h2>
            <p className="text-gray-500">Each pod contains a unique hero waiting to be deployed.</p>
          </div>
        </RevealSection>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PODS.map((pod, i) => (
            <RevealSection key={pod.name}>
              <GlassCard className={`p-6 text-center group`}>
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-28 mx-auto flex items-center justify-center">
                    <PixelCryoPod rarity={pod.name} size={72} />
                  </div>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: pod.color, opacity: 0.1 }} />
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: pod.color }}>{pod.name}</h3>
                <div className="w-12 h-0.5 mx-auto mb-2 rounded-full" style={{ background: pod.color, opacity: 0.4 }} />
                <p className="text-xs text-gray-500">{pod.desc}</p>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Hero Classes ──

function HeroClassesSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              HERO ROSTER
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Hero Classes
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {CLASSES.map((c, i) => (
            <RevealSection key={c.name}>
              <GlassCard className="p-4 md:p-6 text-center group h-full">
                <div className="relative mb-3 inline-block">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/[0.06] group-hover:border-white/20 transition-all duration-300">
                    <PixelHero type={c.name} size={48} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ background: c.color }} />
                </div>
                <h3 className="text-sm font-bold mb-1" style={{ color: c.color }}>{c.name}</h3>
                <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed">{c.desc}</p>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: AI Evolution ──

function EvolutionSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              ARTIFICIAL INTELLIGENCE
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Evolution
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="relative">
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-purple-500/40 to-transparent -translate-x-1/2" />
          {EVOLUTION_STEPS.map((step, i) => (
            <RevealSection key={step.label}>
              <div className={`relative flex items-start gap-6 mb-12 md:mb-16 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  <GlassCard className="p-5 inline-block">
                    <div className="text-xs font-mono text-cyan-400 mb-1">0x{(i + 1).toString(16).padStart(2, "0")}</div>
                    <h3 className="text-base font-bold text-white mb-1">{step.label}</h3>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </GlassCard>
                </div>
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-[#0a0a1a] border-2 border-cyan-400/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="flex-1 hidden md:block" />
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Token ──

function TokenSection() {
  const utilities = ["Marketplace", "Gacha", "Upgrades", "Trading", "Rewards"];
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="max-w-4xl mx-auto text-center">
        <RevealSection>
          <div className="inline-block text-xs font-mono text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
            TOKENOMICS
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              $0BOMB
            </span>
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            The native currency of the 0GBomber universe. Earn it, spend it, trade it.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {utilities.map(u => (
              <span key={u} className="px-4 py-2 text-sm font-mono text-gray-400 border border-white/[0.06] rounded-full bg-white/[0.02] hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-300">
                {u}
              </span>
            ))}
          </div>
          <GlassCard className="inline-block p-6 text-left font-mono text-sm">
            <div className="text-cyan-400 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Token Contract
            </div>
            <div className="text-gray-300 break-all">0xB9Ca501a3e59716F328552C7BA26d1fa68Dc76E6</div>
            <div className="text-gray-600 mt-2">Chain: 0G Galileo Testnet • Chain ID: 16602</div>
          </GlassCard>
        </RevealSection>
      </div>
    </section>
  );
}

// ── Section: Marketplace ──

function MarketplaceSection() {
  const items = [
    { name: "Hero NFT", type: "bomb", price: "250 $0BOMB", rarity: "Rare" },
    { name: "Equipment", type: "shield", price: "100 $0BOMB", rarity: "Epic" },
    { name: "Cosmetics", type: "star", price: "75 $0BOMB", rarity: "Legendary" },
    { name: "Cryo Pod", type: "heart", price: "500 $0BOMB", rarity: "Genesis" },
  ];
  const rarityColors: Record<string, string> = { Common: "#9ca3af", Rare: "#22d3ee", Epic: "#a78bfa", Legendary: "#fbbf24", Genesis: "#ef4444" };
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent" />
      <div className="max-w-6xl mx-auto relative z-10">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              MARKETPLACE
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <RevealSection key={item.name}>
              <GlassCard className="p-5 text-center group">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-white/[0.02] rounded-xl border border-white/[0.06] group-hover:border-white/20 transition-all">
                  <PixelItem type={item.type} size={36} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                <div className="text-xs font-mono mb-2" style={{ color: rarityColors[item.rarity] }}>{item.rarity}</div>
                <div className="text-xs text-cyan-400 font-mono">{item.price}</div>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Roadmap ──

function RoadmapSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <RevealSection>
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-mono text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              ROADMAP
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Development Roadmap
              </span>
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {ROADMAP.map((phase, i) => (
            <RevealSection key={phase.phase}>
              <GlassCard className="p-5 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: phase.color }} />
                  <span className="text-xs font-mono" style={{ color: phase.color }}>{phase.phase}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-3">{phase.title}</h3>
                <ul className="space-y-2">
                  {phase.items.map(item => (
                    <li key={item} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-cyan-400/60 mt-0.5">▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Leaderboard ──

function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState(0);
  const categories = ["Top Heroes", "Top Bloodlines", "Top Farmers"];

  useEffect(() => {
    async function load() {
      if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { fetchGlobalLeaderboard } = await import("@/lib/supabase/leaderboard");
        const global = await fetchGlobalLeaderboard();
        if (global.length > 0) {
          setEntries(global.map((e, i) => ({
            rank: i + 1,
            address: e.address,
            username: e.address.slice(0, 6) + "..." + e.address.slice(-4),
            kills: e.totalKills,
            score: e.totalLevel * 100,
            heroes: e.heroCount,
            legendaryCount: e.legendaryCount,
            topHeroName: "Hero",
          })));
          return;
        }
      }
      const data = getGlobalLeaderboard();
      setEntries(data);
    }
    load();
  }, []);

  const sorted = [...entries];
  if (tab === 0) sorted.sort((a, b) => b.kills - a.kills || b.score - a.score);
  else if (tab === 1) sorted.sort((a, b) => b.legendaryCount - a.legendaryCount || b.kills - a.kills);
  else sorted.sort((a, b) => b.score - a.score || b.kills - a.kills);
  const top = sorted.slice(0, 10).map((e, i) => ({ ...e, rank: i + 1 }));

  return (
    <section className="py-24 md:py-32 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <RevealSection>
          <div className="text-center mb-12">
            <div className="inline-block text-xs font-mono text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full mb-4 bg-white/[0.02]">
              HALL OF FAME
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h2>
          </div>
        </RevealSection>
        <RevealSection>
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((c, i) => (
              <button key={c} onClick={() => setTab(i)} className={`px-4 py-1.5 text-xs font-mono border rounded-full transition-all cursor-pointer ${tab === i ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10" : "border-white/[0.06] text-gray-400 bg-white/[0.02] hover:border-cyan-500/30 hover:text-cyan-400"}`}>
                {c}
              </button>
            ))}
          </div>
          <GlassCard className="overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-mono text-gray-600">
                <span>RANK</span><span>ADDRESS</span><span>USERNAME</span><span>KILLS</span><span>SCORE</span>
              </div>
              {top.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500 text-sm font-mono">
                  No data yet. Play the game to appear on the leaderboard.
                </div>
              )}
              {top.map((entry, i) => (
                <div key={entry.address} className="grid grid-cols-5 gap-4 px-6 py-3.5 text-sm hover:bg-white/[0.02] transition-colors items-center">
                  <span className={`font-mono ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-500"}`}>
                    #{entry.rank}
                  </span>
                  <span className="text-gray-500 font-mono text-xs truncate">{entry.address}</span>
                  <div>
                    <span className="text-white">{entry.username}</span>
                    <span className="text-xs text-gray-600 ml-2">{entry.heroes}h{entry.legendaryCount > 0 ? `, ${entry.legendaryCount}leg` : ""}</span>
                  </div>
                  <span className="text-gray-400 font-mono">{entry.kills.toLocaleString()}</span>
                  <span className="text-cyan-400 font-mono">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </RevealSection>
      </div>
    </section>
  );
}

// ── Footer ──

function FooterSection() {
  const socials = ["Twitter / X", "Discord", "GitHub", "Telegram", "Medium"];
  return (
    <footer className="border-t border-white/[0.04] py-16 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/5 pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">0GBomber</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
              AI-Native Autonomous Bomber Game on 0G Galileo Testnet.
              Deploy heroes, fight aliens, build bloodlines.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">Game</h4>
            <ul className="space-y-2">
              {["Play", "Heroes", "Inventory", "Market"].map(l => (
                <li key={l}><Link href={`/${l.toLowerCase()}`} className="text-xs text-gray-600 hover:text-cyan-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">Community</h4>
            <ul className="space-y-2">
              {socials.map(s => (
                <li key={s}><span className="text-xs text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">{s}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              {["Whitepaper", "Docs", "FAQ", "Terms"].map(l => (
                <li key={l}><span className="text-xs text-gray-600 hover:text-cyan-400 transition-colors cursor-pointer">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.04]">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} 0GBomber. Built on 0G Galileo Testnet.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Chain ID: 16602</span>
            <span>✦</span>
            <span>$0BOMB</span>
            <span>✦</span>
            <span>AI-Native</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──

export default function LandingPage() {
  return (
    <div className="relative">
      <ParticleField />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <GameplaySection />
        <CryoPodsSection />
        <HeroClassesSection />
        <EvolutionSection />
        <TokenSection />
        <MarketplaceSection />
        <RoadmapSection />
        <LeaderboardSection />
        <FooterSection />
      </div>
    </div>
  );
}

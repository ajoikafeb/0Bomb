"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/lib/admin/useAdmin";

const NAV_ITEMS: { label: string; href: string; icon: string; group: string }[] = [
  { label: "Overview", href: "/admin", icon: "📊", group: "Core" },
  { label: "Players", href: "/admin/players", icon: "👥", group: "Core" },
  { label: "Heroes", href: "/admin/heroes", icon: "👤", group: "Management" },
  { label: "Inventory", href: "/admin/inventory", icon: "🎒", group: "Management" },
  { label: "Economy", href: "/admin/economy", icon: "💰", group: "Economy" },
  { label: "Marketplace", href: "/admin/marketplace", icon: "🏪", group: "Economy" },
  { label: "Maps", href: "/admin/maps", icon: "🗺️", group: "Content" },
  { label: "Drop Rates", href: "/admin/drop-rates", icon: "📦", group: "Content" },
  { label: "AI", href: "/admin/ai", icon: "🧠", group: "Intelligence" },
  { label: "Giveaway", href: "/admin/giveaway", icon: "🎁", group: "Community" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔", group: "Core" },
  { label: "Blockchain", href: "/admin/blockchain", icon: "⛓️", group: "Infrastructure" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈", group: "Data" },
  { label: "Logs", href: "/admin/logs", icon: "📋", group: "Data" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️", group: "Infrastructure" },
];

const GROUPS = [...new Set(NAV_ITEMS.map(n => n.group))];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  return (
    <div className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${collapsed ? "w-14" : "w-52"}`}>
      <div className="h-full bg-dark-1/95 backdrop-blur-lg border-r border-white/[0.06] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
          {!collapsed && (
            <Link href="/admin" className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              0GAdmin
            </Link>
          )}
          <button onClick={onToggle} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />}
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 space-y-3 px-1">
          {GROUPS.map(group => (
            <div key={group}>
              {!collapsed && (
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest px-3 py-1">{group}</div>
              )}
              {NAV_ITEMS.filter(n => n.group === group).map(item => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg transition-all my-0.5 ${
                      active
                        ? "bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
                    } ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}>
                    <span className="text-sm">{item.icon}</span>
                    {!collapsed && <span className="font-mono text-[11px] truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        {!collapsed && (
          <div className="p-3 border-t border-white/[0.06]">
            <Link href="/game" className="text-[10px] text-gray-600 hover:text-cyan-400 font-mono transition-colors flex items-center gap-1">
              <span>←</span> Back to Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TopBar({ collapsed }: { collapsed: boolean }) {
  const { address } = useAdmin();
  return (
    <div className={`fixed top-0 right-0 h-11 bg-dark-1/80 backdrop-blur-lg border-b border-white/[0.06] flex items-center justify-end px-4 gap-4 z-40 transition-all duration-300 ${collapsed ? "left-14" : "left-52"}`}>
      <div className="flex items-center gap-3 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400">Server OK</span>
        </div>
        <div className="px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-gray-400">
          Chain: 16602
        </div>
        {address && (
          <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isConnected, address } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyan-400 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 text-sm">Connect your wallet to access the Admin Dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-6xl mb-4">403</h1>
          <h2 className="text-xl font-bold text-red-400 mb-2">Unauthorized</h2>
          <p className="text-gray-400 text-sm">Access denied. This dashboard is restricted to the super admin wallet.</p>
          <p className="text-xs text-gray-600 mt-2 font-mono">{address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-1">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar collapsed={collapsed} />
      <div className={`transition-all duration-300 pt-11 ${collapsed ? "ml-14" : "ml-52"}`}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

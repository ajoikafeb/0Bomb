"use client";

export function StatCard({ label, value, color = "cyan", icon, suffix, trend }: {
  label: string; value: string | number; color?: string; icon?: string; suffix?: string; trend?: "up" | "down" | "neutral";
}) {
  const colors: Record<string, string> = {
    cyan: "#22d3ee", yellow: "#facc15", green: "#4ade80",
    purple: "#c084fc", pink: "#f472b6", orange: "#fb923c",
    red: "#f87171", blue: "#60a5fa", white: "#e2e8f0",
  };
  const c = colors[color] || colors.cyan;
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-dark-2/60 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 hover:border-cyan-500/20 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{label}</span>
          {icon && <span className="text-xs">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono" style={{ color: c }}>{value}</span>
          {suffix && <span className="text-[10px] text-gray-500">{suffix}</span>}
        </div>
        {trend && (
          <div className={`mt-1 text-[9px] font-mono ${trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-500"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export function GlassCard({ children, className = "", title, action }: {
  children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`relative bg-dark-2/40 backdrop-blur-sm border border-white/[0.06] rounded-xl p-5 ${className}`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function DataTable({ headers, rows, onRowClick }: {
  headers: { key: string; label: string; render?: (v: any) => React.ReactNode }[];
  rows: Record<string, any>[];
  onRowClick?: (row: Record<string, any>) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map(h => (
              <th key={h.key} className="text-[10px] font-mono text-gray-500 uppercase tracking-wider py-3 px-3">{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)}
              className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
              {headers.map(h => (
                <td key={h.key} className="py-2.5 px-3 text-xs text-gray-300 font-mono">
                  {h.render ? h.render(row[h.key]) : row[h.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} className="py-8 text-center text-xs text-gray-600">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/[0.04] rounded ${className}`} />
  );
}

export function AdminSearchBar({ value, onChange, placeholder = "Search..." }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-xs text-gray-300 font-mono placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none transition-colors" />
    </div>
  );
}

export function Badge({ children, color = "cyan" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  const cls = colors[color] || colors.cyan;
  return (
    <span className={`inline-flex px-2 py-0.5 text-[9px] font-mono border rounded-full ${cls}`}>
      {children}
    </span>
  );
}

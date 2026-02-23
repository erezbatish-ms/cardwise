import { NavLink } from "react-router-dom";
import type { AuthUser } from "../../lib/api";

interface SidebarProps {
  onLogout: () => void;
  user: AuthUser | null;
}

const navItems = [
  { to: "/", label: "לוח בקרה", icon: "📊" },
  { to: "/transactions", label: "עסקאות", icon: "📋" },
  { to: "/scrape", label: "סריקת נתונים", icon: "🔄" },
];

export function Sidebar({ onLogout, user }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-l border-gray-100 bg-white/80 backdrop-blur-sm shadow-card">
      {/* Brand header */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-600 px-5 py-5">
        <h1 className="text-xl font-bold text-white">💳 CardWise</h1>
        <p className="mt-0.5 text-xs text-blue-100">ניתוח חכם של הוצאות</p>
      </div>

      {/* User profile */}
      {user && (
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white ring-2 ring-white shadow-sm">
              {user.displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-gray-800">{user.displayName}</div>
            <div className="truncate text-xs text-gray-400">{user.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="התנתק"
          >
            🚪
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-l from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout footer */}
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
        >
          🚪 התנתק
        </button>
      </div>
    </aside>
  );
}

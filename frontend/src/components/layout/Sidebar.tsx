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
    <aside className="flex w-64 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-blue-600">💳 CardWise</h1>
      </div>

      {user && (
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-8 w-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
              {user.displayName.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">{user.displayName}</div>
            <div className="truncate text-xs text-gray-500">{user.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            title="התנתק"
          >
            🚪
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          🚪 התנתק
        </button>
      </div>
    </aside>
  );
}

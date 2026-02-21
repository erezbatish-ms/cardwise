import { NavLink } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
}

const navItems = [
  { to: "/", label: "לוח בקרה", icon: "📊" },
  { to: "/transactions", label: "עסקאות", icon: "📋" },
  { to: "/scrape", label: "סריקת נתונים", icon: "🔄" },
];

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-blue-600">💳 CardWise</h1>
      </div>

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
          className="w-full rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          🚪 התנתק
        </button>
      </div>
    </aside>
  );
}

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Trash2,
  FileText,
  Settings,
  ChefHat
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Waste Log", href: "/waste", icon: Trash2 },
  { name: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-full">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border bg-sidebar-primary">
        <ChefHat className="h-6 w-6 text-sidebar-primary-foreground mr-3" />
        <span className="font-semibold text-sidebar-primary-foreground tracking-tight">
          FoodInventory
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = item.name === "Dashboard"; // Static for placeholder
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/settings"
          className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
          Settings
        </Link>
      </div>
    </aside>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext";
import {
  LayoutDashboard,
  Wifi,
  Building2,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import baktiLogo from "@/assets/bakti-komdigi-logo.png";
import {Boxes} from "lucide-react";

const menuItems = [
  { title: "Overview", path: "/", icon: LayoutDashboard },
  { title: "Akses Internet", path: "/akses-internet", icon: Wifi },
  { title: "Program Konektivitas Mandiri", path: "/bumdes", icon: Building2 },
  { title: "Notifikasi", path: "/notifikasi", icon: Bell },
  { title: "Cluster", path: "/cluster", icon: Boxes },
];

export function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const { pathname } = useLocation();
  const { unreadCount } = useNotification();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
    {/* Logo */}
    <div
      className={cn(
        "border-b border-sidebar-border px-4 py-4",
        collapsed ? "flex justify-center" : "flex flex-col items-start"
      )}
    >
      <Link to="/" className="w-full">
        <img
          src={baktiLogo}
          alt="BAKTI KOMDIGI"
          className={cn(
            "object-contain transition-all cursor-pointer",
            collapsed ? "h-10 w-10 mx-auto" : "h-14 w-auto max-w-[180px]"
          )}
        />
      </Link>

      {!collapsed && (
        <p className="mt-2 text-[13px] leading-tight font-semibold text-muted-foreground">
          Wilayah Kerja IV Surabaya
        </p>
      )}
    </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <p
          className={cn(
            "mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground",
            collapsed && "sr-only"
          )}
        >
          Menu
        </p>

        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* ICON + BADGE */}
                <div className="relative">
                  <item.icon className="h-5 w-5 shrink-0" />

                  {/* 🔴 BADGE ANGKA */}
                  {item.title === "Notifikasi" && unreadCount > 0 && (
                    <span
                      className={cn(
                        "absolute -top-2 -right-3 min-w-[16px] h-[16px] px-[4px] flex items-center justify-center rounded-full text-[10px] font-bold text-white bg-red-500",
                        collapsed && "-top-1 -right-1 text-[8px] h-[14px] min-w-[14px]"
                      )}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {!collapsed && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            © 2026 BAKTI KOMDIGI
          </p>
        )}
      </div>
    </aside>
  );
}
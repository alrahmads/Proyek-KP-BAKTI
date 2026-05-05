import { createContext, useContext, useState, useEffect } from "react";
import { useAllBumdesData } from "@/hooks/useData";

type Notification = {
  id: number;
  title: string;
  desc: string;
  isRead: boolean;
  bumdesId: number;
  type: "error" | "warning";
};

const NotificationContext = createContext<any>(null);

export function NotificationProvider({ children }: any) {
  const data = useAllBumdesData();

  // ✅ ambil dari localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ generate notif dari data
  useEffect(() => {
    if (!data || data.length === 0) return;

    const generated: Notification[] = data
      .filter((b) => ["Expired", "Warning"].includes(b.warningLevel))
      .map((b) => ({
        id: b.no,
        bumdesId: b.no,
        title: `${b.namaBumdes} — ${b.warningLevel}`,
        desc:
          b.daysLeft !== null
            ? b.daysLeft < 0
              ? `Expired ${Math.abs(b.daysLeft)} hari lalu`
              : `${b.daysLeft} hari lagi`
            : "Perlu pengecekan masa kontrak",
        type: b.warningLevel === "Expired" ? "error" : "warning",
        isRead: false,
      }));

    // ✅ merge (biar read ga hilang)
    setNotifications((prev) => {
      return generated.map((g) => {
        const existing = prev.find((p) => p.id === g.id);
        return existing ? existing : g;
      });
    });
  }, [data]);

  // ✅ simpan ke localStorage tiap update
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // ✅ mark satu
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  // ✅ mark semua
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
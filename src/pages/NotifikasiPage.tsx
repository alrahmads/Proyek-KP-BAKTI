import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function NotifikasiPage() {
  const navigate = useNavigate();

  const { notifications, markAsRead, markAllAsRead } = useNotification();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotif =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <p className="text-sm text-muted-foreground">
              Peringatan dan notifikasi sistem
            </p>
          </div>

          {/* 🔥 MARK ALL */}
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs px-3 py-1 rounded-md bg-muted hover:bg-muted/70"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* FILTER */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1 text-sm rounded-md",
                filter === "all" ? "bg-primary text-white" : "bg-muted"
              )}
            >
              Semua
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-3 py-1 text-sm rounded-md",
                filter === "unread" ? "bg-primary text-white" : "bg-muted"
              )}
            >
              Belum Dibaca
            </button>
          </div>
        )}

        {/* EMPTY */}
        {filteredNotif.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <p className="font-medium">
                {filter === "unread"
                  ? "Tidak ada notifikasi baru"
                  : "Tidak ada notifikasi"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotif.map((n) => (
              <Card
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  navigate(`/bumdes?highlight=${n.bumdesId}`);
                }}
                className={cn(
                  "border-0 shadow-sm cursor-pointer transition hover:scale-[1.01]",
                  n.type === "error" && "border-l-4 border-l-destructive",
                  n.type === "warning" && "border-l-4 border-l-warning",
                  !n.isRead && "bg-red-50"
                )}
              >
                <CardContent className="flex items-start gap-3 py-4">
                  <Bell
                    className={cn(
                      "h-5 w-5 mt-0.5",
                      n.type === "error"
                        ? "text-destructive"
                        : "text-warning"
                    )}
                  />

                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.desc}
                    </p>

                    {!n.isRead && (
                      <span className="text-[10px] text-red-500 font-semibold">
                        ● Belum dibaca
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
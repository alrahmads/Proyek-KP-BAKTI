import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  changeLabel?: string;
  variant?: "primary" | "accent" | "secondary" | "warning";
  subtitle?: string;
  className?: string;
}

const variantStyles = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  secondary: "bg-secondary text-primary",
  warning: "bg-warning/10 text-warning",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  variant = "primary",
  subtitle,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group h-full",
        className
      )}
    >
      <CardContent className="flex items-center gap-4 p-5 h-full">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
            variantStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>

          <p className="text-2xl font-extrabold tracking-tight">
            {typeof value === "number"
              ? value.toLocaleString("id-ID")
              : value}
          </p>

          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-semibold",
                change >= 0
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}

              {change >= 0 ? "+" : ""}
              {Math.abs(change)}%
              {changeLabel || "vs tahun lalu"}
            </div>
          )}

          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
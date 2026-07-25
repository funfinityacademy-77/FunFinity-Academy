import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminThemeProviderProps {
  children: ReactNode;
  variant?: "default" | "compact" | "expanded";
}

/**
 * Admin Theme Provider
 * Provides consistent theming for admin pages with proper integration
 * with the global theme system
 */
export default function AdminThemeProvider({
  children,
  variant = "default",
}: AdminThemeProviderProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        variant === "compact" && "admin-compact",
        variant === "expanded" && "admin-expanded"
      )}
    >
      {children}
    </div>
  );
}

/**
 * Admin Card Component with Theme Integration
 */
export function AdminCard({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card text-card-foreground shadow-sm",
        variant === "elevated" && "shadow-lg border-border/30",
        variant === "bordered" && "border-2 border-border/50",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Admin Header with Theme Integration
 */
export function AdminHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border/30 bg-secondary/5 px-6 py-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * Admin Section with Theme Integration
 */
export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Admin Stats Card with Theme Integration
 */
export function AdminStatsCard({
  label,
  value,
  change,
  trend,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change && (
        <p
          className={cn(
            "text-xs mt-2",
            trend === "up" && "text-green-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}

/**
 * Admin Table with Theme Integration
 */
export function AdminTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/50 overflow-hidden", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

export function AdminTableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-secondary/30 border-b border-border/30", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-border/30 hover:bg-secondary/30 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

/**
 * Admin Badge with Theme Integration
 */
export function AdminBadge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Admin Status Indicator with Theme Integration
 */
export function AdminStatus({
  status,
  label,
}: {
  status: "online" | "offline" | "busy" | "away";
  label: string;
}) {
  const colors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-amber-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={cn("w-2 h-2 rounded-full", colors[status])} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

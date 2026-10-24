/**
 * Shared BK PERFORMANCE PRO presentation primitives.
 *
 * These wrap the shadcn primitives with the design system's shape, casing and
 * motion rules so pages do not repeat long className overrides.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

/** Large pill action button — the app's primary tap target. */
export function ActionButton({
  className,
  tone = "primary",
  ...props
}: ComponentProps<typeof Button> & { tone?: "primary" | "outline" }) {
  return (
    <Button
      className={cn(
        "min-h-14 w-full rounded-2xl px-6 font-display text-base font-semibold uppercase tracking-wide transition-smooth active:scale-[0.98]",
        tone === "primary" &&
          "bg-gradient-primary text-primary-foreground shadow-action hover:brightness-110",
        tone === "outline" &&
          "border-primary/40 bg-card text-foreground hover:border-primary hover:bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

/** Telemetry card: hairline electric-blue rule, uppercase label, mono value. */
export function TelemetryCard({
  className,
  children,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "relative gap-3 overflow-hidden rounded-2xl border-border bg-gradient-surface p-4 shadow-card md:p-6",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] bg-gradient-primary"
      />
      {children}
    </Card>
  );
}

/** Uppercase micro-label used above every metric value. */
export function TelemetryLabel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn("label-telemetry", className)}>{children}</span>;
}

/** Oversized monospace metric value. */
export function TelemetryValue({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-mono text-3xl font-bold tabular-nums text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status badge tinted by device health. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: "success" | "warning" | "destructive" | "neutral";
  children: ReactNode;
  className?: string;
}) {
  const toneClass = {
    success: "border-success/40 bg-success/15 text-success",
    warning: "border-warning/40 bg-warning/15 text-warning",
    destructive: "border-destructive/40 bg-destructive/15 text-destructive",
    neutral: "border-border bg-muted text-muted-foreground",
  }[tone];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        toneClass,
        className,
      )}
    >
      {children}
    </Badge>
  );
}

/** Section heading with an optional description. */
export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

/** Explicit unavailable state for metrics the browser cannot provide. */
export function UnavailableState({
  reason,
  className,
}: {
  reason: string;
  className?: string;
}) {
  return (
    <div
      data-ocid="metric.unavailable_state"
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {reason}
    </div>
  );
}

/**
 * Shared application shell: sticky header with the BK PERFORMANCE PRO
 * wordmark, a navigation that reaches every screen, and an attribution footer.
 */

import { SignInButton } from "@/components/InternetIdentity";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Cpu,
  Gamepad2,
  Gauge,
  Home,
  Layers,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/optimization", label: "Otimizar", icon: Cpu },
  { to: "/sensi", label: "Sensi", icon: SlidersHorizontal },
  { to: "/monitor", label: "Monitor", icon: Gauge },
  { to: "/games", label: "Jogos", icon: Gamepad2 },
  { to: "/profiles", label: "Perfis", icon: Layers },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const attributionUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-gradient-header backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
              BK PERFORMANCE <span className="text-gradient-primary">PRO</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="relative hidden size-2.5 rounded-full bg-success sm:block"
            >
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success" />
            </span>
            <SignInButton className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-fast hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60" />
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          data-ocid="nav.primary"
          className="mx-auto w-full max-w-5xl overflow-x-auto px-2 pb-2 md:px-6"
        >
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    data-ocid={`nav.${item.to === "/" ? "home" : item.to.slice(1)}_link`}
                    activeOptions={{ exact: item.to === "/" }}
                    className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-fast hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    activeProps={{
                      className:
                        "bg-primary/15 text-primary border border-primary/30",
                    }}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground md:px-6">
          <p className="font-display font-semibold uppercase tracking-[0.14em] text-foreground">
            BK PERFORMANCE PRO
          </p>
          <p>
            Otimização, sensibilidade e monitoramento para Free Fire. Valores
            indisponíveis são sempre informados — nunca inventados.
          </p>
          <a
            href={attributionUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded text-muted-foreground underline-offset-4 transition-fast hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

/** Consistent page container with entrance animation. */
export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-up space-y-6 md:space-y-8", className)}
      data-ocid="page"
    >
      {children}
    </div>
  );
}

import type { backendInterface } from "@/backend";
import { Layout } from "@/components/Layout";
import GamesPage from "@/pages/GamesPage";
import HomePage from "@/pages/HomePage";
import MonitorPage from "@/pages/MonitorPage";
import OptimizationPage from "@/pages/OptimizationPage";
import ProfilesPage from "@/pages/ProfilesPage";
import SensiGeneratorPage from "@/pages/SensiGeneratorPage";
import SensiResultPage from "@/pages/SensiResultPage";
import SettingsPage from "@/pages/SettingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

/**
 * Characterization of the app shell and the routes the sensi/monitor work
 * keeps. The three affected pages are intentionally being replaced, so this
 * only protects the navigation contract and that each route still mounts.
 */

const NAV_LABELS = [
  "Início",
  "Otimizar",
  "Sensi",
  "Monitor",
  "Jogos",
  "Perfis",
  "Ajustes",
];

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

async function renderShell() {
  const rootRoute = createRootRoute({
    component: () => (
      <Layout>
        <div data-testid="outlet" />
      </Layout>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  renderWithProviders(<RouterProvider router={router} />);
  await screen.findByRole("navigation", { name: "Navegação principal" });
}

async function renderRoute(
  path: string,
  component: () => ReactElement,
  actor?: Pick<backendInterface, "generateSensitivity">,
) {
  const rootRoute = createRootRoute({ component });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  if (actor) {
    renderWithActor(<RouterProvider router={router} />, actor);
  } else {
    renderWithProviders(<RouterProvider router={router} />);
  }
  await screen.findByTestId("page");
}

describe("app shell navigation", () => {
  it("shows the BK PERFORMANCE PRO wordmark", async () => {
    await renderShell();
    const wordmarks = screen.getAllByTestId("nav.home_link");
    expect(
      wordmarks.some((el) => /BK PERFORMANCE/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("reaches every screen from the primary navigation", async () => {
    await renderShell();
    const nav = screen.getByRole("navigation", {
      name: "Navegação principal",
    });
    for (const label of NAV_LABELS) {
      expect(nav).toHaveTextContent(label);
    }
  });

  it("links the Sensi and Monitor entries to their routes", async () => {
    await renderShell();
    expect(screen.getByTestId("nav.sensi_link")).toHaveAttribute(
      "href",
      "/sensi",
    );
    expect(screen.getByTestId("nav.monitor_link")).toHaveAttribute(
      "href",
      "/monitor",
    );
  });
});

describe("affected routes still mount", () => {
  it("mounts the monitor route", async () => {
    await renderRoute("/monitor", MonitorPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the sensi generator route", async () => {
    await renderRoute("/sensi", SensiGeneratorPage, {
      generateSensitivity: vi.fn(),
    });
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the sensi result route", async () => {
    await renderRoute("/sensi/resultado", SensiResultPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });
});

describe("the other screens keep working", () => {
  it("mounts the home route", async () => {
    await renderRoute("/", HomePage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the optimization route", async () => {
    await renderRoute("/optimization", OptimizationPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the games route", async () => {
    await renderRoute("/games", GamesPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the profiles route", async () => {
    await renderRoute("/profiles", ProfilesPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("mounts the settings route", async () => {
    await renderRoute("/settings", SettingsPage);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });
});

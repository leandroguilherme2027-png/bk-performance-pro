import { Layout } from "@/components/Layout";
import GamesPage from "@/pages/GamesPage";
import HomePage from "@/pages/HomePage";
import MonitorPage from "@/pages/MonitorPage";
import OptimizationPage from "@/pages/OptimizationPage";
import ProfilesPage from "@/pages/ProfilesPage";
import SensiGeneratorPage from "@/pages/SensiGeneratorPage";
import SensiResultPage from "@/pages/SensiResultPage";
import SettingsPage from "@/pages/SettingsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const optimizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/optimization",
  component: OptimizationPage,
});

const sensiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sensi",
  component: SensiGeneratorPage,
});

const sensiResultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sensi/resultado",
  component: SensiResultPage,
});

const monitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/monitor",
  component: MonitorPage,
});

const gamesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games",
  component: GamesPage,
});

const profilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profiles",
  component: ProfilesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  optimizationRoute,
  sensiRoute,
  sensiResultRoute,
  monitorRoute,
  gamesRoute,
  profilesRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

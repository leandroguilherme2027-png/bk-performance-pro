import { renderWithActor } from "@/__tests__/test-utils";
import type { GeneratedSensitivity, backendInterface } from "@/backend";
import { DpiMode, SensitivityType } from "@/backend";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SensiGeneratorPage from "./SensiGeneratorPage";
import SensiResultPage from "./SensiResultPage";

/**
 * Edge paths of the sensi generator that the main flow test does not pin:
 * a brand with no preset models requires a manual model, a backend failure
 * surfaces an error without navigating, and a SEM DPI result shows no DPI
 * number while stating the sensi is without DPI.
 */

const RESULT: GeneratedSensitivity = {
  dpi: 480n,
  values: {
    general: 104n,
    redDot: 98n,
    scope2x: 94n,
    scope4x: 88n,
    awmScope: 82n,
    freeLook: 118n,
  },
};

function makeActor(
  generateSensitivity: backendInterface["generateSensitivity"],
) {
  return { generateSensitivity } satisfies Pick<
    backendInterface,
    "generateSensitivity"
  >;
}

function renderGenerator(actor: Pick<backendInterface, "generateSensitivity">) {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <Outlet />
      </div>
    ),
  });
  const sensiRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sensi",
    component: SensiGeneratorPage,
  });
  const resultRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sensi/resultado",
    component: SensiResultPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([sensiRoute, resultRoute]),
    history: createMemoryHistory({ initialEntries: ["/sensi"] }),
  });
  const rendered = renderWithActor(<RouterProvider router={router} />, actor);
  return { ...rendered, router };
}

describe("SensiGeneratorPage manual model", () => {
  it("requires a manually typed model for a brand with no preset models", async () => {
    const generateSensitivity = vi.fn().mockResolvedValue(RESULT);
    const user = userEvent.setup();
    renderGenerator(makeActor(generateSensitivity));
    await screen.findByTestId("sensi.brand.select");

    // "Outras marcas" has no preset models, so the manual field is required.
    await user.click(screen.getByTestId("sensi.brand.outras"));
    const manual = await screen.findByTestId("sensi.model.manual_input");

    await user.click(screen.getByTestId("sensi.dpi.without"));
    await user.click(screen.getByTestId("sensi.level.high"));
    // No model typed yet: GERAR SENSI stays disabled.
    expect(screen.getByTestId("sensi.generate_button")).toBeDisabled();

    await user.type(manual, "Meu Aparelho X");
    expect(screen.getByTestId("sensi.generate_button")).toBeEnabled();

    await user.click(screen.getByTestId("sensi.generate_button"));

    await waitFor(() => {
      expect(generateSensitivity).toHaveBeenCalledWith({
        brand: "Outras marcas",
        model: "Meu Aparelho X",
        dpiMode: DpiMode.withoutDpi,
        dpi: undefined,
        sensitivityType: SensitivityType.high,
      });
    });
  });
});

describe("SensiGeneratorPage error path", () => {
  it("shows an error and stays on the form when generation fails", async () => {
    const generateSensitivity = vi
      .fn()
      .mockRejectedValue(new Error("Serviço indisponível"));
    const user = userEvent.setup();
    const { router } = renderGenerator(makeActor(generateSensitivity));
    await screen.findByTestId("sensi.brand.select");

    await user.click(screen.getByTestId("sensi.brand.samsung"));
    await user.click(await screen.findByTestId("sensi.model.item.7"));
    await user.click(screen.getByTestId("sensi.dpi.with"));
    await user.type(screen.getByTestId("sensi.dpi.input"), "480");
    await user.click(screen.getByTestId("sensi.level.high"));
    await user.click(screen.getByTestId("sensi.generate_button"));

    const error = await screen.findByTestId("sensi.error_state");
    expect(error).toHaveTextContent("Não foi possível gerar a sensi.");
    expect(error).toHaveTextContent("Serviço indisponível");
    // The user is not sent to the result screen on failure.
    expect(router.state.location.pathname).toBe("/sensi");
    expect(
      screen.queryByTestId("sensi_result.values_card"),
    ).not.toBeInTheDocument();
  });
});

describe("SensiResultPage without DPI", () => {
  it("shows no DPI number and states the sensi is without DPI", async () => {
    const rootRoute = createRootRoute({
      component: () => (
        <div>
          <Outlet />
        </div>
      ),
    });
    const resultRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/sensi/resultado",
      component: SensiResultPage,
    });
    const history = createMemoryHistory({
      initialEntries: ["/sensi/resultado"],
    });
    history.push("/sensi/resultado", {
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: DpiMode.withoutDpi,
      dpi: null,
      sensitivityType: SensitivityType.low,
      result: { values: RESULT.values } satisfies GeneratedSensitivity,
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([resultRoute]),
      history,
    });
    renderWithActor(<RouterProvider router={router} />, makeActor(vi.fn()));

    const dpiCard = await screen.findByTestId("sensi_result.dpi_card");
    expect(dpiCard).toHaveTextContent("Sem DPI");
    // The backend echoed no DPI, so no number is invented in the DPI card.
    expect(dpiCard).not.toHaveTextContent("480");
    // The six values are still shown.
    expect(screen.getByTestId("sensi_result.values_card")).toBeInTheDocument();
  });
});

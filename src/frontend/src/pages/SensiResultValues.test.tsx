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
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SensiResultState } from "./SensiGeneratorPage";
import SensiResultPage from "./SensiResultPage";

/**
 * The result screen must show the actual six values, the highlighted button
 * number (Geral) and the DPI number — not just the card shells. This pins the
 * numbers the user reads and copies, so a regression that renders placeholders
 * or swaps axes fails here.
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

function makeActor() {
  return { generateSensitivity: vi.fn() } satisfies Pick<
    backendInterface,
    "generateSensitivity"
  >;
}

function renderResult(state: SensiResultState) {
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
  const history = createMemoryHistory({ initialEntries: ["/sensi/resultado"] });
  history.push("/sensi/resultado", state);
  const router = createRouter({
    routeTree: rootRoute.addChildren([resultRoute]),
    history,
  });
  return renderWithActor(<RouterProvider router={router} />, makeActor());
}

describe("SensiResultPage values", () => {
  it("renders the six values with their real numbers and the highlighted button number and DPI", async () => {
    renderResult({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: DpiMode.current,
      dpi: 480,
      sensitivityType: SensitivityType.high,
      result: RESULT,
    });

    await screen.findByTestId("sensi_result.values_card");

    const expected: Array<[string, string]> = [
      ["general", "104"],
      ["redDot", "98"],
      ["scope2x", "94"],
      ["scope4x", "88"],
      ["scopeAWM", "82"],
      ["lookAround", "118"],
    ];
    for (const [key, value] of expected) {
      expect(screen.getByTestId(`sensi_result.value.${key}`)).toHaveTextContent(
        value,
      );
    }

    // The button number (Geral) and the DPI are highlighted with their numbers.
    expect(screen.getByTestId("sensi_result.general_card")).toHaveTextContent(
      "104",
    );
    expect(screen.getByTestId("sensi_result.dpi_card")).toHaveTextContent(
      "480",
    );
  });

  it("shows the DPI echoed by the backend when the router state carries none", async () => {
    renderResult({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: DpiMode.current,
      dpi: null,
      sensitivityType: SensitivityType.high,
      result: RESULT,
    });

    const dpiCard = await screen.findByTestId("sensi_result.dpi_card");
    expect(dpiCard).toHaveTextContent("480");
    expect(dpiCard).not.toHaveTextContent("Sem DPI");
  });
});

import { renderWithActor } from "@/__tests__/test-utils";
import type { GeneratedSensitivity, backendInterface } from "@/backend";
import { DpiMode, SensitivityType } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SensiGeneratorPage, {
  type SensiResultState,
} from "./SensiGeneratorPage";
import SensiResultPage from "./SensiResultPage";

/**
 * Gerador de Sensi: the form gates GERAR SENSI on device + DPI mode + level,
 * calls the backend generation service, and the result screen shows the six
 * values plus the button number and DPI. SEM DPI produces a result with no DPI
 * number and says the sensi is without DPI.
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

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId("sensi.brand.samsung"));
  await user.click(await screen.findByTestId("sensi.model.item.7"));
  await user.click(screen.getByTestId("sensi.dpi.with"));
  await user.type(screen.getByTestId("sensi.dpi.input"), "480");
  await user.click(screen.getByTestId("sensi.level.high"));
}

describe("SensiGeneratorPage", () => {
  it("shows the device, DPI and level controls with GERAR SENSI disabled until all are chosen", async () => {
    const user = userEvent.setup();
    renderGenerator(makeActor(vi.fn()));
    await screen.findByTestId("sensi.brand.select");

    expect(screen.getByTestId("sensi.brand.select")).toBeInTheDocument();
    expect(screen.getByTestId("sensi.dpi.with")).toBeInTheDocument();
    expect(screen.getByTestId("sensi.dpi.without")).toBeInTheDocument();
    expect(screen.getByTestId("sensi.level.high")).toBeInTheDocument();
    expect(screen.getByTestId("sensi.level.low")).toBeInTheDocument();

    const generate = screen.getByTestId("sensi.generate_button");
    expect(generate).toBeDisabled();

    await user.click(screen.getByTestId("sensi.brand.samsung"));
    expect(generate).toBeDisabled();

    await user.click(await screen.findByTestId("sensi.model.item.7"));
    expect(generate).toBeDisabled();

    await user.click(screen.getByTestId("sensi.dpi.with"));
    expect(generate).toBeDisabled();

    await user.type(screen.getByTestId("sensi.dpi.input"), "480");
    expect(generate).toBeDisabled();

    await user.click(screen.getByTestId("sensi.level.high"));
    expect(generate).toBeEnabled();
  });

  it("generates a sensi with DPI and shows the six values, button number and DPI", async () => {
    const generateSensitivity = vi.fn().mockResolvedValue(RESULT);
    const user = userEvent.setup();
    renderGenerator(makeActor(generateSensitivity));
    await screen.findByTestId("sensi.brand.select");

    await fillForm(user);
    await user.click(screen.getByTestId("sensi.generate_button"));

    await waitFor(() => {
      expect(generateSensitivity).toHaveBeenCalledTimes(1);
    });
    expect(generateSensitivity).toHaveBeenCalledWith({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: DpiMode.current,
      dpi: 480n,
      sensitivityType: SensitivityType.high,
    });

    expect(
      await screen.findByTestId("sensi_result.general_card"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("sensi_result.dpi_card")).toHaveTextContent(
      "480",
    );
    for (const key of [
      "general",
      "redDot",
      "scope2x",
      "scope4x",
      "scopeAWM",
      "lookAround",
    ]) {
      expect(
        screen.getByTestId(`sensi_result.value.${key}`),
      ).toBeInTheDocument();
    }
  });

  it("shows a DPI validation error and keeps GERAR SENSI disabled for a non-positive DPI", async () => {
    const user = userEvent.setup();
    renderGenerator(makeActor(vi.fn()));
    await screen.findByTestId("sensi.brand.select");

    await user.click(screen.getByTestId("sensi.brand.samsung"));
    await user.click(await screen.findByTestId("sensi.model.item.7"));
    await user.click(screen.getByTestId("sensi.dpi.with"));
    await user.type(screen.getByTestId("sensi.dpi.input"), "0");
    await user.click(screen.getByTestId("sensi.level.high"));

    expect(screen.getByTestId("sensi.dpi.error_state")).toHaveTextContent(
      "Informe um número de DPI maior que zero.",
    );
    expect(screen.getByTestId("sensi.generate_button")).toBeDisabled();
  });

  it("generates a sensi without DPI and reports that it is without DPI", async () => {
    const generateSensitivity = vi.fn().mockResolvedValue({
      values: RESULT.values,
    } satisfies GeneratedSensitivity);
    const user = userEvent.setup();
    renderGenerator(makeActor(generateSensitivity));
    await screen.findByTestId("sensi.brand.select");

    await user.click(screen.getByTestId("sensi.brand.samsung"));
    await user.click(await screen.findByTestId("sensi.model.item.7"));
    await user.click(screen.getByTestId("sensi.dpi.without"));
    await user.click(screen.getByTestId("sensi.level.low"));
    await user.click(screen.getByTestId("sensi.generate_button"));

    await waitFor(() => {
      expect(generateSensitivity).toHaveBeenCalledWith({
        brand: "Samsung",
        model: "Galaxy A54",
        dpiMode: DpiMode.withoutDpi,
        dpi: undefined,
        sensitivityType: SensitivityType.low,
      });
    });

    const dpiCard = await screen.findByTestId("sensi_result.dpi_card");
    expect(dpiCard).toHaveTextContent("Sem DPI");
  });
});

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
  const history = createMemoryHistory({
    initialEntries: ["/sensi/resultado"],
  });
  history.push("/sensi/resultado", state);
  const router = createRouter({
    routeTree: rootRoute.addChildren([resultRoute]),
    history,
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

/**
 * Both routes in one router so GERAR OUTRA SENSI can navigate from the result
 * back to the generator and the restored form can be asserted.
 */
function renderResultAndGenerator(
  state: SensiResultState,
  actor: Pick<backendInterface, "generateSensitivity">,
) {
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
  const history = createMemoryHistory({
    initialEntries: ["/sensi/resultado"],
  });
  history.push("/sensi/resultado", state);
  const router = createRouter({
    routeTree: rootRoute.addChildren([sensiRoute, resultRoute]),
    history,
  });
  const rendered = renderWithActor(<RouterProvider router={router} />, actor);
  return { ...rendered, router };
}

describe("SensiResultPage", () => {
  it("shows the empty state with a way back to the generator when no result exists", async () => {
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
    const router = createRouter({
      routeTree: rootRoute.addChildren([resultRoute]),
      history: createMemoryHistory({ initialEntries: ["/sensi/resultado"] }),
    });
    renderWithActor(<RouterProvider router={router} />, makeActor(vi.fn()));

    expect(
      await screen.findByTestId("sensi_result.empty_state"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("sensi_result.back_to_generator_button"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("sensi_result.values_card"),
    ).not.toBeInTheDocument();
  });

  it("copies the six values and the DPI to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderResult({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: DpiMode.current,
      dpi: 480,
      sensitivityType: SensitivityType.high,
      result: RESULT,
    });
    await screen.findByTestId("sensi_result.copy_button");

    fireEvent.click(screen.getByTestId("sensi_result.copy_button"));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });
    const text = writeText.mock.calls[0][0] as string;
    expect(text).toContain("Geral: 104");
    expect(text).toContain("Ponto vermelho: 98");
    expect(text).toContain("Mira 2x: 94");
    expect(text).toContain("Mira 4x: 88");
    expect(text).toContain("Mira AWM: 82");
    expect(text).toContain("Olhadinha: 118");
    expect(text).toContain("DPI recomendado: 480");
    expect(
      await screen.findByTestId("sensi_result.success_state"),
    ).toBeInTheDocument();
  });

  it("returns to the generator with the previous choices restored", async () => {
    const user = userEvent.setup();
    const { router } = renderResultAndGenerator(
      {
        brand: "Samsung",
        model: "Galaxy A54",
        dpiMode: DpiMode.current,
        dpi: 480,
        sensitivityType: SensitivityType.high,
        result: RESULT,
      },
      makeActor(vi.fn()),
    );
    await screen.findByTestId("sensi_result.regenerate_button");

    await user.click(screen.getByTestId("sensi_result.regenerate_button"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/sensi");
    });
    await screen.findByTestId("sensi.brand.select");

    // Brand, model, DPI mode, DPI value and level are all restored.
    expect(screen.getByTestId("sensi.brand.samsung")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("sensi.model.search_input")).toHaveValue(
      "Galaxy A54",
    );
    expect(screen.getByTestId("sensi.dpi.input")).toHaveValue(480);
    expect(screen.getByTestId("sensi.level.high")).toBeInTheDocument();
    // The restored form is complete, so GERAR SENSI is enabled again.
    expect(screen.getByTestId("sensi.generate_button")).toBeEnabled();
  });
});

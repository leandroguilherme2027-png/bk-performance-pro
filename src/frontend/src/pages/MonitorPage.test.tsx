import { renderWithActor } from "@/__tests__/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import MonitorPage from "./MonitorPage";

/**
 * Monitor de desempenho: starts OFF, ATIVAR MONITOR mounts the live telemetry
 * reader, DESATIVAR MONITOR returns to the initial state. Metrics the browser
 * cannot provide must show the exact unavailable reason and never a number.
 */

const UNAVAILABLE_REASON = "Dado não disponível neste dispositivo";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MonitorPage", () => {
  it("starts disabled with the ATIVAR MONITOR button visible", () => {
    renderWithActor(<MonitorPage />, {});

    expect(screen.getByText("Monitor desativado")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ativar monitor/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("monitor.live_panel")).not.toBeInTheDocument();
  });

  it("activates monitoring and shows the metric cards, then deactivates back to the initial state", async () => {
    const user = userEvent.setup();
    renderWithActor(<MonitorPage />, {});

    await user.click(screen.getByRole("button", { name: /ativar monitor/i }));

    expect(await screen.findByTestId("monitor.live_panel")).toBeInTheDocument();
    expect(screen.getByTestId("monitor.fps_card")).toBeInTheDocument();
    expect(screen.getByTestId("monitor.battery_card")).toBeInTheDocument();
    expect(screen.getByTestId("monitor.memory_card")).toBeInTheDocument();
    expect(screen.getByTestId("monitor.storage_card")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /desativar monitor/i }),
    );

    expect(screen.getByText("Monitor desativado")).toBeInTheDocument();
    expect(screen.queryByTestId("monitor.live_panel")).not.toBeInTheDocument();
  });

  it("shows the exact unavailable reason and no invented number when the browser exposes no metrics", async () => {
    const user = userEvent.setup();
    renderWithActor(<MonitorPage />, {});

    await user.click(screen.getByRole("button", { name: /ativar monitor/i }));
    await screen.findByTestId("monitor.live_panel");

    const unavailable = await screen.findAllByText(UNAVAILABLE_REASON);
    expect(unavailable.length).toBeGreaterThanOrEqual(4);
    // No fabricated numeric reading is rendered for the unavailable metrics.
    expect(screen.queryByText(/\d+%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ GB/)).not.toBeInTheDocument();
  });

  it("renders a real battery reading when the Battery Status API is present", async () => {
    const manager = new EventTarget() as EventTarget & {
      level: number;
      charging: boolean;
    };
    manager.level = 0.5;
    manager.charging = true;
    vi.stubGlobal("navigator", {
      ...navigator,
      getBattery: () => Promise.resolve(manager),
    });

    const user = userEvent.setup();
    renderWithActor(<MonitorPage />, {});
    await user.click(screen.getByRole("button", { name: /ativar monitor/i }));

    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument();
    });
  });
});

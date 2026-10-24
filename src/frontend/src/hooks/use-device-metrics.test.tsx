import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatBytes, useDeviceMetrics } from "./use-device-metrics";

const UNAVAILABLE_REASON = "Dado não disponível neste dispositivo";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useDeviceMetrics", () => {
  it("reports every metric as unavailable with a reason when the browser exposes nothing", () => {
    const { result } = renderHook(() => useDeviceMetrics());

    for (const reading of [
      result.current.battery,
      result.current.memory,
      result.current.storage,
      result.current.fps,
    ]) {
      expect(reading.available).toBe(false);
      expect(reading.value).toBeNull();
      expect(reading.reason).toBe(UNAVAILABLE_REASON);
    }
  });

  it("never fabricates a numeric value while a metric is unavailable", () => {
    const { result } = renderHook(() => useDeviceMetrics());
    expect(result.current.battery.value).toBeNull();
    expect(result.current.memory.value).toBeNull();
    expect(result.current.storage.value).toBeNull();
    expect(result.current.fps.value).toBeNull();
  });

  it("reads device memory when the Device Memory API is present", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      deviceMemory: 4,
    });

    const { result } = renderHook(() => useDeviceMetrics());

    await waitFor(() => {
      expect(result.current.memory.available).toBe(true);
    });
    expect(result.current.memory.value).toEqual({ deviceMemoryGb: 4 });
  });

  it("reads battery level and charging state when the Battery Status API is present", async () => {
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

    const { result } = renderHook(() => useDeviceMetrics());

    await waitFor(() => {
      expect(result.current.battery.available).toBe(true);
    });
    expect(result.current.battery.value).toEqual({ level: 50, charging: true });
  });

  it("falls back to unavailable when the battery promise rejects", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      getBattery: () => Promise.reject(new Error("denied")),
    });

    const { result } = renderHook(() => useDeviceMetrics());

    await waitFor(() => {
      expect(result.current.battery.available).toBe(false);
    });
    expect(result.current.battery.reason).toBe(UNAVAILABLE_REASON);
  });
});

describe("formatBytes", () => {
  it("formats byte counts into readable units", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
  });
});

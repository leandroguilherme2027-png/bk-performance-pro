/**
 * Device metrics read from browser APIs only.
 *
 * The web platform exposes a limited subset of device telemetry. Every metric
 * here reports an explicit unavailable state with a reason when the browser
 * does not provide it. Values are never fabricated: if a reading is missing,
 * `available` is false and `value` is null.
 */

import { useEffect, useRef, useState } from "react";

export interface MetricReading<T> {
  available: boolean;
  value: T | null;
  /** Why the metric is unavailable, shown to the user. */
  reason?: string;
}

export interface DeviceMetrics {
  battery: MetricReading<{ level: number; charging: boolean }>;
  memory: MetricReading<{ deviceMemoryGb: number }>;
  storage: MetricReading<{ usageBytes: number; quotaBytes: number }>;
  fps: MetricReading<{ fps: number }>;
}

const UNAVAILABLE_BATTERY: MetricReading<{ level: number; charging: boolean }> =
  {
    available: false,
    value: null,
    reason: "Dado não disponível neste dispositivo",
  };

const UNAVAILABLE_MEMORY: MetricReading<{ deviceMemoryGb: number }> = {
  available: false,
  value: null,
  reason: "Dado não disponível neste dispositivo",
};

const UNAVAILABLE_STORAGE: MetricReading<{
  usageBytes: number;
  quotaBytes: number;
}> = {
  available: false,
  value: null,
  reason: "Dado não disponível neste dispositivo",
};

const UNAVAILABLE_FPS: MetricReading<{ fps: number }> = {
  available: false,
  value: null,
  reason: "Dado não disponível neste dispositivo",
};

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}

interface NavigatorWithExtras extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
  deviceMemory?: number;
}

/**
 * Read battery level and charging state, device memory, storage estimate, and
 * a frame-timing based FPS estimate while the screen is open.
 */
export function useDeviceMetrics(): DeviceMetrics {
  const [battery, setBattery] =
    useState<MetricReading<{ level: number; charging: boolean }>>(
      UNAVAILABLE_BATTERY,
    );
  const [memory, setMemory] =
    useState<MetricReading<{ deviceMemoryGb: number }>>(UNAVAILABLE_MEMORY);
  const [storage, setStorage] =
    useState<MetricReading<{ usageBytes: number; quotaBytes: number }>>(
      UNAVAILABLE_STORAGE,
    );
  const [fps, setFps] =
    useState<MetricReading<{ fps: number }>>(UNAVAILABLE_FPS);

  // Battery: Battery Status API (Chromium-based browsers).
  useEffect(() => {
    const nav = navigator as NavigatorWithExtras;
    if (typeof nav.getBattery !== "function") {
      setBattery(UNAVAILABLE_BATTERY);
      return;
    }
    let manager: BatteryManagerLike | null = null;
    let cancelled = false;

    const update = () => {
      if (!manager || cancelled) return;
      setBattery({
        available: true,
        value: {
          level: Math.round(manager.level * 100),
          charging: manager.charging,
        },
      });
    };

    nav
      .getBattery()
      .then((batteryManager) => {
        if (cancelled) return;
        manager = batteryManager;
        update();
        manager.addEventListener("levelchange", update);
        manager.addEventListener("chargingchange", update);
      })
      .catch(() => {
        if (!cancelled) setBattery(UNAVAILABLE_BATTERY);
      });

    return () => {
      cancelled = true;
      if (manager) {
        manager.removeEventListener("levelchange", update);
        manager.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  // Memory: Device Memory API (Chromium-based browsers).
  useEffect(() => {
    const nav = navigator as NavigatorWithExtras;
    if (typeof nav.deviceMemory !== "number") {
      setMemory(UNAVAILABLE_MEMORY);
      return;
    }
    setMemory({
      available: true,
      value: { deviceMemoryGb: nav.deviceMemory },
    });
  }, []);

  // Storage: StorageManager estimate.
  useEffect(() => {
    if (typeof navigator.storage?.estimate !== "function") {
      setStorage(UNAVAILABLE_STORAGE);
      return;
    }
    let cancelled = false;
    navigator.storage
      .estimate()
      .then((estimate) => {
        if (cancelled) return;
        if (
          typeof estimate.usage !== "number" ||
          typeof estimate.quota !== "number"
        ) {
          setStorage(UNAVAILABLE_STORAGE);
          return;
        }
        setStorage({
          available: true,
          value: { usageBytes: estimate.usage, quotaBytes: estimate.quota },
        });
      })
      .catch(() => {
        if (!cancelled) setStorage(UNAVAILABLE_STORAGE);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // FPS: frame-timing estimate while the screen is open.
  const frameCount = useRef(0);
  useEffect(() => {
    if (typeof requestAnimationFrame !== "function") {
      setFps(UNAVAILABLE_FPS);
      return;
    }
    let rafId = 0;
    let lastSample = performance.now();
    let frames = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      frames += 1;
      frameCount.current = frames;
      const elapsed = now - lastSample;
      if (elapsed >= 1000) {
        const measured = Math.round((frames * 1000) / elapsed);
        setFps({ available: true, value: { fps: measured } });
        frames = 0;
        lastSample = now;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { battery, memory, storage, fps };
}

/** Format a byte count as a short human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

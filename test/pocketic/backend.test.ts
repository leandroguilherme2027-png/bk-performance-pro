import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";
import { registerCaller } from "./test-utils";

/**
 * Real-canister coverage for the sensitivity generator and the sensitivity
 * profile store. The frontend suite mocks the actor, so this is the only lane
 * that proves the public methods do not trap and return the accepted shape.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  await pic?.tearDown();
});

describe("generateSensitivity", () => {
  it("returns six in-range values for a high sensitivity with DPI", async () => {
    const result = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { current: null },
      dpi: [480n],
      sensitivityType: { high: null },
    });

    expect(result.dpi).toEqual([480n]);
    const values = result.values;
    for (const value of [
      values.general,
      values.redDot,
      values.scope2x,
      values.scope4x,
      values.awmScope,
      values.freeLook,
    ]) {
      expect(value).toBeGreaterThanOrEqual(0n);
      expect(value).toBeLessThanOrEqual(200n);
    }
    expect(values.general).toBeGreaterThan(values.redDot);
    expect(values.redDot).toBeGreaterThan(values.scope2x);
    expect(values.scope2x).toBeGreaterThan(values.scope4x);
    expect(values.scope4x).toBeGreaterThan(values.awmScope);
    expect(values.freeLook).toBeGreaterThan(values.general);
  });

  it("recommends 480 DPI in recommended mode", async () => {
    const result = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { recommended: null },
      dpi: [],
      sensitivityType: { high: null },
    });
    expect(result.dpi).toEqual([480n]);
  });

  it("returns no DPI in withoutDpi mode", async () => {
    const result = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { withoutDpi: null },
      dpi: [],
      sensitivityType: { low: null },
    });
    expect(result.dpi).toEqual([]);
  });

  it("does not invent a DPI in current mode when none was supplied", async () => {
    const result = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { current: null },
      dpi: [],
      sensitivityType: { high: null },
    });
    expect(result.dpi).toEqual([]);
  });

  it("raises the whole set for high sensitivity versus low", async () => {
    const high = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { withoutDpi: null },
      dpi: [],
      sensitivityType: { high: null },
    });
    const low = await actor.generateSensitivity({
      brand: "Samsung",
      model: "Galaxy A54",
      dpiMode: { withoutDpi: null },
      dpi: [],
      sensitivityType: { low: null },
    });
    expect(high.values.general).toBeGreaterThan(low.values.general);
  });
});

describe("sensitivity profiles", () => {
  it("starts empty for a fresh caller", async () => {
    const alice = createIdentity("alice");
    const aliceActor = await registerCaller(
      pic!.createActor<_SERVICE>(idlFactory, canisterId),
      alice,
    );
    await expect(aliceActor.listSensitivityProfiles()).resolves.toEqual([]);
  });

  it("round-trips a saved sensitivity profile through the real canister", async () => {
    const alice = createIdentity("alice");
    const aliceActor = await registerCaller(
      pic!.createActor<_SERVICE>(idlFactory, canisterId),
      alice,
    );

    const saved = await aliceActor.saveSensitivityProfile({
      gameId: 1n,
      brand: "Samsung",
      model: "Galaxy A54",
      sensitivityType: { high: null },
      dpiMode: { current: null },
      dpi: [480n],
      playStyle: { balanced: null },
      fingerMode: { three: null },
      values: {
        general: 104n,
        redDot: 98n,
        scope2x: 94n,
        scope4x: 88n,
        awmScope: 82n,
        freeLook: 118n,
      },
    });

    expect(saved.brand).toBe("Samsung");
    expect(saved.dpi).toEqual([480n]);

    const listed = await aliceActor.listSensitivityProfiles();
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      id: saved.id,
      brand: "Samsung",
      model: "Galaxy A54",
    });
  });

  it("updates a saved sensitivity profile and reports not-found for a missing id", async () => {
    const carol = createIdentity("carol");
    const aliceActor = await registerCaller(
      pic!.createActor<_SERVICE>(idlFactory, canisterId),
      carol,
    );

    const saved = await aliceActor.saveSensitivityProfile({
      gameId: 1n,
      brand: "Samsung",
      model: "Galaxy A54",
      sensitivityType: { high: null },
      dpiMode: { current: null },
      dpi: [480n],
      playStyle: { balanced: null },
      fingerMode: { three: null },
      values: {
        general: 104n,
        redDot: 98n,
        scope2x: 94n,
        scope4x: 88n,
        awmScope: 82n,
        freeLook: 118n,
      },
    });

    const updated = await aliceActor.updateSensitivityProfile({
      id: saved.id,
      brand: "Xiaomi",
      model: "Redmi Note 12",
      sensitivityType: { low: null },
      dpiMode: { withoutDpi: null },
      dpi: [],
      playStyle: { precision: null },
      fingerMode: { four: null },
      values: {
        general: 62n,
        redDot: 56n,
        scope2x: 52n,
        scope4x: 46n,
        awmScope: 40n,
        freeLook: 76n,
      },
    });

    // `?SensitivityProfile` decodes as `[] | [T]` in the declarations.
    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({
      id: saved.id,
      brand: "Xiaomi",
      model: "Redmi Note 12",
    });
    expect(updated[0].dpi).toEqual([]);

    const listed = await aliceActor.listSensitivityProfiles();
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({ id: saved.id, brand: "Xiaomi" });

    await expect(
      aliceActor.updateSensitivityProfile({
        id: 9999n,
        brand: "Samsung",
        model: "Galaxy A54",
        sensitivityType: { high: null },
        dpiMode: { current: null },
        dpi: [480n],
        playStyle: { balanced: null },
        fingerMode: { three: null },
        values: {
          general: 104n,
          redDot: 98n,
          scope2x: 94n,
          scope4x: 88n,
          awmScope: 82n,
          freeLook: 118n,
        },
      }),
    ).resolves.toEqual([]);
  });

  it("deletes a saved sensitivity profile and reports false for a missing id", async () => {
    const dave = createIdentity("dave");
    const aliceActor = await registerCaller(
      pic!.createActor<_SERVICE>(idlFactory, canisterId),
      dave,
    );

    const saved = await aliceActor.saveSensitivityProfile({
      gameId: 1n,
      brand: "Samsung",
      model: "Galaxy A54",
      sensitivityType: { high: null },
      dpiMode: { current: null },
      dpi: [480n],
      playStyle: { balanced: null },
      fingerMode: { three: null },
      values: {
        general: 104n,
        redDot: 98n,
        scope2x: 94n,
        scope4x: 88n,
        awmScope: 82n,
        freeLook: 118n,
      },
    });

    await expect(
      aliceActor.deleteSensitivityProfile({ id: saved.id }),
    ).resolves.toBe(true);
    await expect(aliceActor.listSensitivityProfiles()).resolves.toEqual([]);
    await expect(
      aliceActor.deleteSensitivityProfile({ id: saved.id }),
    ).resolves.toBe(false);
  });

  it("does not show one caller's sensitivity profiles to another", async () => {
    const bob = createIdentity("bob");
    const bobActor = await registerCaller(
      pic!.createActor<_SERVICE>(idlFactory, canisterId),
      bob,
    );
    await expect(bobActor.listSensitivityProfiles()).resolves.toEqual([]);
  });
});

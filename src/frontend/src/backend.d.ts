import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AppliedState {
    appliedAt?: Timestamp;
    applied: boolean;
}
export interface ApplyOptimizationProfileRequest {
    id: OptimizationProfileId;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface CreateGameRequest {
    name: string;
    isBuiltIn: boolean;
    packageId?: string;
}
export interface DeleteOptimizationProfileRequest {
    id: OptimizationProfileId;
}
export interface DeleteSensitivityProfileRequest {
    id: SensitivityProfileId;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Game {
    id: GameId;
    name: string;
    createdAt: Timestamp;
    isBuiltIn: boolean;
    packageId?: string;
}
export type GameId = bigint;
export interface GenerateSensitivityRequest {
    dpi?: bigint;
    model: string;
    sensitivityType: SensitivityType;
    dpiMode: DpiMode;
    brand: string;
}
export interface GeneratedSensitivity {
    dpi?: bigint;
    values: SensitivityValues;
}
export interface GraphicsSettings {
    shadow: boolean;
    antiAliasing: boolean;
    frameRate: string;
    autoAdjustGraphics: boolean;
    graphicsQuality: string;
}
export interface OptimizationOption {
    key: string;
    title: string;
    enabled: boolean;
}
export interface OptimizationProfile {
    id: OptimizationProfileId;
    graphics: GraphicsSettings;
    previous?: PreviousState;
    createdAt: Timestamp;
    applied: AppliedState;
    gameId: GameId;
    updatedAt: Timestamp;
    options: Array<OptimizationOption>;
}
export type OptimizationProfileId = bigint;
export interface PreviousState {
    graphics: GraphicsSettings;
    capturedAt: Timestamp;
    options: Array<OptimizationOption>;
}
export interface RestoreOptimizationProfileRequest {
    id: OptimizationProfileId;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SaveOptimizationProfileRequest {
    graphics: GraphicsSettings;
    gameId: GameId;
    options: Array<OptimizationOption>;
}
export interface SaveSensitivityProfileRequest {
    dpi?: bigint;
    model: string;
    values: SensitivityValues;
    gameId: GameId;
    sensitivityType: SensitivityType;
    playStyle: PlayStyle;
    fingerMode: FingerMode;
    dpiMode: DpiMode;
    brand: string;
}
export interface SensitivityProfile {
    id: SensitivityProfileId;
    dpi?: bigint;
    model: string;
    createdAt: Timestamp;
    values: SensitivityValues;
    gameId: GameId;
    sensitivityType: SensitivityType;
    updatedAt: Timestamp;
    playStyle: PlayStyle;
    fingerMode: FingerMode;
    dpiMode: DpiMode;
    brand: string;
}
export type SensitivityProfileId = bigint;
export interface SensitivityValues {
    freeLook: bigint;
    scope2x: bigint;
    scope4x: bigint;
    awmScope: bigint;
    general: bigint;
    redDot: bigint;
}
export type Timestamp = bigint;
export interface UpdateGameRequest {
    id: GameId;
    name: string;
    isBuiltIn: boolean;
    packageId?: string;
}
export interface UpdateSensitivityProfileRequest {
    id: SensitivityProfileId;
    dpi?: bigint;
    model: string;
    values: SensitivityValues;
    sensitivityType: SensitivityType;
    playStyle: PlayStyle;
    fingerMode: FingerMode;
    dpiMode: DpiMode;
    brand: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum DpiMode {
    recommended = "recommended",
    withoutDpi = "withoutDpi",
    current = "current"
}
export enum FingerMode {
    two = "two",
    three = "three",
    custom = "custom",
    four = "four"
}
export enum PlayStyle {
    custom = "custom",
    precision = "precision",
    closeCombat = "closeCombat",
    dragScope = "dragScope",
    balanced = "balanced"
}
export enum SensitivityType {
    low = "low",
    custom = "custom",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Apply an optimization profile, capturing the previous state.
     */
    applyOptimizationProfile(request: ApplyOptimizationProfileRequest): Promise<OptimizationProfile | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a game for the caller.
     */
    createGame(request: CreateGameRequest): Promise<Game>;
    /**
     * / Delete one of the caller's games.
     */
    deleteGame(id: GameId): Promise<boolean>;
    /**
     * / Delete one of the caller's optimization profiles.
     */
    deleteOptimizationProfile(request: DeleteOptimizationProfileRequest): Promise<boolean>;
    /**
     * / Delete one of the caller's sensitivity profiles.
     */
    deleteSensitivityProfile(request: DeleteSensitivityProfileRequest): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Generate a Free Fire sensitivity from the chosen device, DPI mode and level.
     */
    generateSensitivity(request: GenerateSensitivityRequest): Promise<GeneratedSensitivity>;
    /**
     * / Return the backend's API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the caller's games.
     */
    listGames(): Promise<Array<Game>>;
    /**
     * / List the caller's optimization profiles.
     */
    listOptimizationProfiles(): Promise<Array<OptimizationProfile>>;
    /**
     * / List the caller's sensitivity profiles.
     */
    listSensitivityProfiles(): Promise<Array<SensitivityProfile>>;
    /**
     * / Restore the previous state of an optimization profile.
     */
    restoreOptimizationProfile(request: RestoreOptimizationProfileRequest): Promise<OptimizationProfile | null>;
    /**
     * / Save (create or replace) an optimization profile for the caller.
     */
    saveOptimizationProfile(request: SaveOptimizationProfileRequest): Promise<OptimizationProfile>;
    /**
     * / Save (create or replace) a sensitivity profile for the caller.
     */
    saveSensitivityProfile(request: SaveSensitivityProfileRequest): Promise<SensitivityProfile>;
    schema(): Promise<string>;
    /**
     * / Update one of the caller's games.
     */
    updateGame(request: UpdateGameRequest): Promise<Game | null>;
    /**
     * / Update one of the caller's sensitivity profiles.
     */
    updateSensitivityProfile(request: UpdateSensitivityProfileRequest): Promise<SensitivityProfile | null>;
}

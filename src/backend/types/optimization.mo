import Common "common";

module {
  public type Timestamp = Common.Timestamp;
  public type GameId = Common.GameId;
  public type OptimizationProfileId = Common.OptimizationProfileId;

  /// A single optimization option the user can toggle for a game.
  public type OptimizationOption = {
    /// Stable key identifying the option (e.g. "close_background_apps").
    key : Text;
    /// Human-readable title shown in the UI.
    title : Text;
    enabled : Bool;
  };

  /// Recommended graphics settings for the device/game.
  public type GraphicsSettings = {
    graphicsQuality : Text;
    frameRate : Text;
    shadow : Bool;
    antiAliasing : Bool;
    autoAdjustGraphics : Bool;
  };

  /// The applied state of an optimization profile.
  public type AppliedState = {
    applied : Bool;
    appliedAt : ?Timestamp;
  };

  /// Snapshot of the previous state, used by restore.
  public type PreviousState = {
    options : [OptimizationOption];
    graphics : GraphicsSettings;
    capturedAt : Timestamp;
  };

  /// A per-game optimization profile owned by a user.
  public type OptimizationProfile = {
    id : OptimizationProfileId;
    gameId : GameId;
    options : [OptimizationOption];
    graphics : GraphicsSettings;
    applied : AppliedState;
    /// Present only after the profile has been applied at least once.
    previous : ?PreviousState;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Input for saving (creating or replacing) an optimization profile.
  public type SaveOptimizationProfileRequest = {
    gameId : GameId;
    options : [OptimizationOption];
    graphics : GraphicsSettings;
  };

  /// Input for applying an optimization profile.
  public type ApplyOptimizationProfileRequest = {
    id : OptimizationProfileId;
  };

  /// Input for restoring the previous state of an optimization profile.
  public type RestoreOptimizationProfileRequest = {
    id : OptimizationProfileId;
  };

  /// Input for deleting an optimization profile.
  public type DeleteOptimizationProfileRequest = {
    id : OptimizationProfileId;
  };
};

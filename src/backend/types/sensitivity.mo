import Common "common";

module {
  public type Timestamp = Common.Timestamp;
  public type GameId = Common.GameId;
  public type SensitivityProfileId = Common.SensitivityProfileId;

  /// Sensitivity strength preset.
  public type SensitivityType = {
    #low;
    #medium;
    #high;
    #custom;
  };

  /// How DPI is handled for the generated sensitivity.
  public type DpiMode = {
    /// Keep the device's current DPI.
    #current;
    /// Generate a recommendation that includes a DPI value.
    #recommended;
    /// Generate sensitivity without changing DPI.
    #withoutDpi;
  };

  /// Preferred play style.
  public type PlayStyle = {
    #dragScope;
    #precision;
    #closeCombat;
    #balanced;
    #custom;
  };

  /// Number of fingers used to play.
  public type FingerMode = {
    #two;
    #three;
    #four;
    #custom;
  };

  /// The six Free Fire sensitivity values produced by the generator.
  public type SensitivityValues = {
    general : Nat;
    redDot : Nat;
    scope2x : Nat;
    scope4x : Nat;
    awmScope : Nat;
    freeLook : Nat;
  };

  /// A saved sensitivity profile owned by a user.
  public type SensitivityProfile = {
    id : SensitivityProfileId;
    gameId : GameId;
    brand : Text;
    model : Text;
    sensitivityType : SensitivityType;
    dpiMode : DpiMode;
    /// DPI value when known or recommended; null when not applicable.
    dpi : ?Nat;
    playStyle : PlayStyle;
    fingerMode : FingerMode;
    values : SensitivityValues;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Input for saving (creating or replacing) a sensitivity profile.
  public type SaveSensitivityProfileRequest = {
    gameId : GameId;
    brand : Text;
    model : Text;
    sensitivityType : SensitivityType;
    dpiMode : DpiMode;
    dpi : ?Nat;
    playStyle : PlayStyle;
    fingerMode : FingerMode;
    values : SensitivityValues;
  };

  /// Input for updating a sensitivity profile.
  public type UpdateSensitivityProfileRequest = {
    id : SensitivityProfileId;
    brand : Text;
    model : Text;
    sensitivityType : SensitivityType;
    dpiMode : DpiMode;
    dpi : ?Nat;
    playStyle : PlayStyle;
    fingerMode : FingerMode;
    values : SensitivityValues;
  };

  /// Input for deleting a sensitivity profile.
  public type DeleteSensitivityProfileRequest = {
    id : SensitivityProfileId;
  };

  /// Input for generating a sensitivity from a device, DPI mode and level.
  public type GenerateSensitivityRequest = {
    /// Device brand chosen by the user.
    brand : Text;
    /// Device model chosen by the user.
    model : Text;
    /// How DPI is handled: `#recommended` generates a DPI number,
    /// `#withoutDpi` generates without DPI, `#current` keeps the device DPI.
    dpiMode : DpiMode;
    /// DPI number supplied by the user when `dpiMode` is `#current`; null otherwise.
    dpi : ?Nat;
    /// Sensitivity level: `#high` for sensi alta, `#low` for sensi baixa.
    sensitivityType : SensitivityType;
  };

  /// Result of generating a sensitivity.
  public type GeneratedSensitivity = {
    /// The six Free Fire sensitivity values.
    values : SensitivityValues;
    /// DPI number used by the generation; null when generated without DPI.
    dpi : ?Nat;
  };
};

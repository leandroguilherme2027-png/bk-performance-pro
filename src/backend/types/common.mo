module {
  /// Nanosecond timestamp from `Time.now()` (signed Int).
  public type Timestamp = Int;

  /// Identifier for a stored game record.
  public type GameId = Nat;

  /// Identifier for a stored optimization profile.
  public type OptimizationProfileId = Nat;

  /// Identifier for a stored sensitivity profile.
  public type SensitivityProfileId = Nat;
};

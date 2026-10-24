import Common "common";

module {
  public type Timestamp = Common.Timestamp;
  public type GameId = Common.GameId;

  /// A game the user tracks for optimization.
  public type Game = {
    id : GameId;
    name : Text;
    /// Android package identifier when known; null for manually added games.
    packageId : ?Text;
    /// True for the built-in Free Fire / Free Fire MAX titles.
    isBuiltIn : Bool;
    createdAt : Timestamp;
  };

  /// Input for creating a game.
  public type CreateGameRequest = {
    name : Text;
    packageId : ?Text;
    isBuiltIn : Bool;
  };

  /// Input for updating a game.
  public type UpdateGameRequest = {
    id : GameId;
    name : Text;
    packageId : ?Text;
    isBuiltIn : Bool;
  };
};

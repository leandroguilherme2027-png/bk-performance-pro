import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/games";
import GamesLib "../lib/games";

mixin (
  games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
  nextGameId : { var value : Nat },
) {
  /// List the caller's games.
  public query ({ caller }) func listGames() : async [Types.Game] {
    GamesLib.listGames(games, caller);
  };

  /// Create a game for the caller.
  public shared ({ caller }) func createGame(request : Types.CreateGameRequest) : async Types.Game {
    GamesLib.createGame(games, nextGameId, caller, request);
  };

  /// Update one of the caller's games.
  public shared ({ caller }) func updateGame(request : Types.UpdateGameRequest) : async ?Types.Game {
    GamesLib.updateGame(games, caller, request);
  };

  /// Delete one of the caller's games.
  public shared ({ caller }) func deleteGame(id : Types.GameId) : async Bool {
    GamesLib.deleteGame(games, caller, id);
  };
};

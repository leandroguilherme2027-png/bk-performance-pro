import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/games";

module {
  /// Return the caller's games, newest first.
  public func listGames(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
    caller : Principal,
  ) : [Types.Game] {
    switch (games.get(caller)) {
      case (?owned) {
        let all = owned.values().toArray();
        all.sort(func (a, b) = if (a.createdAt > b.createdAt) { #less } else if (a.createdAt < b.createdAt) { #greater } else { #equal });
      };
      case null { [] };
    };
  };

  /// Create a game owned by the caller and return the stored record.
  public func createGame(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
    nextGameId : { var value : Nat },
    caller : Principal,
    request : Types.CreateGameRequest,
  ) : Types.Game {
    let id = nextGameId.value;
    nextGameId.value := id + 1;
    let game : Types.Game = {
      id;
      name = request.name;
      packageId = request.packageId;
      isBuiltIn = request.isBuiltIn;
      createdAt = Time.now();
    };
    let owned = switch (games.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Types.GameId, Types.Game>();
        games.add(caller, fresh);
        fresh;
      };
    };
    owned.add(id, game);
    game;
  };

  /// Update one of the caller's games; returns the updated record or null.
  public func updateGame(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
    caller : Principal,
    request : Types.UpdateGameRequest,
  ) : ?Types.Game {
    switch (games.get(caller)) {
      case (?owned) {
        switch (owned.get(request.id)) {
          case (?existing) {
            let updated : Types.Game = {
              id = existing.id;
              name = request.name;
              packageId = request.packageId;
              isBuiltIn = request.isBuiltIn;
              createdAt = existing.createdAt;
            };
            owned.add(request.id, updated);
            ?updated;
          };
          case null { null };
        };
      };
      case null { null };
    };
  };

  /// Delete one of the caller's games; returns whether a record was removed.
  public func deleteGame(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
    caller : Principal,
    id : Types.GameId,
  ) : Bool {
    switch (games.get(caller)) {
      case (?owned) {
        let existed = owned.get(id) != null;
        owned.remove(id);
        existed;
      };
      case null { false };
    };
  };
};

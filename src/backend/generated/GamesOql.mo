/// OQL adapter for the per-caller game store.
///
/// Storage shape is `Map<Principal, Map<GameId, Game>>`. The owner principal
/// lives in the OUTER map key, not in the stored record, so this adapter
/// flattens the nested map into `(Principal, Game)` rows and derives the
/// synthetic `owner` column from the outer key. The entity is scoped per user:
/// a signed-in caller reads only their own rows.

import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import Types "../types/games";

module {
  /// Flatten the nested per-caller map into `(owner, game)` rows.
  public func rows(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
  ) : Iter.Iter<(Principal, Types.Game)> {
    let buffer = List.empty<(Principal, Types.Game)>();
    for ((owner, owned) in games.entries()) {
      for ((_, game) in owned.entries()) {
        buffer.add((owner, game));
      };
    };
    buffer.values();
  };

  /// Build the queryable `game` entity declaration.
  public func entity(
    games : Map.Map<Principal, Map.Map<Types.GameId, Types.Game>>,
  ) : OQL.Decl {
    let sampleOwner = Principal.fromText("aaaaa-aa");
    let sampleGame : Types.Game = {
      id = 0;
      name = "";
      packageId = ?"";
      isBuiltIn = false;
      createdAt = 0;
    };

    OQL.Entity.manual<(Principal, Types.Game)>(
      "game",
      func () = rows(games),
      "Game",
      "id",
    )
      .sample((sampleOwner, sampleGame))
      .payload("id", func ((_, g)) = g.id)
      .payload("owner", func ((owner, _)) = owner)
      .payload("name", func ((_, g)) = g.name)
      .payload("packageId", func ((_, g)) = packageIdText(g.packageId))
      .payload("isBuiltIn", func ((_, g)) = g.isBuiltIn)
      .payload("createdAt", func ((_, g)) = g.createdAt)
      .ownedBy("owner")
      .scopedPerUser()
      .build();
  };

  /// Render the optional package identifier as text; empty string means unknown.
  func packageIdText(value : ?Text) : Text {
    switch (value) {
      case (?packageId) { packageId };
      case null { "" };
    };
  };
};

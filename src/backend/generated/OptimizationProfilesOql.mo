/// OQL adapter for the per-caller optimization profile store.
///
/// Storage shape is
/// `Map<Principal, Map<OptimizationProfileId, OptimizationProfile>>`. The owner
/// principal lives in the OUTER map key, not in the stored record, so this
/// adapter flattens the nested map into `(Principal, OptimizationProfile)` rows
/// and derives the synthetic `owner` column from the outer key. The entity is
/// scoped per user: a signed-in caller reads only their own rows.

import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import Types "../types/optimization";

module {
  /// Flatten the nested per-caller map into `(owner, profile)` rows.
  public func rows(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
  ) : Iter.Iter<(Principal, Types.OptimizationProfile)> {
    let buffer = List.empty<(Principal, Types.OptimizationProfile)>();
    for ((owner, owned) in profiles.entries()) {
      for ((_, profile) in owned.entries()) {
        buffer.add((owner, profile));
      };
    };
    buffer.values();
  };

  /// Build the queryable `optimizationProfile` entity declaration.
  public func entity(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
  ) : OQL.Decl {
    let sampleOwner = Principal.fromText("aaaaa-aa");
    let sampleProfile : Types.OptimizationProfile = {
      id = 0;
      gameId = 0;
      options = [];
      graphics = {
        graphicsQuality = "";
        frameRate = "";
        shadow = false;
        antiAliasing = false;
        autoAdjustGraphics = false;
      };
      applied = { applied = false; appliedAt = null };
      previous = null;
      createdAt = 0;
      updatedAt = 0;
    };

    OQL.Entity.manual<(Principal, Types.OptimizationProfile)>(
      "optimizationProfile",
      func () = rows(profiles),
      "OptimizationProfile",
      "id",
    )
      .sample((sampleOwner, sampleProfile))
      .payload("id", func ((_, p)) = p.id)
      .payload("owner", func ((owner, _)) = owner)
      .payload("gameId", func ((_, p)) = p.gameId)
      .payload("optionCount", func ((_, p)) = p.options.size())
      .payload("enabledOptionCount", func ((_, p)) = enabledOptionCount(p.options))
      .payload("graphicsQuality", func ((_, p)) = p.graphics.graphicsQuality)
      .payload("frameRate", func ((_, p)) = p.graphics.frameRate)
      .payload("shadow", func ((_, p)) = p.graphics.shadow)
      .payload("antiAliasing", func ((_, p)) = p.graphics.antiAliasing)
      .payload("autoAdjustGraphics", func ((_, p)) = p.graphics.autoAdjustGraphics)
      .payload("applied", func ((_, p)) = p.applied.applied)
      .payload("appliedAt", func ((_, p)) = appliedAtText(p.applied.appliedAt))
      .payload("hasPrevious", func ((_, p)) = p.previous != null)
      .payload("createdAt", func ((_, p)) = p.createdAt)
      .payload("updatedAt", func ((_, p)) = p.updatedAt)
      .ownedBy("owner")
      .scopedPerUser()
      .build();
  };

  /// Count the enabled options in a profile.
  func enabledOptionCount(options : [Types.OptimizationOption]) : Nat {
    var count = 0;
    for (option in options.values()) {
      if (option.enabled) { count += 1 };
    };
    count;
  };

  /// Render the optional applied timestamp as text; empty string means not applied.
  func appliedAtText(value : ?Types.Timestamp) : Text {
    switch (value) {
      case (?at) { at.toText() };
      case null { "" };
    };
  };
};

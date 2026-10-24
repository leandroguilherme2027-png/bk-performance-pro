/// OQL adapter for the per-caller sensitivity profile store.
///
/// Storage shape is `Map<Principal, Map<SensitivityProfileId, SensitivityProfile>>`.
/// The owner principal lives in the OUTER map key, not in the stored record, so
/// this adapter flattens the nested map into `(Principal, SensitivityProfile)`
/// rows and derives the synthetic `owner` column from the outer key. The entity
/// is scoped per user: a signed-in caller reads only their own rows.

import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import OQL "mo:caffeineai-oql";
import Entity "mo:caffeineai-oql/Entity";
import Types "../types/sensitivity";

module {
  /// Flatten the nested per-caller map into `(owner, profile)` rows.
  public func rows(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
  ) : Iter.Iter<(Principal, Types.SensitivityProfile)> {
    let buffer = List.empty<(Principal, Types.SensitivityProfile)>();
    for ((owner, owned) in profiles.entries()) {
      for ((_, profile) in owned.entries()) {
        buffer.add((owner, profile));
      };
    };
    buffer.values();
  };

  /// Build the queryable `sensitivityProfile` entity declaration.
  public func entity(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
  ) : OQL.Decl {
    let sampleOwner = Principal.fromText("aaaaa-aa");
    let sampleProfile : Types.SensitivityProfile = {
      id = 0;
      gameId = 0;
      brand = "";
      model = "";
      sensitivityType = #medium;
      dpiMode = #withoutDpi;
      dpi = ?0;
      playStyle = #balanced;
      fingerMode = #three;
      values = {
        general = 0;
        redDot = 0;
        scope2x = 0;
        scope4x = 0;
        awmScope = 0;
        freeLook = 0;
      };
      createdAt = 0;
      updatedAt = 0;
    };

    OQL.Entity.manual<(Principal, Types.SensitivityProfile)>(
      "sensitivityProfile",
      func () = rows(profiles),
      "SensitivityProfile",
      "id",
    )
      .sample((sampleOwner, sampleProfile))
      .payload("id", func ((_, p)) = p.id)
      .payload("owner", func ((owner, _)) = owner)
      .payload("gameId", func ((_, p)) = p.gameId)
      .payload("brand", func ((_, p)) = p.brand)
      .payload("model", func ((_, p)) = p.model)
      .payload("sensitivityType", func ((_, p)) = sensitivityTypeText(p.sensitivityType))
      .payload("dpiMode", func ((_, p)) = dpiModeText(p.dpiMode))
      .payload("dpi", func ((_, p)) = dpiText(p.dpi))
      .payload("playStyle", func ((_, p)) = playStyleText(p.playStyle))
      .payload("fingerMode", func ((_, p)) = fingerModeText(p.fingerMode))
      .payload("createdAt", func ((_, p)) = p.createdAt)
      .payload("updatedAt", func ((_, p)) = p.updatedAt)
      .ownedBy("owner")
      .scopedPerUser()
      .build();
  };

  func sensitivityTypeText(value : Types.SensitivityType) : Text {
    switch (value) {
      case (#low) { "low" };
      case (#medium) { "medium" };
      case (#high) { "high" };
      case (#custom) { "custom" };
    };
  };
  func dpiModeText(value : Types.DpiMode) : Text {
    switch (value) {
      case (#current) { "current" };
      case (#recommended) { "recommended" };
      case (#withoutDpi) { "withoutDpi" };
    };
  };

  /// Render the optional DPI as text; empty string means no DPI applies.
  func dpiText(value : ?Nat) : Text {
    switch (value) {
      case (?dpi) { dpi.toText() };
      case null { "" };
    };
  };

  func playStyleText(value : Types.PlayStyle) : Text {
    switch (value) {
      case (#dragScope) { "dragScope" };
      case (#precision) { "precision" };
      case (#closeCombat) { "closeCombat" };
      case (#balanced) { "balanced" };
      case (#custom) { "custom" };
    };
  };

  func fingerModeText(value : Types.FingerMode) : Text {
    switch (value) {
      case (#two) { "two" };
      case (#three) { "three" };
      case (#four) { "four" };
      case (#custom) { "custom" };
    };
  };
};

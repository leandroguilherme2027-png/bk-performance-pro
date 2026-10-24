import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/sensitivity";

module {
  /// Free Fire accepts sensitivity values from 0 to 200.
  let SENSI_MIN : Nat = 0;
  let SENSI_MAX : Nat = 200;

  /// Base value per sensitivity type — the anchor the axis offsets move around.
  func typeBase(sensitivityType : Types.SensitivityType) : Nat {
    switch (sensitivityType) {
      case (#low) { 62 };
      case (#medium) { 82 };
      case (#high) { 104 };
      case (#custom) { 82 };
    };
  };

  /// Clamp a signed value into the valid sensitivity range.
  func clamp(value : Int) : Nat {
    if (value < SENSI_MIN.toInt()) { SENSI_MIN }
    else if (value > SENSI_MAX.toInt()) { SENSI_MAX }
    else { value.toNat() };
  };

  /// Generate the six Free Fire sensitivity values from the chosen device,
  /// DPI mode and sensitivity level. Deterministic and side-effect free.
  public func generateSensitivity(
    request : Types.GenerateSensitivityRequest,
  ) : Types.GeneratedSensitivity {
    let anchor = typeBase(request.sensitivityType).toInt();
    let values : Types.SensitivityValues = {
      general = clamp(anchor);
      redDot = clamp(anchor - 6);
      scope2x = clamp(anchor - 10);
      scope4x = clamp(anchor - 16);
      awmScope = clamp(anchor - 22);
      freeLook = clamp(anchor + 14);
    };
    let dpi : ?Nat = switch (request.dpiMode) {
      case (#recommended) { ?480 };
      case (#current) { request.dpi };
      case (#withoutDpi) { null };
    };
    { values; dpi };
  };

  /// List all sensitivity profiles owned by the caller.
  public func listSensitivityProfiles(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
    caller : Principal,
  ) : [Types.SensitivityProfile] {
    switch (profiles.get(caller)) {
      case (?owned) {
        let all = owned.values().toArray();
        all.sort(func (a, b) = if (a.updatedAt > b.updatedAt) { #less } else if (a.updatedAt < b.updatedAt) { #greater } else { #equal });
      };
      case null { [] };
    };
  };

  /// Save (create or replace) a sensitivity profile for the caller.
  public func saveSensitivityProfile(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
    nextProfileId : { var value : Nat },
    caller : Principal,
    request : Types.SaveSensitivityProfileRequest,
  ) : Types.SensitivityProfile {
    let owned = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Types.SensitivityProfileId, Types.SensitivityProfile>();
        profiles.add(caller, fresh);
        fresh;
      };
    };
    let id = nextProfileId.value;
    nextProfileId.value := id + 1;
    let now = Time.now();
    let profile : Types.SensitivityProfile = {
      id;
      gameId = request.gameId;
      brand = request.brand;
      model = request.model;
      sensitivityType = request.sensitivityType;
      dpiMode = request.dpiMode;
      dpi = request.dpi;
      playStyle = request.playStyle;
      fingerMode = request.fingerMode;
      values = request.values;
      createdAt = now;
      updatedAt = now;
    };
    owned.add(id, profile);
    profile;
  };

  /// Update one of the caller's sensitivity profiles; returns null when not found.
  public func updateSensitivityProfile(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
    caller : Principal,
    request : Types.UpdateSensitivityProfileRequest,
  ) : ?Types.SensitivityProfile {
    switch (profiles.get(caller)) {
      case (?owned) {
        switch (owned.get(request.id)) {
          case (?existing) {
            let updated : Types.SensitivityProfile = {
              id = existing.id;
              gameId = existing.gameId;
              brand = request.brand;
              model = request.model;
              sensitivityType = request.sensitivityType;
              dpiMode = request.dpiMode;
              dpi = request.dpi;
              playStyle = request.playStyle;
              fingerMode = request.fingerMode;
              values = request.values;
              createdAt = existing.createdAt;
              updatedAt = Time.now();
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

  /// Delete one of the caller's sensitivity profiles.
  public func deleteSensitivityProfile(
    profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
    caller : Principal,
    request : Types.DeleteSensitivityProfileRequest,
  ) : Bool {
    switch (profiles.get(caller)) {
      case (?owned) {
        let existed = owned.get(request.id) != null;
        owned.remove(request.id);
        existed;
      };
      case null { false };
    };
  };
};

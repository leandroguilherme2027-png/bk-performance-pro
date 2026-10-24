import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/optimization";

module {
  /// List all optimization profiles owned by the caller.
  public func listOptimizationProfiles(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
    caller : Principal,
  ) : [Types.OptimizationProfile] {
    switch (profiles.get(caller)) {
      case (?owned) {
        let all = owned.values().toArray();
        all.sort(func (a, b) = if (a.updatedAt > b.updatedAt) { #less } else if (a.updatedAt < b.updatedAt) { #greater } else { #equal });
      };
      case null { [] };
    };
  };

  /// Save (create or replace) an optimization profile for the caller.
  public func saveOptimizationProfile(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
    nextProfileId : { var value : Nat },
    caller : Principal,
    request : Types.SaveOptimizationProfileRequest,
  ) : Types.OptimizationProfile {
    let owned = switch (profiles.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = Map.empty<Types.OptimizationProfileId, Types.OptimizationProfile>();
        profiles.add(caller, fresh);
        fresh;
      };
    };
    let now = Time.now();
    let existing = owned.values().find(func p = p.gameId == request.gameId);
    let profile : Types.OptimizationProfile = switch (existing) {
      case (?prev) {
        {
          id = prev.id;
          gameId = request.gameId;
          options = request.options;
          graphics = request.graphics;
          applied = prev.applied;
          previous = prev.previous;
          createdAt = prev.createdAt;
          updatedAt = now;
        };
      };
      case null {
        let id = nextProfileId.value;
        nextProfileId.value := id + 1;
        {
          id;
          gameId = request.gameId;
          options = request.options;
          graphics = request.graphics;
          applied = { applied = false; appliedAt = null };
          previous = null;
          createdAt = now;
          updatedAt = now;
        };
      };
    };
    owned.add(profile.id, profile);
    profile;
  };

  /// Mark an optimization profile as applied, capturing the previous state.
  public func applyOptimizationProfile(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
    caller : Principal,
    request : Types.ApplyOptimizationProfileRequest,
  ) : ?Types.OptimizationProfile {
    switch (profiles.get(caller)) {
      case (?owned) {
        switch (owned.get(request.id)) {
          case (?existing) {
            let now = Time.now();
            let updated : Types.OptimizationProfile = {
              id = existing.id;
              gameId = existing.gameId;
              options = existing.options;
              graphics = existing.graphics;
              applied = { applied = true; appliedAt = ?now };
              previous = ?{
                options = existing.options;
                graphics = existing.graphics;
                capturedAt = now;
              };
              createdAt = existing.createdAt;
              updatedAt = now;
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

  /// Restore the previous state of an optimization profile.
  public func restoreOptimizationProfile(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
    caller : Principal,
    request : Types.RestoreOptimizationProfileRequest,
  ) : ?Types.OptimizationProfile {
    switch (profiles.get(caller)) {
      case (?owned) {
        switch (owned.get(request.id)) {
          case (?existing) {
            switch (existing.previous) {
              case (?prev) {
                let now = Time.now();
                let updated : Types.OptimizationProfile = {
                  id = existing.id;
                  gameId = existing.gameId;
                  options = prev.options;
                  graphics = prev.graphics;
                  applied = { applied = false; appliedAt = null };
                  previous = null;
                  createdAt = existing.createdAt;
                  updatedAt = now;
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
      case null { null };
    };
  };

  /// Delete one of the caller's optimization profiles.
  public func deleteOptimizationProfile(
    profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
    caller : Principal,
    request : Types.DeleteOptimizationProfileRequest,
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

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/optimization";
import OptimizationLib "../lib/optimization";

mixin (
  profiles : Map.Map<Principal, Map.Map<Types.OptimizationProfileId, Types.OptimizationProfile>>,
  nextProfileId : { var value : Nat },
) {
  /// List the caller's optimization profiles.
  public query ({ caller }) func listOptimizationProfiles() : async [Types.OptimizationProfile] {
    OptimizationLib.listOptimizationProfiles(profiles, caller);
  };

  /// Save (create or replace) an optimization profile for the caller.
  public shared ({ caller }) func saveOptimizationProfile(
    request : Types.SaveOptimizationProfileRequest,
  ) : async Types.OptimizationProfile {
    OptimizationLib.saveOptimizationProfile(profiles, nextProfileId, caller, request);
  };

  /// Apply an optimization profile, capturing the previous state.
  public shared ({ caller }) func applyOptimizationProfile(
    request : Types.ApplyOptimizationProfileRequest,
  ) : async ?Types.OptimizationProfile {
    OptimizationLib.applyOptimizationProfile(profiles, caller, request);
  };

  /// Restore the previous state of an optimization profile.
  public shared ({ caller }) func restoreOptimizationProfile(
    request : Types.RestoreOptimizationProfileRequest,
  ) : async ?Types.OptimizationProfile {
    OptimizationLib.restoreOptimizationProfile(profiles, caller, request);
  };

  /// Delete one of the caller's optimization profiles.
  public shared ({ caller }) func deleteOptimizationProfile(
    request : Types.DeleteOptimizationProfileRequest,
  ) : async Bool {
    OptimizationLib.deleteOptimizationProfile(profiles, caller, request);
  };
};

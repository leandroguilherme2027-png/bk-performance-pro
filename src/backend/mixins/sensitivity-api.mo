import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/sensitivity";
import SensitivityLib "../lib/sensitivity";

mixin (
  profiles : Map.Map<Principal, Map.Map<Types.SensitivityProfileId, Types.SensitivityProfile>>,
  nextProfileId : { var value : Nat },
) {
  /// List the caller's sensitivity profiles.
  public query ({ caller }) func listSensitivityProfiles() : async [Types.SensitivityProfile] {
    SensitivityLib.listSensitivityProfiles(profiles, caller);
  };

  /// Save (create or replace) a sensitivity profile for the caller.
  public shared ({ caller }) func saveSensitivityProfile(
    request : Types.SaveSensitivityProfileRequest,
  ) : async Types.SensitivityProfile {
    SensitivityLib.saveSensitivityProfile(profiles, nextProfileId, caller, request);
  };

  /// Update one of the caller's sensitivity profiles.
  public shared ({ caller }) func updateSensitivityProfile(
    request : Types.UpdateSensitivityProfileRequest,
  ) : async ?Types.SensitivityProfile {
    SensitivityLib.updateSensitivityProfile(profiles, caller, request);
  };

  /// Delete one of the caller's sensitivity profiles.
  public shared ({ caller }) func deleteSensitivityProfile(
    request : Types.DeleteSensitivityProfileRequest,
  ) : async Bool {
    SensitivityLib.deleteSensitivityProfile(profiles, caller, request);
  };

  /// Generate a Free Fire sensitivity from the chosen device, DPI mode and level.
  public query func generateSensitivity(
    request : Types.GenerateSensitivityRequest,
  ) : async Types.GeneratedSensitivity {
    SensitivityLib.generateSensitivity(request);
  };
};

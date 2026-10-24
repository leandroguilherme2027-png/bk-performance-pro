import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import GameTypes "types/games";
import OptimizationTypes "types/optimization";
import SensitivityTypes "types/sensitivity";
import GamesApi "mixins/games-api";
import OptimizationApi "mixins/optimization-api";
import SensitivityApi "mixins/sensitivity-api";
import ApiDocMixin "mixins/api-doc";
import SensitivityProfilesOql "generated/SensitivityProfilesOql";
import GamesOql "generated/GamesOql";
import OptimizationProfilesOql "generated/OptimizationProfilesOql";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let games : Map.Map<Principal, Map.Map<GameTypes.GameId, GameTypes.Game>>;
  let nextGameId : { var value : Nat };

  let optimizationProfiles : Map.Map<Principal, Map.Map<OptimizationTypes.OptimizationProfileId, OptimizationTypes.OptimizationProfile>>;
  let nextOptimizationProfileId : { var value : Nat };

  let sensitivityProfiles : Map.Map<Principal, Map.Map<SensitivityTypes.SensitivityProfileId, SensitivityTypes.SensitivityProfile>>;
  let nextSensitivityProfileId : { var value : Nat };

  include GamesApi(games, nextGameId);
  include OptimizationApi(optimizationProfiles, nextOptimizationProfileId);
  include SensitivityApi(sensitivityProfiles, nextSensitivityProfileId);
  include ApiDocMixin();

  include Expose({
    entities = [
      SensitivityProfilesOql.entity(sensitivityProfiles),
      GamesOql.entity(games),
      OptimizationProfilesOql.entity(optimizationProfiles),
    ];
  });
};

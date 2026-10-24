import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  public type Timestamp = Int;
  public type GameId = Nat;
  public type OptimizationProfileId = Nat;
  public type SensitivityProfileId = Nat;

  public type Game = {
    id : GameId;
    name : Text;
    packageId : ?Text;
    isBuiltIn : Bool;
    createdAt : Timestamp;
  };

  public type OptimizationOption = {
    key : Text;
    title : Text;
    enabled : Bool;
  };

  public type GraphicsSettings = {
    graphicsQuality : Text;
    frameRate : Text;
    shadow : Bool;
    antiAliasing : Bool;
    autoAdjustGraphics : Bool;
  };

  public type AppliedState = {
    applied : Bool;
    appliedAt : ?Timestamp;
  };

  public type PreviousState = {
    options : [OptimizationOption];
    graphics : GraphicsSettings;
    capturedAt : Timestamp;
  };

  public type OptimizationProfile = {
    id : OptimizationProfileId;
    gameId : GameId;
    options : [OptimizationOption];
    graphics : GraphicsSettings;
    applied : AppliedState;
    previous : ?PreviousState;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type SensitivityType = {
    #low;
    #medium;
    #high;
    #custom;
  };

  public type DpiMode = {
    #current;
    #recommended;
    #withoutDpi;
  };

  public type PlayStyle = {
    #dragScope;
    #precision;
    #closeCombat;
    #balanced;
    #custom;
  };

  public type FingerMode = {
    #two;
    #three;
    #four;
    #custom;
  };

  public type SensitivityValues = {
    general : Nat;
    redDot : Nat;
    scope2x : Nat;
    scope4x : Nat;
    awmScope : Nat;
    freeLook : Nat;
  };

  public type SensitivityProfile = {
    id : SensitivityProfileId;
    gameId : GameId;
    brand : Text;
    model : Text;
    sensitivityType : SensitivityType;
    dpiMode : DpiMode;
    dpi : ?Nat;
    playStyle : PlayStyle;
    fingerMode : FingerMode;
    values : SensitivityValues;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    games : Map.Map<Principal, Map.Map<GameId, Game>>;
    nextGameId : { var value : Nat };
    optimizationProfiles : Map.Map<Principal, Map.Map<OptimizationProfileId, OptimizationProfile>>;
    nextOptimizationProfileId : { var value : Nat };
    sensitivityProfiles : Map.Map<Principal, Map.Map<SensitivityProfileId, SensitivityProfile>>;
    nextSensitivityProfileId : { var value : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      games = Map.empty();
      nextGameId = { var value = 0 };
      optimizationProfiles = Map.empty();
      nextOptimizationProfileId = { var value = 0 };
      sensitivityProfiles = Map.empty();
      nextSensitivityProfileId = { var value = 0 };
    };
  };
};

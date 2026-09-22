"use strict";
var VERSION = "2.0.0";

var RANGE_IDS = ["lagCompensation","mouseFlickFixVal","sensitivityX","sensitivityY","aimSensitivityX","aimSensitivityY",
  "controllerSensX","controllerSensY","controllerAimSensX","controllerAimSensY","deadZoneLeft","deadZoneRight","triggerThreshold","vibrationVal",
  "uiScale","deathMarkerADSOpacity","deathMarkerDuration","dmgScale","fpsUpdateRate",
  "speedXOffset","speedYOffset","speedScale","nametagOpacity","nametagScale",
  "objectiveOpacity","adsObjectiveOpacity","minimapScale","minimapZoom","medalScale","medalColorHue",
  "chatHeight","chatOpacity","chatBGOpacity",
  "crosshairThickness","crosshairSize","crosshairGap","crosshairShadowThickness","crosshairOpacity","crosshairImageWidth","crosshairImageHeight",
  "hitmarkerLength","hitmarkerThickness","hitmarkerSpacing","hitmarkerOpacity","hitmarkerAnimSize","hitmarkerAnimSpeed","hitmarkerFadeSpeed",
  "resolution","particleDistance","renderDistance",
  "progressBarScale","progressBarRotation","chargeBarScale","chargeBarRotation","popupScoreScale","popupScoreYOffset",
  "saturationIngame","saturationUI","colorHueIngame","colorHueUI","vignette","killfeedLimit","speedLines","tracerOffset",
  "fov","weaponFOV","weaponADSFOVPower","weaponBobbing","weaponLeaning","weaponRotation","weaponXOffset","weaponYOffset","weaponZOffset",
  "weaponADSYOffset","weaponSwapY","weaponReloadY","wallSlideLean",
  "scopeOpacity","scopeImageWidth","scopeImageHeight","reticleImageWidth","reticleImageHeight",
  "masterVolume","ambientVolume","actionVolume","weaponVolume","playerVolume","cosmeticsVolume","uiVolume","assetVolume","micVolume","voiceVolume","voiceChatDistance"];

var BOOL_IDS = ["showNetworkStats","legacyBrowser","defaultRegionOnly","rawMouseInput","aimFreezeFix","instanceRendering","mouseAcceleration",
  "scrollDirection","invertYAxis","challengeMode","disableControllers","controllerInvertY","vibration","gradualSpeed",
  "showUI","useOldScoreboard","disableRarityAnimations","showProfilePictures","dynamicHPBars","showHitIndicators","showDeathMarkers",
  "showKillFeed","showKillCounter","showDeathCounter","showKDCounter","showScoreCounter","showStreakCounter","showPing","showFPS","showDamage",
  "showMovementSpeed","nametagHealthNumber","hideNonTradableSkins","showMinimap",
  "showMedals","classicMedals","playMedalSounds","profanityFilter","showPlayerMessages","showUnboxings","chatTextOutline",
  "crosshairAlwaysShow","crosshairDot","hitmarkerShow",
  "antialiasing","lowSpec","noTextures","mapDetails","particles","shadows","softShadows","highResShadows","dynamicShadows","oldShading",
  "bulletTrails","yourTrails","muzzleFlash","bulletCasings","bulletImpactHoles","sniperFlap","sniperFlapAnimation","textureAnimations",
  "objectAnimations","disableAnimatedPaints","screenShake","weaponsShine","showExplosions","postProcessing","ambientShading",
  "progressBarShadow","chargeBarShadow","showPopupScore","popupScoreShadow","bulletTracers",
  "streamerMode","anonymousMode","showRegionInfo","showServerTimers","showVerifiedBadge","showPremiumBadge","showCustomBadge","showRankedBadge",
  "toggleWeaponADS","weaponAimAnimation","hideWeaponADS","showHands","showPrimary","showSecondary","showMelee","leftHanded","roundedArms",
  "loadMods","allowLogoChanges","autoLoadMod","scopeBordersEnabled","useDamageOverlay","particleEffectOnKill","enableJumpScare",
  "voiceMuteSpectators"];

var SELECT_IDS = ["networkRate","nametagDisplay","nametagStyle","showChatBox","crosshairType","crosshairStyle",
  "frameCap","aspectRatioPreset","reflectionQuality","lighting","micQuality","voiceChatType"];

var COLOR_IDS = ["hitIndicatorColor","damageColor","critColor","speedColorCurrent","speedColorMax","nametagHealthColorTeam","nametagHealthColorEnemy",
  "crosshairColor","crosshairShadowColor","hitmarkerColor","hitmarkerKillColor","hudHealthHigh","hudHealthLow","progressBarColor","chargeBarColor",
  "overchargeColor","popupScoreColor","bulletTrailColor","bulletTracerColor","grappleRopeColor","speedLinesColor","scopeBorderColor"];

var TEXT_IDS = ["crosshairImage","hideGameTitle","matchEndMessage"];

var ALL_IDS = RANGE_IDS.concat(BOOL_IDS, SELECT_IDS, COLOR_IDS, TEXT_IDS);

function sync(id){ var e=document.getElementById(id), v=document.getElementById("v_"+id); if(v) v.textContent=e.value; }
RANGE_IDS.forEach(sync);

/* ────────────────────────────────────────────────────────────────
   REAL KEY MAP — maps this form's internal field ids to Krunker's
   actual settings.json key names. Every entry here was confirmed by
   cross-referencing real exported settings.json files (Pro/Low-end/
   Balanced/Casual) the user provided — not guessed.
   Fields with NO entry here have no confirmed real key: their
   internal id is unverified, so generate() prefixes them with
   "guess_" in the output. Krunker will silently ignore those —
   they're marked so that's visible instead of silently pretending
   to work.
   ──────────────────────────────────────────────────────────────── */
var REAL_KEY_MAP = {
  // General
  rawMouseInput:"rawMouse", mouseFlickFixVal:"flickClamp",
  // Controls
  sensitivityX:"sensitivityX", sensitivityY:"sensitivityY",
  aimSensitivityX:"aimSensitivityX", aimSensitivityY:"aimSensitivityY",
  scrollDirection:"scrollDir",
  // Display — interface
  uiScale:"scaleUI", useOldScoreboard:"oldScoreboard", dynamicHPBars:"dynamicHP",
  showHitIndicators:"showHitInd", showDeathMarkers:"deathMarkers",
  // Display — damage & counters
  showDamage:"showDMG", damageColor:"dmgColor", critColor:"critColor", dmgScale:"dmgScale",
  showKillCounter:"showKillC", showDeathCounter:"showDeaths", showKDCounter:"showKD",
  showScoreCounter:"showScore", showStreakCounter:"showStreak", showFPS:"showFPS", fpsUpdateRate:"fpsRate",
  // Display — speedometer
  showMovementSpeed:"showSpeed", speedXOffset:"speedOffX", speedYOffset:"speedOffY",
  // Display — nametags
  nametagHealthNumber:"healthNum", nametagHealthColorTeam:"healthColT", nametagHealthColorEnemy:"healthColE",
  // Display — objective / minimap / skins
  adsObjectiveOpacity:"adsObjOpac", hideNonTradableSkins:"hideNonTrade",
  // Display — medals
  showMedals:"showMedals", playMedalSounds:"playMedals",
  // Display — chat
  showUnboxings:"showUnboxings", chatBGOpacity:"chatBGOp", chatHeight:"chatHeight",
  // Display — crosshair
  crosshairType:"crosshairSho", crosshairStyle:"crosshairStyle", crosshairAlwaysShow:"crosshairAlways",
  crosshairShadowColor:"crosshairShadow", crosshairShadowThickness:"crosshairShadowThickess",
  crosshairThickness:"crosshairThick", crosshairSize:"crosshairLen", crosshairGap:"crosshairGap",
  crosshairImage:"crosshairImage", crosshairOpacity:"crosshairUseOpacity",
  // Display — hitmarker
  hitmarkerColor:"hitmCol", hitmarkerKillColor:"hitmKCol", hitmarkerLength:"hitmLen",
  hitmarkerThickness:"hitmThick", hitmarkerSpacing:"hitmSpac", hitmarkerAnimSize:"hitmAnimD",
  hitmarkerAnimSpeed:"hitmAnimS", hitmarkerFadeSpeed:"hitmFad",
  // Render — performance
  resolution:"resolution", aspectRatioPreset:"aspectRatio", lowSpec:"lowSpec", noTextures:"noTex",
  mapDetails:"mapDet", particles:"particles", particleDistance:"particlesDist", shadows:"shadows",
  // Render — effects
  ambientShading:"ambientShading", muzzleFlash:"muzzleFlash", bulletCasings:"bulletCasings",
  bulletImpactHoles:"impactHoles", sniperFlap:"sniperFlap", textureAnimations:"textureAnim",
  objectAnimations:"objectAnim", disableAnimatedPaints:"noPaintAnim", screenShake:"screenShake",
  lighting:"lighting", postProcessing:"postProcessing",
  // Render — HUD editing
  hudHealthHigh:"hudHealthHigh", hudHealthLow:"hudHealthLow", speedLinesColor:"spdLinesCol",
  popupScoreColor:"scoreColor", popupScoreScale:"scoreScale", popupScoreYOffset:"scoreOffY",
  saturationIngame:"saturationn", killfeedLimit:"feedLimit", bulletTracers:"bulletTracers",
  bulletTrailColor:"trailCol", bulletTracerColor:"bulletTracerCol",
  // Game — view model
  fov:"fov", weaponFOV:"fpsFOV", weaponADSFOVPower:"adsFovMlt", weaponBobbing:"weaponBob",
  weaponLeaning:"weaponLean", weaponXOffset:"weaponOffX", weaponYOffset:"weaponOffY",
  weaponZOffset:"weaponOffZ", weaponADSYOffset:"weaponADSOffY", weaponAimAnimation:"aimAnim",
  hideWeaponADS:"hideADS",
  // Game — customization
  allowLogoChanges:"canChangeLogo", autoLoadMod:"autoLoadLast", scopeBordersEnabled:"scopeBorders",
  scopeImageWidth:"scopeWidth", scopeImageHeight:"scopeHeight", scopeOpacity:"scopeOpac",
  reticleImageWidth:"reticleWidth", reticleImageHeight:"reticleHeight",
  useDamageOverlay:"useDamageOverlay", particleEffectOnKill:"killFx",
  // Sound
  masterVolume:"sound", ambientVolume:"ambientVolume", actionVolume:"dialogueVolume",
  micVolume:"micVolume", voiceVolume:"voiceVolume", weaponVolume:"gunsVolume",
  playerVolume:"playerVolume", cosmeticsVolume:"skinVolume", uiVolume:"uiVolume", assetVolume:"assetVolume"
};

/* Enum fields whose real value is a numeric index, not the label text.
   Index order is INFERRED from the option order shown in Krunker's UI
   and cross-checked against real exports where possible — flagged as
   inferred rather than fully confirmed like the key names above. */
var ENUM_TRANSFORMS = {
  crosshairType: ["Off","Precision","Dynamic","Layered","Shapes","Image"],
  crosshairStyle: ["Cross","Hollow Circle","Solid Circle","Hollow Square","Solid Square"],
  lighting: ["Low","Normal","High","Physical"]
};

document.querySelectorAll(".tg").forEach(function(lab){
  var cb = lab.querySelector("input[type=checkbox]");
  if(!cb) return;
  function upd(){ lab.classList.toggle("on", cb.checked); }
  cb.addEventListener("change", upd); upd();
});

/* top tab switching */
document.getElementById("toptabs").addEventListener("click", function(e){
  var btn = e.target.closest("button[data-tab]"); if(!btn) return;
  document.querySelectorAll("#toptabs button").forEach(function(b){ b.classList.toggle("active", b===btn); });
  var name = btn.getAttribute("data-tab");
  document.querySelectorAll(".tabpanel").forEach(function(p){ p.classList.toggle("active", p.id==="tab-"+name); });
});

/* ════════════════════════════════════════════════════════════════
   KEYBINDS
   Real field names below come directly from a real exported
   settings.json "controls" object — confirmed, not guessed.
   Default values shown are what that export contained; rebind
   anything freely, it's saved in KB_STATE and merged into the
   generated JSON as the top-level "controls" object.
   ════════════════════════════════════════════════════════════════ */

var KB_STATE = {
  primKey:-1, reloadKey:-1, reloadKey_alt:82, jumpKey:-1, jumpKey_alt:32,
  pListKey:192, pListKey_alt:18, sBoardKey:-1, sBoardKey_alt:9,
  interactKey:69, interactKey_alt:67, confirmKey:74, confirmKey_alt:75,
  interactSecKey:71, interactSecKey_alt:72, resetKey_alt:66, resetLastKey_alt:78,
  sprayKey:32, sprayKey_alt:70, sprayWheelKey:-1, inspKey_alt:81,
  swapKey:-1, swapKey_alt:84, shoot1Key_alt:-1, aim1Key:-1, aim1Key_alt:10003,
  crouchKey:-1, crouchKey_alt:16, meleeKey:-1, meleeKey_alt:81,
  equipKey:-1, equipKey_alt:67, chatKey_alt:27, voiceKey:-1, voiceKey_alt:86,
  dropKey:66, dropKey_alt:90, wepVisKey:17, wepVisKey_alt:17,
  kickVoteYKey:89, kickVoteYKey_alt:49, kickVoteNKey:78, kickVoteNKey_alt:50,
  specFreeKey:-1, specFreeKey_alt:67, specObjKey:-1, specObjKey_alt:72,
  specFirstKey:74, specFirstKey_alt:82, specNamesKey:-1, specNamesKey_alt:86,
  specMiniMap:-1, specMiniMap_alt:192, kpdVoteYKey:-1, kpdVoteYKey_alt:10004,
  kpdVoteNKey:-1, kpdVoteNKey_alt:10005, specFocusKey:80, specFocusKey_alt:10002,
  kpdVisionKey:-1, kpdVisionKey_alt:110, propKey:-1, propKey_alt:70,
  propRandKey:-1, propRandKey_alt:77, propRotKey:-1, propRotKey_alt:82,
  propRotRKey:-1, propRotRKey_alt:78, sandboxNoclip:97, sandboxNoclip_alt:38,
  sandboxGodMode:96, sandboxGodMode_alt:90, sandboxSmite:80, sandboxSmite_alt:190,
  sandboxUnlimited:10002, sandboxUnlimited_alt:86, sandboxKill:75, sandboxKill_alt:48,
  sandboxSpawnBot:-1, sandboxClearBots:-1, markPositionKey:-1,
  streakKeys:[-1,-1,-1], streakKeys_alt:[49,50,51],
  tauntKeys:[-1,-1,-1,-1,-1,-1], tauntKeys_alt:[49,50,51,52,53,54],
  moveKeys:[-1,-1,-1,-1], moveKeys_alt:[87,83,65,68],
  toggleKeys:[86,20000,67,188,17,20000], toggleKeys_alt:[88,71,10002,66,52,112],
  premiumKeys:[78,79,97,9], premiumKeys_alt:[78,77,75,10001],
  messageKeys:[85,73,99,83,65,68], messageKeys_alt:[85,10003,65,83,68,82],
  toggleSets:[-1,-1,-1,-1,-1,-1]
};

var KEYCODE_NAMES = {"-1":"Unbound",8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",
  19:"Pause",20:"Caps",27:"Esc",32:"Space",33:"PgUp",34:"PgDn",35:"End",36:"Home",
  37:"←",38:"↑",39:"→",40:"↓",45:"Ins",46:"Del",
  48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",
  65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",
  77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",
  112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",
  186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",
  10000:"M1",10001:"M4",10002:"M5",10003:"M5",10004:"SCROLL",10005:"SCROLL",10006:"M2",20000:"M3"};
function kbLabel(code){
  if(code===undefined || code===null || code===-1) return "Unbound";
  return KEYCODE_NAMES[code] || ("#"+code);
}

/* [label, primary path-or-null, alt path-or-null]. A "path" is either a
   plain KB_STATE key, or "arr.N" for an array field at index N. */
var KB_SCHEMA = [
  { tab:"general", title:"Movement", rows:[
    ["Forward","moveKeys.0","moveKeys_alt.0"], ["Backward","moveKeys.1","moveKeys_alt.1"],
    ["Left","moveKeys.2","moveKeys_alt.2"], ["Right","moveKeys.3","moveKeys_alt.3"],
    ["Jump","jumpKey","jumpKey_alt"], ["Crouch","crouchKey","crouchKey_alt"]
  ]},
  { tab:"general", title:"Weapon", rows:[
    ["Reload","reloadKey","reloadKey_alt"], ["Aim","aim1Key","aim1Key_alt"],
    ["Shoot",null,"shoot1Key_alt"], ["Primary Weapon","primKey",null],
    ["Weapon Swap","swapKey","swapKey_alt"], ["Melee Weapon","meleeKey","meleeKey_alt"],
    ["Equipment","equipKey","equipKey_alt"], ["Inspect",null,"inspKey_alt"],
    ["Spray","sprayKey","sprayKey_alt"], ["Spray Wheel (Hold)","sprayWheelKey",null],
    ["Ping Position","markPositionKey",null]
  ]},
  { tab:"general", title:"Interface", rows:[
    ["Player List","pListKey","pListKey_alt"], ["In-Game Leaderboard","sBoardKey","sBoardKey_alt"]
  ]},
  { tab:"interaction", title:"Interaction", rows:[
    ["Interact","interactKey","interactKey_alt"], ["Secondary Interact","interactSecKey","interactSecKey_alt"],
    ["Drop","dropKey","dropKey_alt"], ["Confirm Interact","confirmKey","confirmKey_alt"]
  ]},
  { tab:"interaction", title:"Killstreaks", rows:[
    ["Streak Slot 1","streakKeys.0","streakKeys_alt.0"], ["Streak Slot 2","streakKeys.1","streakKeys_alt.1"],
    ["Streak Slot 3","streakKeys.2","streakKeys_alt.2"]
  ]},
  { tab:"chat", title:"Interface & Audio", rows:[
    ["Chat",null,"chatKey_alt"], ["Voice","voiceKey","voiceKey_alt"],
    ["Toggle Weapon Visibility","wepVisKey","wepVisKey_alt"]
  ]},
  { tab:"chat", title:"Premium & Host", rows:[
    ["Noclip","premiumKeys.0","premiumKeys_alt.0"], ["Godmode","premiumKeys.1","premiumKeys_alt.1"],
    ["Kill","premiumKeys.2","premiumKeys_alt.2"], ["Smite","premiumKeys.3","premiumKeys_alt.3"]
  ]},
  { tab:"chat", title:"Chat Messages", rows:[
    ["Message 1","messageKeys.0","messageKeys_alt.0"], ["Message 2","messageKeys.1","messageKeys_alt.1"],
    ["Message 3","messageKeys.2","messageKeys_alt.2"], ["Message 4","messageKeys.3","messageKeys_alt.3"],
    ["Message 5","messageKeys.4","messageKeys_alt.4"], ["Message 6","messageKeys.5","messageKeys_alt.5"]
  ]},
  { tab:"chat", title:"Toggle Settings (custom toggles 1–6)", rows:[
    ["Toggle 1","toggleKeys.0","toggleKeys_alt.0"], ["Toggle 2","toggleKeys.1","toggleKeys_alt.1"],
    ["Toggle 3","toggleKeys.2","toggleKeys_alt.2"], ["Toggle 4","toggleKeys.3","toggleKeys_alt.3"],
    ["Toggle 5","toggleKeys.4","toggleKeys_alt.4"], ["Toggle 6","toggleKeys.5","toggleKeys_alt.5"]
  ]},
  { tab:"spectate", title:"Spectating", rows:[
    ["Toggle Focus Player","specFocusKey","specFocusKey_alt"], ["Toggle Free Cam","specFreeKey","specFreeKey_alt"],
    ["Toggle Objective Cam","specObjKey","specObjKey_alt"], ["Toggle First Person","specFirstKey","specFirstKey_alt"],
    ["Toggle Forced Names","specNamesKey","specNamesKey_alt"], ["Toggle Spectator Minimap","specMiniMap","specMiniMap_alt"]
  ]},
  { tab:"spectate", title:"KPD", rows:[
    ["KPD Vote (Yes)","kpdVoteYKey","kpdVoteYKey_alt"], ["KPD Vote (No)","kpdVoteNKey","kpdVoteNKey_alt"],
    ["Toggle KPD Vision","kpdVisionKey","kpdVisionKey_alt"]
  ]},
  { tab:"spectate", title:"Vote", rows:[
    ["Vote Kick (Yes)","kickVoteYKey","kickVoteYKey_alt"], ["Vote Kick (No)","kickVoteNKey","kickVoteNKey_alt"]
  ]},
  { tab:"modes", title:"Prop Hunt", rows:[
    ["Open Prop Selection (Hold)","propKey","propKey_alt"], ["Select Random Prop","propRandKey","propRandKey_alt"],
    ["Toggle Rotation","propRotKey","propRotKey_alt"], ["Reset Rotation","propRotRKey","propRotRKey_alt"]
  ]},
  { tab:"modes", title:"Taunts", rows:[
    ["Taunt 1","tauntKeys.0","tauntKeys_alt.0"], ["Taunt 2","tauntKeys.1","tauntKeys_alt.1"],
    ["Taunt 3","tauntKeys.2","tauntKeys_alt.2"], ["Taunt 4","tauntKeys.3","tauntKeys_alt.3"],
    ["Taunt 5","tauntKeys.4","tauntKeys_alt.4"], ["Taunt 6","tauntKeys.5","tauntKeys_alt.5"]
  ]},
  { tab:"modes", title:"Parkour & Race", rows:[
    ["Reset Position",null,"resetKey_alt"], ["Reset To Last Checkpoint",null,"resetLastKey_alt"]
  ]},
  { tab:"modes", title:"Sandbox (Test mode)", rows:[
    ["Noclip","sandboxNoclip","sandboxNoclip_alt"], ["Godmode","sandboxGodMode","sandboxGodMode_alt"],
    ["Smite","sandboxSmite","sandboxSmite_alt"], ["Unlimited Ammo","sandboxUnlimited","sandboxUnlimited_alt"],
    ["Kill","sandboxKill","sandboxKill_alt"], ["Spawn Bot","sandboxSpawnBot",null], ["Clear Bots","sandboxClearBots",null]
  ]}
];
var KB_TABS = [
  {id:"general", label:"General"}, {id:"interaction", label:"Interaction"},
  {id:"chat", label:"Chat & Toggles"}, {id:"spectate", label:"Spectate & Vote"}, {id:"modes", label:"Modes"}
];
var kbActiveTab = "general";

function kbGet(path){
  if(path===null) return undefined;
  var dot = path.indexOf(".");
  if(dot===-1) return KB_STATE[path];
  var arr = KB_STATE[path.slice(0,dot)], idx = parseInt(path.slice(dot+1),10);
  return arr[idx];
}
function kbSet(path, val){
  var dot = path.indexOf(".");
  if(dot===-1){ KB_STATE[path] = val; return; }
  var arr = KB_STATE[path.slice(0,dot)], idx = parseInt(path.slice(dot+1),10);
  arr[idx] = val;
}

function renderKbTabs(){
  var el = document.getElementById("kbtabs");
  el.innerHTML = KB_TABS.map(function(t){
    return '<button data-kbtab="'+t.id+'" class="'+(t.id===kbActiveTab?"active":"")+'">'+t.label+'</button>';
  }).join("");
  el.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click", function(){ kbActiveTab = b.getAttribute("data-kbtab"); renderKbTabs(); renderKbRoot(); });
  });
}

var kbListeningPath = null, kbListeningBtn = null;
function kbStartListen(btn, path){
  if(kbListeningBtn) kbListeningBtn.classList.remove("listening");
  kbListeningPath = path; kbListeningBtn = btn;
  btn.classList.add("listening"); btn.textContent = "…listening…";
  // delay attaching the mousedown catcher so the click that opened
  // listening mode isn't immediately captured as the bind itself
  setTimeout(function(){
    document.addEventListener("mousedown", kbMouseCapture, {capture:true, once:true});
  }, 0);
}
function kbFinishBind(code){
  kbSet(kbListeningPath, code);
  kbListeningPath = null; kbListeningBtn = null;
  renderKbRoot();
}
document.addEventListener("keydown", function(e){
  if(!kbListeningPath) return;
  e.preventDefault();
  kbFinishBind(e.keyCode);
});
/* Mouse button → Krunker code mapping. 20000 (middle) is confirmed
   from the sample export; 10001/10002 (side buttons) are inferred
   from that same pattern. Left/Right click codes (10000/10006) are
   NOT confirmed by any sample — Krunker's own export never showed
   them bound to a value since they're the default trigger, so this
   is a best-effort placeholder. If it doesn't work in-game, that's
   why — send an export after binding one manually and I'll correct it. */
var MOUSE_BUTTON_CODE = {0:10000, 1:20000, 2:10006, 3:10001, 4:10002};
function kbMouseCapture(e){
  if(!kbListeningPath){ return; }
  e.preventDefault();
  var code = MOUSE_BUTTON_CODE[e.button];
  if(code === undefined) code = 10010 + e.button; // unmapped extra button — best-effort fallback
  kbFinishBind(code);
}
document.addEventListener("wheel", function(e){
  if(!kbListeningPath) return;
  e.preventDefault();
  kbFinishBind(e.deltaY < 0 ? 10004 : 10005); // scroll up / down — inferred
}, {passive:false});
document.addEventListener("contextmenu", function(e){ if(kbListeningPath) e.preventDefault(); });
document.addEventListener("click", function(e){
  if(kbListeningBtn && !e.target.closest(".kbkey")){
    kbListeningBtn.classList.remove("listening"); kbListeningPath = null; kbListeningBtn = null; renderKbRoot();
  }
});

function renderKbRoot(){
  var root = document.getElementById("kbRoot");
  var groups = KB_SCHEMA.filter(function(g){ return g.tab === kbActiveTab; });
  root.innerHTML = groups.map(function(g, gi){
    var rows = g.rows.map(function(r, ri){
      var label=r[0], pPath=r[1], aPath=r[2];
      var pChip = pPath ? '<div class="kbchip"><button class="kbkey" data-path="'+pPath+'">'+kbLabel(kbGet(pPath))+'</button><button class="kbx" data-clear="'+pPath+'">×</button></div>' : '<div class="kbchip" style="width:96px"></div>';
      var aChip = aPath ? '<div class="kbchip"><button class="kbkey" data-path="'+aPath+'">'+kbLabel(kbGet(aPath))+'</button><button class="kbx" data-clear="'+aPath+'">×</button></div>' : '<div class="kbchip" style="width:96px"></div>';
      return '<div class="kbrow"><span class="kblabel">'+label+'</span>'+pChip+aChip+'</div>';
    }).join("");
    return '<div class="kbgroup"><div class="kbgroup-h">'+g.title+'</div>'+rows+'</div>';
  }).join("");

  root.querySelectorAll(".kbkey").forEach(function(btn){
    var code = kbGet(btn.getAttribute("data-path"));
    btn.classList.toggle("unbound", code===-1);
    btn.addEventListener("click", function(){ kbStartListen(btn, btn.getAttribute("data-path")); });
  });
  root.querySelectorAll(".kbx").forEach(function(btn){
    btn.addEventListener("click", function(){ kbSet(btn.getAttribute("data-clear"), -1); renderKbRoot(); });
  });
}

renderKbTabs();
renderKbRoot();

/* ---------------- presets ---------------- */
var PRESETS = {
  balanced:{
    // Display — interface / counters (health bar fix confirmed working)
    dynamicHPBars:true, showHitIndicators:true, showDeathMarkers:true, showDamage:true, dmgScale:1,
    showKillFeed:true, showKillCounter:true, showDeathCounter:true, showKDCounter:false,
    showScoreCounter:true, showStreakCounter:true, showPing:true, showFPS:true,
    nametagHealthNumber:true, nametagHealthColorTeam:"#00ff33", nametagHealthColorEnemy:"#a70101",
    nametagDisplay:"Everyone", showChatBox:"Always", showPlayerMessages:true,
    // Crosshair — clean and visible
    crosshairType:"Precision", crosshairAlwaysShow:true, crosshairDot:true,
    crosshairColor:"#ffffff", crosshairShadowColor:"#000000", crosshairSize:4, crosshairGap:0, crosshairThickness:0.15,
    hitmarkerShow:true, hitmarkerColor:"#40e0d0", hitmarkerKillColor:"#ff3355",
    // Sensitivity — neutral middle ground
    sensitivityX:1, sensitivityY:1, aimSensitivityX:1, aimSensitivityY:1, scrollDirection:true,
    // Game — FOV & weapon visibility
    fov:100, weaponFOV:130, hideWeaponADS:false, showHands:true, showPrimary:true, showSecondary:true, showMelee:true,
    // Render — good visuals, still smooth
    resolution:0.9, mapDetails:true, particles:true, shadows:true, ambientShading:true,
    muzzleFlash:true, bulletCasings:true, textureAnimations:true, objectAnimations:true,
    sniperFlap:true, sniperFlapAnimation:true, showExplosions:true, postProcessing:true,
    bulletTrails:true, yourTrails:true, screenShake:false, softShadows:false, highResShadows:false, dynamicShadows:false,
    lighting:"Normal",
    // Sound — comfortable levels
    masterVolume:0.5, weaponVolume:0.5, playerVolume:0.4, ambientVolume:0.2, uiVolume:0.3, cosmeticsVolume:0.3
  }
};

function applyPreset(name){
  if(name === "pro"){ applyRealPreset(REAL_PRO_JSON, "Pro/Competitive"); return; }
  if(name === "lowend"){ applyRealPreset(REAL_LOWEND_JSON, "Low-end PC"); return; }
  if(name === "balanced"){ applyBalancedPreset(); return; }
  if(name === "casual"){ applyRealPreset(REAL_CASUAL_JSON, "Casual"); return; }
  var p = PRESETS[name]; if(!p) return;
  Object.keys(p).forEach(function(id){
    var e = document.getElementById(id); if(!e) return;
    if(e.type==="checkbox"){ e.checked = !!p[id]; e.dispatchEvent(new Event("change")); }
    else { e.value = p[id]; if(e.type==="range") sync(id); }
  });
  toast("Applied preset: " + name);
}

/* Real exported Krunker "Pro" settings.json — uses Krunker's actual field
   names (showHitInd, crosshairSho, weaponLean, etc.), which don't match this
   form's field ids. Rather than lossy-map it onto the form, we output it
   verbatim so Import gets the exact real values. */
var REAL_PRO_JSON = {"defaultRegion":"sgp","resolution":1,"aspectRatio":"1280x1024","particles":false,"shadows":false,"ambientShading":false,"showTrails":false,"muzzleFlash":false,"bulletCasings":false,"impactHoles":false,"showHitInd":false,"showDMG":false,"dmgScale":0.5,"showDeaths":true,"showStreak":true,"showFPS":true,"showUnboxings":false,"crosshairSho":4,"crosshairImage":"https://assets.krunker.io/pro_crosshair.png?build=Bj8VItyzJjP6ZJqJhe4yXB6cMHkTIcQV","crosshairAlways":true,"crosshairShoM":4,"crosshairAlwaysM":true,"aimSensitivityX":0.69,"aimSensitivityY":0.69,"sound":0.1,"micVolume":0,"voiceVolume":0,"fov":110,"fpsFOV":105,"weaponBob":0.2,"weaponLean":2,"weaponOffX":1.4,"weaponOffY":2,"weaponOffZ":1.5,"hideADS":true,"scoreScale":0.6,"scoreOffY":2.5,"feedLimit":4,"useDamageOverlay":false,"killFx":false,"aimSensitivityX_0":0.69,"aimSensitivityY_0":0.69,"fov_0":110,"fpsFOV_0":105,"weaponBob_0":0.2,"weaponLean_0":2,"weaponOffX_0":1.4,"weaponOffY_0":2,"weaponOffZ_0":1.5,"hideADS_0":true,"aimSensitivityX_1":0.69,"aimSensitivityY_1":0.69,"fov_1":110,"fpsFOV_1":105,"weaponBob_1":0.2,"weaponLean_1":2,"weaponOffX_1":1.4,"weaponOffY_1":2,"weaponOffZ_1":1.5,"hideADS_1":true,"aimSensitivityX_2":0.69,"aimSensitivityY_2":0.69,"fov_2":110,"fpsFOV_2":105,"weaponBob_2":0.2,"weaponLean_2":2,"weaponOffX_2":1.4,"weaponOffY_2":2,"weaponOffZ_2":1.5,"hideADS_2":true,"aimSensitivityX_3":0.69,"aimSensitivityY_3":0.69,"fov_3":110,"fpsFOV_3":105,"weaponBob_3":0.2,"weaponLean_3":2,"weaponOffX_3":1.4,"weaponOffY_3":2,"weaponOffZ_3":1.5,"hideADS_3":true,"aimSensitivityX_4":0.69,"aimSensitivityY_4":0.69,"fov_4":110,"fpsFOV_4":105,"weaponBob_4":0.2,"weaponLean_4":2,"weaponOffX_4":1.4,"weaponOffY_4":2,"weaponOffZ_4":1.5,"hideADS_4":true,"aimSensitivityX_5":0.69,"aimSensitivityY_5":0.69,"fov_5":110,"fpsFOV_5":105,"weaponBob_5":0.2,"weaponLean_5":2,"weaponOffX_5":1.4,"weaponOffY_5":2,"weaponOffZ_5":1.5,"hideADS_5":true,"aimSensitivityX_6":0.69,"aimSensitivityY_6":0.69,"fov_6":110,"fpsFOV_6":105,"weaponBob_6":0.2,"weaponLean_6":2,"weaponOffX_6":1.4,"weaponOffY_6":2,"weaponOffZ_6":1.5,"hideADS_6":true,"aimSensitivityX_7":0.69,"aimSensitivityY_7":0.69,"fov_7":110,"fpsFOV_7":105,"weaponBob_7":0.2,"weaponLean_7":2,"weaponOffX_7":1.4,"weaponOffY_7":2,"weaponOffZ_7":1.5,"hideADS_7":true,"aimSensitivityX_8":0.69,"aimSensitivityY_8":0.69,"fov_8":110,"fpsFOV_8":105,"weaponBob_8":0.2,"weaponLean_8":2,"weaponOffX_8":1.4,"weaponOffY_8":2,"weaponOffZ_8":1.5,"hideADS_8":true,"aimSensitivityX_9":0.69,"aimSensitivityY_9":0.69,"fov_9":110,"fpsFOV_9":105,"weaponBob_9":0.2,"weaponLean_9":2,"weaponOffX_9":1.4,"weaponOffY_9":2,"weaponOffZ_9":1.5,"hideADS_9":true,"aimSensitivityX_10":0.69,"aimSensitivityY_10":0.69,"fov_10":110,"fpsFOV_10":105,"weaponBob_10":0.2,"weaponLean_10":2,"weaponOffX_10":1.4,"weaponOffY_10":2,"weaponOffZ_10":1.5,"hideADS_10":true,"aimSensitivityX_11":0.69,"aimSensitivityY_11":0.69,"fov_11":110,"fpsFOV_11":105,"weaponBob_11":0.2,"weaponLean_11":2,"weaponOffX_11":1.4,"weaponOffY_11":2,"weaponOffZ_11":1.5,"hideADS_11":true,"aimSensitivityX_12":0.69,"aimSensitivityY_12":0.69,"fov_12":110,"fpsFOV_12":105,"weaponBob_12":0.2,"weaponLean_12":2,"weaponOffX_12":1.4,"weaponOffY_12":2,"weaponOffZ_12":1.5,"hideADS_12":true,"aimSensitivityX_13":0.69,"aimSensitivityY_13":0.69,"fov_13":110,"fpsFOV_13":105,"weaponBob_13":0.2,"weaponLean_13":2,"weaponOffX_13":1.4,"weaponOffY_13":2,"weaponOffZ_13":1.5,"hideADS_13":true,"aimSensitivityX_14":0.69,"aimSensitivityY_14":0.69,"fov_14":110,"fpsFOV_14":105,"weaponBob_14":0.2,"weaponLean_14":2,"weaponOffX_14":1.4,"weaponOffY_14":2,"weaponOffZ_14":1.5,"hideADS_14":true,"aimSensitivityX_15":0.69,"aimSensitivityY_15":0.69,"fov_15":110,"fpsFOV_15":105,"weaponBob_15":0.2,"weaponLean_15":2,"weaponOffX_15":1.4,"weaponOffY_15":2,"weaponOffZ_15":1.5,"hideADS_15":true,"aimSensitivityX_16":0.69,"aimSensitivityY_16":0.69,"fov_16":110,"fpsFOV_16":105,"weaponBob_16":0.2,"weaponLean_16":2,"weaponOffX_16":1.4,"weaponOffY_16":2,"weaponOffZ_16":1.5,"hideADS_16":true,"aimSensitivityX_17":0.69,"aimSensitivityY_17":0.69,"fov_17":110,"fpsFOV_17":105,"weaponBob_17":0.2,"weaponLean_17":2,"weaponOffX_17":1.4,"weaponOffY_17":2,"weaponOffZ_17":1.5,"hideADS_17":true,"aimSensitivityX_18":0.69,"aimSensitivityY_18":0.69,"fov_18":110,"fpsFOV_18":105,"weaponBob_18":0.2,"weaponLean_18":2,"weaponOffX_18":1.4,"weaponOffY_18":2,"weaponOffZ_18":1.5,"hideADS_18":true,"aimSensitivityX_19":0.69,"aimSensitivityY_19":0.69,"fov_19":110,"fpsFOV_19":105,"weaponBob_19":0.2,"weaponLean_19":2,"weaponOffX_19":1.4,"weaponOffY_19":2,"weaponOffZ_19":1.5,"hideADS_19":true,"aimSensitivityX_20":0.69,"aimSensitivityY_20":0.69,"fov_20":110,"fpsFOV_20":105,"weaponBob_20":0.2,"weaponLean_20":2,"weaponOffX_20":1.4,"weaponOffY_20":2,"weaponOffZ_20":1.5,"hideADS_20":true,"aimSensitivityX_21":0.69,"aimSensitivityY_21":0.69,"fov_21":110,"fpsFOV_21":105,"weaponBob_21":0.2,"weaponLean_21":2,"weaponOffX_21":1.4,"weaponOffY_21":2,"weaponOffZ_21":1.5,"hideADS_21":true,"aimSensitivityX_22":0.69,"aimSensitivityY_22":0.69,"fov_22":110,"fpsFOV_22":105,"weaponBob_22":0.2,"weaponLean_22":2,"weaponOffX_22":1.4,"weaponOffY_22":2,"weaponOffZ_22":1.5,"hideADS_22":true,"aimSensitivityX_23":0.69,"aimSensitivityY_23":0.69,"fov_23":110,"fpsFOV_23":105,"weaponBob_23":0.2,"weaponLean_23":2,"weaponOffX_23":1.4,"weaponOffY_23":2,"weaponOffZ_23":1.5,"hideADS_23":true,"aimSensitivityX_24":0.69,"aimSensitivityY_24":0.69,"fov_24":110,"fpsFOV_24":105,"weaponBob_24":0.2,"weaponLean_24":2,"weaponOffX_24":1.4,"weaponOffY_24":2,"weaponOffZ_24":1.5,"hideADS_24":true,"aimSensitivityX_25":0.69,"aimSensitivityY_25":0.69,"fov_25":110,"fpsFOV_25":105,"weaponBob_25":0.2,"weaponLean_25":2,"weaponOffX_25":1.4,"weaponOffY_25":2,"weaponOffZ_25":1.5,"hideADS_25":true,"aimSensitivityX_26":0.69,"aimSensitivityY_26":0.69,"fov_26":110,"fpsFOV_26":105,"weaponBob_26":0.2,"weaponLean_26":2,"weaponOffX_26":1.4,"weaponOffY_26":2,"weaponOffZ_26":1.5,"hideADS_26":true,"aimSensitivityX_27":0.69,"aimSensitivityY_27":0.69,"fov_27":110,"fpsFOV_27":105,"weaponBob_27":0.2,"weaponLean_27":2,"weaponOffX_27":1.4,"weaponOffY_27":2,"weaponOffZ_27":1.5,"hideADS_27":true,"aimSensitivityX_28":0.69,"aimSensitivityY_28":0.69,"fov_28":110,"fpsFOV_28":105,"weaponBob_28":0.2,"weaponLean_28":2,"weaponOffX_28":1.4,"weaponOffY_28":2,"weaponOffZ_28":1.5,"hideADS_28":true,"aimSensitivityX_29":0.69,"aimSensitivityY_29":0.69,"fov_29":110,"fpsFOV_29":105,"weaponBob_29":0.2,"weaponLean_29":2,"weaponOffX_29":1.4,"weaponOffY_29":2,"weaponOffZ_29":1.5,"hideADS_29":true,"aimSensitivityX_30":0.69,"aimSensitivityY_30":0.69,"fov_30":110,"fpsFOV_30":105,"weaponBob_30":0.2,"weaponLean_30":2,"weaponOffX_30":1.4,"weaponOffY_30":2,"weaponOffZ_30":1.5,"hideADS_30":true,"controls":{"toggleSets":[-1,-1,-1,-1,-1,-1]}};

function applyBalancedPreset(){
  var p = PRESETS.balanced;
  Object.keys(p).forEach(function(id){
    var e = document.getElementById(id); if(!e) return;
    if(e.type==="checkbox"){ e.checked = !!p[id]; e.dispatchEvent(new Event("change")); }
    else { e.value = p[id]; if(e.type==="range") sync(id); }
  });
  toast("Applied preset: balanced");
}

function applyRealProPreset(){
  applyRealPreset(REAL_PRO_JSON, "Pro/Competitive");
}

var REAL_LOWEND_JSON = {"defaultRegion":"sgp","resolution":0.4,"lowSpec":true,"noTex":true,"mapDet":false,"particles":false,"shadows":false,"ambientShading":false,"showTrails":false,"yourTrails":false,"muzzleFlash":false,"bulletCasings":false,"impactHoles":false,"textureAnim":false,"objectAnim":false,"noPaintAnim":true,"screenShake":false,"lighting":0,"scaleUI":1,"dynamicHP":false,"showHitInd":false,"showDMG":false,"showMedals":false,"playMedals":false,"sound":0.1,"weaponBob":0,"weaponLean":0,"aimAnim":false,"hideADS":true,"bulletTracers":false,"useDamageOverlay":false,"weaponBob_0":0,"weaponLean_0":0,"aimAnim_0":false,"hideADS_0":true,"weaponBob_1":0,"weaponLean_1":0,"aimAnim_1":false,"hideADS_1":true,"weaponBob_2":0,"weaponLean_2":0,"aimAnim_2":false,"hideADS_2":true,"weaponBob_3":0,"weaponLean_3":0,"aimAnim_3":false,"hideADS_3":true,"weaponBob_4":0,"weaponLean_4":0,"aimAnim_4":false,"hideADS_4":true,"weaponBob_5":0,"weaponLean_5":0,"aimAnim_5":false,"hideADS_5":true,"weaponBob_6":0,"weaponLean_6":0,"aimAnim_6":false,"hideADS_6":true,"weaponBob_7":0,"weaponLean_7":0,"aimAnim_7":false,"hideADS_7":true,"weaponBob_8":0,"weaponLean_8":0,"aimAnim_8":false,"hideADS_8":true,"weaponBob_9":0,"weaponLean_9":0,"aimAnim_9":false,"hideADS_9":true,"weaponBob_10":0,"weaponLean_10":0,"aimAnim_10":false,"hideADS_10":true,"weaponBob_11":0,"weaponLean_11":0,"aimAnim_11":false,"hideADS_11":true,"weaponBob_12":0,"weaponLean_12":0,"aimAnim_12":false,"hideADS_12":true,"weaponBob_13":0,"weaponLean_13":0,"aimAnim_13":false,"hideADS_13":true,"weaponBob_14":0,"weaponLean_14":0,"aimAnim_14":false,"hideADS_14":true,"weaponBob_15":0,"weaponLean_15":0,"aimAnim_15":false,"hideADS_15":true,"weaponBob_16":0,"weaponLean_16":0,"aimAnim_16":false,"hideADS_16":true,"weaponBob_17":0,"weaponLean_17":0,"aimAnim_17":false,"hideADS_17":true,"weaponBob_18":0,"weaponLean_18":0,"aimAnim_18":false,"hideADS_18":true,"weaponBob_19":0,"weaponLean_19":0,"aimAnim_19":false,"hideADS_19":true,"weaponBob_20":0,"weaponLean_20":0,"aimAnim_20":false,"hideADS_20":true,"weaponBob_21":0,"weaponLean_21":0,"aimAnim_21":false,"hideADS_21":true,"weaponBob_22":0,"weaponLean_22":0,"aimAnim_22":false,"hideADS_22":true,"weaponBob_23":0,"weaponLean_23":0,"aimAnim_23":false,"hideADS_23":true,"weaponBob_24":0,"weaponLean_24":0,"aimAnim_24":false,"hideADS_24":true,"weaponBob_25":0,"weaponLean_25":0,"aimAnim_25":false,"hideADS_25":true,"weaponBob_26":0,"weaponLean_26":0,"aimAnim_26":false,"hideADS_26":true,"weaponBob_27":0,"weaponLean_27":0,"aimAnim_27":false,"hideADS_27":true,"weaponBob_28":0,"weaponLean_28":0,"aimAnim_28":false,"hideADS_28":true,"weaponBob_29":0,"weaponLean_29":0,"aimAnim_29":false,"hideADS_29":true,"weaponBob_30":0,"weaponLean_30":0,"aimAnim_30":false,"hideADS_30":true,"controls":{"toggleSets":[-1,-1,-1,-1,-1,-1]}};

var REAL_CASUAL_JSON = {"netRate":"4","rawMouse":true,"flickClamp":500,"mouseFlick":true,"resolution":1,"aspectRatio":"3840x2160","lowSpec":true,"particles":false,"particlesDist":1000,"shadows":false,"ambientShading":false,"muzzleFlash":false,"bulletCasings":false,"impactHoles":false,"sniperFlap":true,"screenShake":false,"postProcessing":false,"scaleUI":0.5,"oldScoreboard":true,"dynamicHP":false,"deathMarkers":"3","dmgColor":"#fff700","critColor":"#400080","dmgScale":0.6,"showKillC":true,"showDeaths":true,"showKD":true,"showScore":true,"showStreak":true,"showFPS":true,"fpsRate":0,"showSpeed":true,"speedOffX":4.8,"speedOffY":4.7,"healthNum":true,"healthColT":"#00ff33","healthColE":"#a70101","adsObjOpac":0,"hideNonTrade":true,"showMedals":false,"chatBGOp":0,"chatHeight":5,"crosshairSho":"5","crosshairStyle":"4","crosshairImage":"https://i.imgur.com/yeo7d8D.png","crosshairUseOpacity":true,"crosshairAlways":true,"crosshairShadow":"#ffffff","crosshairShadowThickess":1.9,"crosshairThick":0.1,"crosshairLen":4,"crosshairGap":-5,"hitmCol":"#00ffc8","hitmKCol":"#ff0000","hitmLen":23,"hitmThick":3.5,"hitmSpac":5,"hitmAnimD":0.3,"hitmAnimS":0.001,"hitmFad":0.01,"sensitivityX":0.5,"sensitivityY":0.5,"aimSensitivityX":0.5,"aimSensitivityY":0.5,"scrollDir":false,"sound":0.5,"ambientVolume":0,"dialogueVolume":0,"audioInput":"72e986875e0faeb7c4bc3417cbeff06299851e72b699a2ec523d66034e3d086b","micVolume":0,"voiceVolume":0,"gunsVolume":0.4,"playerVolume":0.21,"skinVolume":0,"uiVolume":0,"assetVolume":0,"fpsFOV":150,"weaponBob":0,"weaponLean":0.3,"weaponOffY":2,"weaponOffZ":0.7,"weaponADSOffY":0,"adsFovMlt":0,"aimAnim":false,"hideADS":true,"hudHealthHigh":"#00bfff","hudHealthLow":"#fe4848","spdLinesCol":"#cfbfff","scoreColor":"#ffdd00","scoreScale":0.9,"saturationn":0.7,"bulletTracerCol":"#d4a8ff","trailCol":"#ffb8f9","canChangeLogo":false,"autoLoadLast":true,"scopeBorders":false,"scopeWidth":10,"scopeHeight":10,"scopeOpac":0,"reticleWidth":1.4,"reticleHeight":1.4,"useDamageOverlay":false,"killFx":false,"fov_0":90,"fpsFOV_0":80,"weaponBob_0":0,"weaponLean_0":0.1,"weaponOffX_0":1.7,"weaponOffY_0":3.4,"weaponOffZ_0":1.4,"weaponADSOffY_0":0,"aimAnim_0":false,"fov_1":90,"fpsFOV_1":80,"weaponBob_1":0,"weaponLean_1":0.1,"weaponOffX_1":1.7,"weaponOffY_1":3.4,"weaponOffZ_1":1.4,"weaponADSOffY_1":0,"adsFovMlt_1":0.3,"aimAnim_1":false,"fov_2":90,"fpsFOV_2":80,"weaponBob_2":0,"weaponLean_2":0.1,"weaponOffX_2":1.7,"weaponOffY_2":3.4,"weaponOffZ_2":1.4,"weaponADSOffY_2":0,"adsFovMlt_2":0.3,"aimAnim_2":false,"fov_3":90,"fpsFOV_3":80,"weaponBob_3":0,"weaponLean_3":0.1,"weaponOffX_3":1.7,"weaponOffY_3":3.4,"weaponOffZ_3":1.4,"weaponADSOffY_3":0,"adsFovMlt_3":0.3,"aimAnim_3":false,"fov_4":90,"fpsFOV_4":80,"weaponBob_4":0,"weaponLean_4":0.1,"weaponOffX_4":1.7,"weaponOffY_4":3.4,"weaponOffZ_4":1.4,"weaponADSOffY_4":0,"adsFovMlt_4":0.3,"aimAnim_4":false,"fov_5":90,"fpsFOV_5":80,"weaponBob_5":0,"weaponLean_5":0.1,"weaponOffX_5":1.7,"weaponOffY_5":3.4,"weaponOffZ_5":1.4,"weaponADSOffY_5":0,"adsFovMlt_5":0.3,"aimAnim_5":false,"fov_6":90,"fpsFOV_6":80,"weaponBob_6":0,"weaponLean_6":0.1,"weaponOffX_6":1.7,"weaponOffY_6":3.4,"weaponOffZ_6":1.4,"weaponADSOffY_6":0,"adsFovMlt_6":0.3,"aimAnim_6":false,"fov_7":90,"fpsFOV_7":80,"weaponBob_7":0,"weaponLean_7":0.1,"weaponOffX_7":1.7,"weaponOffY_7":3.4,"weaponOffZ_7":1.4,"weaponADSOffY_7":0,"aimAnim_7":false,"fov_8":90,"fpsFOV_8":80,"weaponBob_8":0,"weaponLean_8":0.1,"weaponOffX_8":1.7,"weaponOffY_8":3.4,"weaponOffZ_8":1.4,"weaponADSOffY_8":0,"adsFovMlt_8":0.3,"aimAnim_8":false,"fov_9":90,"fpsFOV_9":80,"weaponBob_9":0,"weaponLean_9":0.1,"weaponOffX_9":1.7,"weaponOffY_9":3.4,"weaponOffZ_9":1.4,"weaponADSOffY_9":0,"adsFovMlt_9":0.3,"aimAnim_9":false,"fov_10":90,"fpsFOV_10":80,"weaponBob_10":0,"weaponLean_10":0.1,"weaponOffX_10":1.7,"weaponOffY_10":3.4,"weaponOffZ_10":1.4,"weaponADSOffY_10":0,"adsFovMlt_10":0.3,"aimAnim_10":false,"fov_11":90,"fpsFOV_11":80,"weaponBob_11":0,"weaponLean_11":0.1,"weaponOffX_11":1.7,"weaponOffY_11":3.4,"weaponOffZ_11":1.4,"weaponADSOffY_11":0,"adsFovMlt_11":0.3,"aimAnim_11":false,"fov_12":90,"fpsFOV_12":80,"weaponBob_12":0,"weaponLean_12":0.1,"weaponOffX_12":1.7,"weaponOffY_12":3.4,"weaponOffZ_12":1.4,"weaponADSOffY_12":0,"aimAnim_12":false,"fov_13":90,"fpsFOV_13":80,"weaponBob_13":0,"weaponLean_13":0.1,"weaponOffX_13":1.7,"weaponOffY_13":3.4,"weaponOffZ_13":1.4,"weaponADSOffY_13":0,"adsFovMlt_13":0.4,"aimAnim_13":false,"fov_14":90,"fpsFOV_14":80,"weaponBob_14":0,"weaponLean_14":0.1,"weaponOffX_14":1.7,"weaponOffY_14":3.4,"weaponOffZ_14":1.4,"weaponADSOffY_14":0,"adsFovMlt_14":0.3,"aimAnim_14":false,"fov_15":90,"fpsFOV_15":80,"weaponBob_15":0,"weaponLean_15":0.1,"weaponOffX_15":1.7,"weaponOffY_15":3.4,"weaponOffZ_15":1.4,"weaponADSOffY_15":0,"adsFovMlt_15":0.4,"aimAnim_15":false,"fov_16":90,"fpsFOV_16":80,"weaponBob_16":0,"weaponLean_16":0.1,"weaponOffX_16":1.7,"weaponOffY_16":3.4,"weaponOffZ_16":1.4,"weaponADSOffY_16":0,"adsFovMlt_16":0.6,"aimAnim_16":false,"fov_17":90,"fpsFOV_17":80,"weaponBob_17":0,"weaponLean_17":0.1,"weaponOffX_17":1.7,"weaponOffY_17":3.4,"weaponOffZ_17":1.4,"weaponADSOffY_17":0,"aimAnim_17":false,"fov_18":90,"fpsFOV_18":80,"weaponBob_18":0,"weaponLean_18":0.1,"weaponOffX_18":1.7,"weaponOffY_18":3.4,"weaponOffZ_18":1.4,"weaponADSOffY_18":0,"adsFovMlt_18":0.4,"aimAnim_18":false,"fov_19":90,"fpsFOV_19":80,"weaponBob_19":0,"weaponLean_19":0.1,"weaponOffX_19":1.7,"weaponOffY_19":3.4,"weaponOffZ_19":1.4,"weaponADSOffY_19":0,"aimAnim_19":false,"fov_20":90,"fpsFOV_20":80,"weaponBob_20":0,"weaponLean_20":0.1,"weaponOffX_20":1.7,"weaponOffY_20":3.4,"weaponOffZ_20":1.4,"weaponADSOffY_20":0,"aimAnim_20":false,"fov_21":90,"fpsFOV_21":85,"weaponBob_21":0,"weaponLean_21":0,"weaponOffX_21":1.7,"weaponOffY_21":3.4,"weaponOffZ_21":1.4,"adsFovMlt_21":0.3,"aimAnim_21":false,"fov_27":90,"adsFovMlt_27":0.3,"controls":{"primKey":-1,"reloadKey":-1,"reloadKey_alt":82,"jumpKey":-1,"jumpKey_alt":32,"pListKey":192,"pListKey_alt":18,"sBoardKey":-1,"sBoardKey_alt":9,"interactKey":69,"interactKey_alt":67,"confirmKey":74,"confirmKey_alt":75,"interactSecKey":71,"interactSecKey_alt":72,"resetKey_alt":66,"resetLastKey_alt":78,"sprayKey":32,"sprayKey_alt":70,"sprayWheelKey":-1,"inspKey_alt":81,"swapKey":-1,"swapKey_alt":84,"shoot1Key_alt":-1,"aim1Key":-1,"aim1Key_alt":10003,"crouchKey":-1,"crouchKey_alt":16,"meleeKey":-1,"meleeKey_alt":81,"equipKey":-1,"equipKey_alt":67,"chatKey_alt":27,"voiceKey":-1,"voiceKey_alt":86,"dropKey":66,"dropKey_alt":90,"wepVisKey":17,"wepVisKey_alt":17,"kickVoteYKey":89,"kickVoteYKey_alt":49,"kickVoteNKey":78,"kickVoteNKey_alt":50,"specFreeKey":-1,"specFreeKey_alt":67,"specObjKey":-1,"specObjKey_alt":72,"specFirstKey":74,"specFirstKey_alt":82,"specNamesKey":-1,"specNamesKey_alt":86,"specMiniMap":-1,"specMiniMap_alt":192,"kpdVoteYKey":-1,"kpdVoteYKey_alt":10004,"kpdVoteNKey":-1,"kpdVoteNKey_alt":10005,"specFocusKey":80,"specFocusKey_alt":10002,"kpdVisionKey":-1,"kpdVisionKey_alt":110,"propKey":-1,"propKey_alt":70,"propRandKey":-1,"propRandKey_alt":77,"propRotKey":-1,"propRotKey_alt":82,"propRotRKey":-1,"propRotRKey_alt":78,"sandboxNoclip":97,"sandboxNoclip_alt":38,"sandboxGodMode":96,"sandboxGodMode_alt":90,"sandboxSmite":80,"sandboxSmite_alt":190,"sandboxUnlimited":10002,"sandboxUnlimited_alt":86,"sandboxKill":75,"sandboxKill_alt":48,"sandboxSpawnBot":-1,"sandboxClearBots":-1,"markPositionKey":-1,"streakKeys":[-1,-1,-1],"streakKeys_alt":[49,50,51],"tauntKeys":[-1,-1,-1,-1,-1,-1],"tauntKeys_alt":[49,50,51,52,53,54],"moveKeys":[-1,-1,-1,-1],"moveKeys_alt":[87,83,65,68],"toggleKeys":[86,20000,67,188,17,20000],"toggleKeys_alt":[88,71,10002,66,52,112],"premiumKeys":[78,79,97,9],"premiumKeys_alt":[78,77,75,10001],"messageKeys":[85,73,99,83,65,68],"messageKeys_alt":[85,10003,65,83,68,82],"toggleSets":[-1,-1,-1,-1,-1,-1]},"customize":{"reticles":[["OLD","https://media.discordapp.net/attachments/475377117765304320/729879584849395773/mycross.png"],["white","https://media.discordapp.net/attachments/641164229734301707/653143792265986048/dot_1.png"]],"scopes":[["OLD","https://files.catbox.moe/iswkpa.png"]],"images":[["trigga","https://media.discordapp.net/attachments/691789332901527613/691789755997749318/sukaks2.png"],["og","https://i.imgur.com/TJRVZI9.png"],["majin","https://cdn.discordapp.com/attachments/621591162201047041/761276223112085585/Majin4ch_-_Copy_2.png"],["dot","https://cdn.discordapp.com/attachments/534605399287136257/601700542196088833/dot.png"],["PinkPop","https://cdn.discordapp.com/attachments/798811073632665601/803226715123613756/gold_xhair.png"],["daemon","https://cdn.discordapp.com/attachments/798811073632665601/853485755312373780/disposedcross.png"],["green gap","https://media.discordapp.net/attachments/763234392750817323/773348746192879636/cross.png"],["red","https://media.discordapp.net/attachments/466423176595898389/620303489989345291/redch.png"],["uno","https://cdn.discordapp.com/attachments/798811073632665601/901488379038953512/crosshair3.png"],["m2ch","https://cdn.discordapp.com/attachments/798811073632665601/889709320906899477/green_m2ch.png"],["sdada","https://cdn.discordapp.com/attachments/798811073632665601/889709320906899477/green_m2ch.png?ex=66d08ea0&is=66cf3d20&hm=269236fc3b1fb632a21437f5b91433bec979d4a9bec3a7b84a6c9ea8c82f994b&",0]],"favorites":[2373],"loadouts":{"Preset1":{"skinColIndex":-1,"hairCol":-1,"chatCol":-1,"dyeIndex":-1,"faceIndex":-1,"shoeIndex":-1,"attachIndex":-1,"reticleIndex":-1,"savedReticle":"","scopeIndex":-1,"savedScope":"","meleeIndex":-1,"backIndex":-1,"hatIndex":-1,"waistIndex":-1,"secondaryInd":10,"kcStatIndex":-1,"classindex":12,"skins":"{}"}}}};

function applyRealPreset(json, label){
  window.__gen = JSON.stringify(json);
  document.getElementById("fieldCount").textContent = Object.keys(json).length + " fields (real export)";
  var w = document.getElementById("outWrap");
  w.innerHTML = '<div class="pre-actions"><button onclick="copyOut()">Copy</button><button onclick="downloadOut()">Download</button></div><pre id="codeBox"></pre>';
  document.getElementById("codeBox").textContent = window.__gen;
  toast("Loaded real " + label + " export");
}

/* ---------------- read / build / generate ---------------- */
function readCfg(){
  var out = {};
  ALL_IDS.forEach(function(id){
    var e = document.getElementById(id); if(!e) return;
    if(e.type==="checkbox"){ out[id] = e.checked; }
    else if(e.type==="range"){ out[id] = parseFloat(e.value); }
    else { out[id] = e.value; }
  });
  return out;
}

/* Builds the real settings.json object: confirmed fields use their real
   Krunker key; unconfirmed fields are prefixed "guess_" so it's obvious
   in the exported JSON which values Krunker will actually read. */
function buildRealOutput(cfg){
  var out = {};
  Object.keys(cfg).forEach(function(id){
    var val = cfg[id];
    if(ENUM_TRANSFORMS[id]){
      var idx = ENUM_TRANSFORMS[id].indexOf(val);
      val = idx === -1 ? val : idx;
    }
    var key = REAL_KEY_MAP[id] || ("guess_" + id);
    out[key] = val;
  });
  return out;
}

function generate(){
  var cfg = readCfg();
  var obj = buildRealOutput(cfg);
  obj.controls = JSON.parse(JSON.stringify(KB_STATE)); // deep clone, confirmed real shape
  var gen = JSON.stringify(obj, null, 0);
  window.__gen = gen;
  var confirmed = 0, guessed = 0;
  Object.keys(obj).forEach(function(k){ if(k.indexOf("guess_")===0) guessed++; else confirmed++; });
  document.getElementById("fieldCount").textContent = confirmed + " confirmed, " + guessed + " unverified";
  var w = document.getElementById("outWrap");
  w.innerHTML = '<div class="pre-actions"><button onclick="copyOut()">Copy</button><button onclick="downloadOut()">Download</button></div><pre id="codeBox"></pre>';
  document.getElementById("codeBox").textContent = gen;
  toast("Generated (" + guessed + " fields unverified)");
}
function copyOut(){ navigator.clipboard.writeText(window.__gen||"").then(function(){ toast("Copied to clipboard"); }); }
function downloadOut(){
  var b = new Blob([window.__gen||""], {type:"application/json"});
  var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "krunker-settings.txt"; a.click(); URL.revokeObjectURL(a.href);
}

/* ---------------- save / load / import ---------------- */
var LS_PREFIX = "settingsBuilderV2::";
var REVERSE_KEY_MAP = {};
Object.keys(REAL_KEY_MAP).forEach(function(id){ REVERSE_KEY_MAP[REAL_KEY_MAP[id]] = id; });

function val(id){ var e=document.getElementById(id); return e?e.value:""; }
function parseJSONSafe(raw){ try{ return JSON.parse(raw); }catch(e){ return null; } }

/* Accepts three shapes: (1) our own saved state (internal ids as keys),
   (2) a real Krunker settings.json (real keys — reverse-mapped back to
   internal ids), (3) our own "guess_xxx" prefixed output (unwrapped). */
function importState(f){
  if(!f || typeof f!=="object"){ toast("Bad config"); return false; }
  var applied = 0;
  Object.keys(f).forEach(function(k){
    if(k === "controls" && f.controls && typeof f.controls === "object"){
      Object.keys(f.controls).forEach(function(ck){ if(ck in KB_STATE) KB_STATE[ck] = f.controls[ck]; });
      renderKbRoot();
      applied++;
      return;
    }
    var id = k;
    if(document.getElementById(k)){ id = k; }
    else if(REVERSE_KEY_MAP[k]){ id = REVERSE_KEY_MAP[k]; }
    else if(k.indexOf("guess_")===0 && document.getElementById(k.slice(6))){ id = k.slice(6); }
    else { return; }
    var e = document.getElementById(id); if(!e) return;
    var v = f[k];
    if(ENUM_TRANSFORMS[id] && typeof v === "number"){ v = ENUM_TRANSFORMS[id][v]; if(v===undefined) return; }
    if(e.type==="checkbox"){ e.checked=!!v; e.dispatchEvent(new Event("change")); }
    else { e.value=v; if(e.type==="range") sync(id); }
    applied++;
  });
  if(applied === 0){ toast("No matching fields found"); return false; }
  return true;
}
function importPaste(){
  var st = parseJSONSafe(val("importBox"));
  if(!st){ toast("Invalid JSON"); return; }
  if(importState(st)){ document.getElementById("importBox").value=""; toast("Imported — press Generate"); }
}
function saveLocal(){
  var name = (val("presetName")||"").trim(); if(!name){ toast("Enter a preset name first"); return; }
  try{ localStorage.setItem(LS_PREFIX+name, JSON.stringify({name:name, fields:readCfg()})); }catch(e){ toast("Save failed"); return; }
  refreshSavedList(name); toast('Saved "'+name+'"');
}
function loadLocal(){
  var name = document.getElementById("savedList").value; if(!name) return;
  var st = parseJSONSafe(localStorage.getItem(LS_PREFIX+name)); if(!st){ toast("Could not read save"); return; }
  if(importState(st.fields||st)){ document.getElementById("presetName").value = st.name||name; toast('Loaded "'+name+'" — press Generate'); }
}
function deleteLocal(){
  var name = document.getElementById("savedList").value; if(!name){ toast("Pick a saved preset"); return; }
  localStorage.removeItem(LS_PREFIX+name); refreshSavedList(); toast('Deleted "'+name+'"');
}
function refreshSavedList(sel){
  var names = [];
  for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(k && k.indexOf(LS_PREFIX)===0) names.push(k.slice(LS_PREFIX.length)); }
  names.sort();
  var s = document.getElementById("savedList");
  s.innerHTML = '<option value="">— saved presets ('+names.length+') —</option>' + names.map(function(n){
    return '<option value="'+n.replace(/"/g,"")+'">'+n+'</option>';
  }).join("");
  if(sel) s.value = sel;
}

var toastT;
function toast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove("show"); }, 1600);
}

refreshSavedList();
document.getElementById("verTag").textContent = "v" + VERSION;
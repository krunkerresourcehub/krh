var cgs_global;  // global source of truth for cgs
var update_cgs = true;  // whether to fetch cgs next time
var show_pubs = false;  // whether to show public lobbies

var latest_mode_type = null;
var latest_regions_group = null;

var last_cgs_error = null;   // human-readable reason the last fetch failed, for debugging
var active_source = null;    // index of the source that worked last time

// How long to wait on one source before giving up and trying the next one.
// Without this, a proxy that accepts the connection but never answers leaves
// the page stuck on "Loading..." forever.
const CGS_TIMEOUT_MS = 7000;

// The original upstream (krunk.infinitifall.net) was just a mirror of Krunker's
// own matchmaker endpoint. The mirror is dead, so we read the matchmaker
// directly. Krunker doesn't always send CORS headers, so if the direct call is
// blocked we fall through a list of public CORS proxies.
const KRUNKER_GAME_LIST = "https://matchmaker.krunker.io/game-list?hostname=krunker.io";

// Set this to your own proxy (see worker.js) and it gets tried first.
var custom_proxy = "https://krunkerservers.knlvx-aura.workers.dev";

const cgs_sources = [
    {
        name: "krunker matchmaker (direct)",
        url: function () { return KRUNKER_GAME_LIST + "&_=" + Date.now(); },
        parse: async function (response) { return await response.json(); }
    },
    {
        name: "allorigins (raw)",
        url: function () {
            return "https://api.allorigins.win/raw?url=" + encodeURIComponent(KRUNKER_GAME_LIST + "&_=" + Date.now());
        },
        parse: async function (response) { return await response.json(); }
    },
    {
        name: "codetabs",
        url: function () {
            return "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(KRUNKER_GAME_LIST + "&_=" + Date.now());
        },
        parse: async function (response) { return await response.json(); }
    },
    {
        name: "corsproxy.io",
        url: function () {
            return "https://corsproxy.io/?url=" + encodeURIComponent(KRUNKER_GAME_LIST + "&_=" + Date.now());
        },
        parse: async function (response) { return await response.json(); }
    },
    {
        name: "allorigins (wrapped)",
        url: function () {
            return "https://api.allorigins.win/get?url=" + encodeURIComponent(KRUNKER_GAME_LIST + "&_=" + Date.now());
        },
        parse: async function (response) {
            let wrapped = await response.json();
            return JSON.parse(wrapped.contents);
        }
    }
];

if (custom_proxy != "") {
    cgs_sources.unshift({
        name: "custom proxy",
        url: function () { return custom_proxy + (custom_proxy.indexOf("?") == -1 ? "?" : "&") + "_=" + Date.now(); },
        parse: async function (response) { return await response.json(); }
    });
}

/**
 * Write a one-line status into the table area, so a slow fetch is visible
 *
 * @param {String} text Message to show
 */
function set_loading_status(text) {
    let table = document.getElementById("cgs");
    if (table != null) { table.innerHTML = text; }
}

/**
 * Accept either {"games": [...]} or a bare array, always return {"games": [...]}
 *
 * @param {Object} data Raw parsed payload
 */
function normalize_cgs(data) {
    if (data && Array.isArray(data.games)) { return data; }
    if (Array.isArray(data)) { return { games: data }; }
    return null;
}

/**
 * Try one source once, return normalized data or null
 *
 * @param {Object} source An entry of cgs_sources
 */
async function try_cgs_source(source) {
    let response;
    let controller = new AbortController();
    let timer = setTimeout(function () { controller.abort(); }, CGS_TIMEOUT_MS);

    try {
        response = await fetch(source.url(), { cache: "no-store", signal: controller.signal });
    } catch (e) {
        clearTimeout(timer);
        if (e.name == "AbortError") {
            last_cgs_error = source.name + ": timed out after " + (CGS_TIMEOUT_MS / 1000) + "s";
        } else {
            last_cgs_error = source.name + ": network/CORS error (" + e.message + ")";
        }
        return null;
    }
    clearTimeout(timer);

    if (response.status != 200) {
        last_cgs_error = source.name + ": HTTP " + response.status;
        return null;
    }

    let data;
    try {
        data = await source.parse(response);
    } catch (e) {
        last_cgs_error = source.name + ": bad JSON (" + e.message + ")";
        return null;
    }

    data = normalize_cgs(data);
    if (data == null || data.games.length == 0) {
        last_cgs_error = source.name + ": responded, but the lobby list was empty";
        return null;
    }

    return data;
}

/**
 * Update cgs_global by fetching cgs from the first source that works
 */
async function update_cgs_global() {
    // start from whichever source worked last time, then wrap around
    let order = new Array();
    for (let i = 0; i < cgs_sources.length; i++) {
        order.push(((active_source == null ? 0 : active_source) + i) % cgs_sources.length);
    }

    let errors = new Array();
    for (let i = 0; i < order.length; i++) {
        let source = cgs_sources[order[i]];
        set_loading_status("Loading... (" + (i + 1) + "/" + order.length + ": " + source.name + ")");

        let data = await try_cgs_source(source);
        if (data != null) {
            cgs_global = data;
            active_source = order[i];
            last_cgs_error = null;
            console.log("KBrowser: " + data.games.length + " lobbies from " + source.name);
            return 200;
        }
        console.warn("KBrowser: " + last_cgs_error);
        errors.push(last_cgs_error);
    }

    active_source = null;
    last_cgs_error = "All sources failed — " + errors.join(" | ");
    console.error(last_cgs_error);
    return null;
}

/**
 * Manual "Refresh" button — force-fetches the lobby list right now and
 * re-renders the table with whichever mode/region filter is currently
 * selected. This is the only thing that refreshes the data; the list
 * otherwise stays as-is until the user asks for it.
 * 
 * @param {Element} self The refresh button element
 */
async function refresh_wrapper(self) {
    if (self.disabled) { return; }
    self.disabled = true;
    self.classList.add("spinning");

    update_cgs = true;
    await populate_wrapper(latest_mode_type, latest_regions_group);

    self.classList.remove("spinning");
    self.disabled = false;
}


/**
 * Toggle show_pubs when checked
 * @param {Element} self
 */
function toggle_show_pubs(self) {
    if (self.checked) { show_pubs = true; }
    else { show_pubs = false; }

    // reload table (with last used)
    populate_wrapper(latest_mode_type, latest_regions_group);
}


/**
 * Populate table with lobbies
 * 
 * @param {Array} cgs Lobbies
 */
function populate_table(cgs) {
    let table = document.getElementById("cgs");
    // clear all contents
    table.innerHTML = "";

    // insert all lobbies
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];

        // format lobby properties
        let cg_link = "https://krunker.io/?game=" + cg.link;
        let cg_mode = "cg-mode-" + cg.mode_type;
        let cg_status = "cg-map"; if ("status" in cg) { cg_status += "-" + cg.status}
        let cg_regions_group = "cg-region-" + cg.regions_group;
        let cg_players = "cg-players";
        let cg_special = "";
        if ("password" in cg) { cg_special = "🔒" }
        else if (cg.public == 0) { cg_special = "🛠️" }
        else if ("verified" in cg) { cg_special = "💙"}
        else if ("extra_large" in cg) { cg_special = "🏟️" }
        else if ("dedicated" in cg) { cg_special = "🔸" }
        
        // create nodes
        let span_elements = new Array();
        for (let j = 0; j <= 4; j++) { span_elements.push(document.createElement("span")); }
        span_elements[0].className = cg_mode;
        span_elements[0].innerHTML = cg.mode;
        span_elements[1].className = cg_status;
        span_elements[1].innerHTML = cg.map.replace(/[^\x00-\x7F]/g, "");
        span_elements[2].className = cg_regions_group;
        span_elements[2].innerHTML = cg.region;
        span_elements[3].className = cg_players;
        span_elements[3].innerHTML = "&nbsp;".repeat(2 - cg.players.toString().length) + cg.players.toString() + "/" + cg.total.toString();
        span_elements[4].innerHTML = cg_special;

        // wrap nodes in <a> element
        let a_elements = new Array();
        for (let j = 0; j < span_elements.length; j++) {
            let temp_a = document.createElement("a");
            temp_a.href = cg_link;
            temp_a.target = "_blank";
            temp_a.rel = "noreferrer";
            temp_a.appendChild(span_elements[j]);
            a_elements.push(temp_a);
        }

        // create and populate row
        let row = table.insertRow(-1);
        if ("status" in cg) { row.className = "wrapper-cg-" + cg.status; }
        let cells = new Array(5);
        for (let j = 0; j < cells.length; j++) { cells[j] = row.insertCell(j); }
        for (let j = 0; j < span_elements.length; j++) { cells[j].appendChild(a_elements[j]); }
    }
}


/**
 * Populate page with lobbies statistics
 * 
 * @param {Array} cgs Lobbies
 */
function populate_stats(cgs) {
    // get cgs stats
    let cgs_stats = get_cgs_stats(cgs);

    // create and populate child nodes with stats
    let div_array = new Array();
    for (let i = 0; i < 3; i++) {
        div_array[i] = document.createElement("div");
        div_array[i].className = "cgs-stats";
    }
    div_array[0].innerHTML = "Players online: " + cgs_stats.player_stats.players.toString();
    div_array[1].innerHTML = "Lobbies: "        + cgs.length.toString();
    div_array[2].innerHTML = "Unique maps: "    + Object.keys(cgs_stats.map_stats).length.toString();
    // div_array[3].innerHTML = "Vacancies: "      + (cgs_stats.player_stats.total - cgs_stats.player_stats.players).toString();
    
    // delete old nodes
    let old_stats = document.getElementsByClassName("cgs-stats-parent");
    while(old_stats.length > 0){ old_stats[0].parentNode.removeChild(old_stats[0]); }

    // create and add new nodes
    let div_parent = document.createElement("div");
    div_parent.className = "cgs-stats-parent";
    for (let i = 0; i < div_array.length; i++) { div_parent.appendChild(div_array[i]) }
    let table_parent = document.getElementById("cgs-stats-grandparent");
    table_parent.appendChild(div_parent);
}


/**
 * Calculate stats for all lobbies
 * 
 * @param {Array} cgs Lobbies
 */
function get_cgs_stats(cgs){
    let mode_stats = new Object();
    let mode_type_stats = new Object();
    let region_stats = new Object();
    let regions_group_stats = new Object();
    let player_stats = new Object();
    let map_stats = new Object();

    player_stats.players = 0;
    player_stats.total = 0;
    
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];

        player_stats.players += cg.players;
        player_stats.total += cg.total;
    
        if (!(cg.map in map_stats)) { map_stats[cg.map] = 1; }
        else { map_stats[cg.map] += 1; }

        if (!(cg.mode in mode_stats)) { mode_stats[cg.mode] = 1; }
        else { mode_stats[cg.mode] += 1; }

        if (!(cg.mode_type in mode_type_stats)) { mode_type_stats[cg.mode_type] = 1; }
        else { mode_type_stats[cg.mode_type] += 1; }

        if (!(cg.regions_group in regions_group_stats)) { regions_group_stats[cg.regions_group] = 1; }
        else { regions_group_stats[cg.regions_group] += 1; }

        if (!(cg.region in region_stats)) { region_stats[cg.region] = 1;}
        else { region_stats[cg.region] += 1; }
    }

    return {
        "mode_stats": mode_stats,
        "mode_type_stats": mode_type_stats,
        "region_stats": region_stats,
        "regions_group_stats": regions_group_stats,
        "player_stats": player_stats,
        "map_stats": map_stats
    }
}


/**
 * Compare lobbies by player count, group by mode and region
 * 
 * @param {Object} a First lobby
 * @param {Object} b Second lobby
 * @param {Array} cgs Lobbies
 */
function compare_cgs_popularity(a, b, cgs) {
    let cgs_stats = get_cgs_stats(cgs);

    // const acceptable_player_ratio = 0.8;
    // if (
    //     (a.players != b.players) &&
    //     (
    //         ((a.players / b.players) <= acceptable_player_ratio) ||
    //         ((b.players / a.players) <= acceptable_player_ratio)
    //     )
    // ) {

    if (
        ((a.players != b.players) && (a.players > 20 || b.players > 20)) ||
        ((a.players <= 20 && a.players > 16 && b.players < 16) || (b.players <= 20 && b.players > 16 && a.players < 16)) ||
        ((a.players <= 16 && a.players > 10 && b.players < 10) || (b.players <= 16 && b.players > 10 && a.players < 10)) ||
        ((a.players <= 10 && a.players > 6 && b.players < 6) || (b.players <= 10 && b.players > 6 && a.players < 6)) ||
        ((a.players != b.players) && (a.players <= 6 || b.players <= 6))
    ) {
        return b.players - a.players;

    } else if (a.mode_type !== b.mode_type) {
        // less popular mode types on top
        if ((cgs_stats.mode_type_stats[a.mode_type] != cgs_stats.mode_type_stats[b.mode_type])) {
            return cgs_stats.mode_type_stats[a.mode_type] - cgs_stats.mode_type_stats[b.mode_type];
        }

        return a.mode_type.localeCompare(b.mode_type);
        

    } else if (
        (a.regions_group !== b.regions_group) &&
        (a.regions_group_preference != b.regions_group_preference)
    ) {
        // more preferred region group on top
        return b.regions_group_preference - a.regions_group_preference;
    
    } else if (
        (a.regions_group !== b.regions_group) &&
        (cgs_stats.region_stats[a.region] != cgs_stats.region_stats[b.region])
    ) {
        // more popular region on top
        return cgs_stats.region_stats[b.region] - cgs_stats.region_stats[a.region];

    } else if (cgs_stats.mode_stats[a.mode] != cgs_stats.mode_stats[b.mode]) {
        // less popular modes on top
        return cgs_stats.mode_stats[a.mode] - cgs_stats.mode_stats[b.mode];

    } else if (a.mode !== b.mode) {
        // alphabetical ordering of modes
        return a.mode.localeCompare(b.mode);
        
    } else if (b.total != a.total) {
        // higher total on top
        return b.total - a.total;
    }

    return 0;
}


/**
 * Compare lobbies by map, region, mode
 * 
 * @param {Object} a First lobby
 * @param {Object} b Second lobby
 */
function compare_cgs_name(a, b) {

    if (b.map !== a.map) {
        return a.map.localeCompare(b.map);

    } else if (a.regions_group !== b.regions_group) {
        return a.regions_group.localeCompare(b.regions_group);

    } else if (a.mode_type !== b.mode_type) {
        return a.mode_type.localeCompare(b.mode_type);

    } else if (a.mode !== b.mode) {
        return a.mode.localeCompare(b.mode);
    }
    
    return 0;
}


/**
 * Return filtered, polished lobbies
 * (Usually the first step before further processing)
 * 
 * @param {Array} cgs Lobbies
 * @param {String} mode_type Whitelisted mode type (null for all)
 * @param {String} regions_group Whitelisted regions group (null for all)
 */
function polished_cgs(cgs, mode_type, regions_group) {

    //  region / short / regions_group index / preference (used for lucky only)
    const regions_global = {
        "MIA":  ["US East",     0,      10],
        "NY":   ["US East",     0,      10],
        "SV":   ["US West",     1,      9],
        "DAL":  ["US South",    0,      8],
        "CHI":  ["US Mid",      0,      8],
        "STL":  ["US Mid",      0,      8],
        "HI":   ["US West",     1,      1],
        "FRA":  ["Europe",      2,      15],
        "LON":  ["Europe",      2,      7],
        "SIN":  ["Asia",        3,      10],
        "TOK":  ["Asia",        3,      3],
        "SEO":  ["Asia",        3,      3],
        "SYD":  ["Australia",   4,      7],
        "BLR":  ["India",       5,      7],
        "MBI":  ["India",       5,      7],
        "BRZ":  ["Brazil",      6,      5],
        "MX":   ["Mexico",      7,      2],
        "AFR":  ["Africa",      8,      2],
        "BHN":  ["Arabia",      9,      5],
        "SSS":  ["Asia",        3,      4]
    };

    //  regions_group / preference (used for ordering)
    const regions_groups_global = [
        ["us-east",     10],
        ["us-west",     8],
        ["eu",          11],
        ["asia",        9],
        ["au",          7],
        ["ind",         7],
        ["brz",         6],
        ["mx",          2],
        ["afr",         3],
        ["arab",        4],
    ]

    //  id / name / modes_types index
    const modes_global = {
        0:  ["ffa",     3],
        1:  ["tdm",     2],
        2:  ["point",   2],
        3:  ["ctf",     2],
        4:  ["bhop",    0],
        5:  ["hide",    4],
        6:  ["infect",  1],
        7:  ["race",    4],
        8:  ["lms",     3],
        9:  ["simon",   4], 
        10: ["gun",     3],
        11: ["prop",    4],
        12: ["boss",    4],
        13: ["clas",    3],
        14: ["dep",     2],
        15: ["stalk",   4],
        16: ["koth",    3],
        17: ["oitc",    3],
        18: ["trade",   5],
        19: ["kc",      2], 
        20: ["de",      2],
        21: ["sharp",   3],
        22: ["traitor", 4],
        23: ["raid",    6],
        24: ["blitz",   2],
        25: ["dom",     2],
        26: ["sdm",     2],
        27: ["kranked", 3],
        28: ["tdf",     2],
        29: ["dep_ffa", 3], 
        33: ["chs",     3],
        34: ["bhffa",   3],
        35: ["zom",     6]
    };

    const modes_types_global = [
        "bhop",
        "infect",
        "team",
        "solo",
        "fun",
        "trade",
        "bots"
    ]

    let cgs_local = new Array();

    for (let i = 0; i < cgs.games.length; i++) {
        let cg = cgs.games[i];
        let cg_2 = new Object();

        cg_2.players = cg[2];
        cg_2.total = cg[3];
        cg_2.map = cg[4].i;
        cg_2.link = cg[0];
        cg_2.public = cg[4].c;
        
        if ("ds" in cg[4]) { cg_2.dedicated = cg[4].ds; }
        if ("pw" in cg[4]) { cg_2.password = cg[4].pw; }
        if (cg_2.total > 16 && cg_2.total <= 20) { cg_2.verified = true; }
        if (cg_2.total > 20) { cg_2.extra_large = true; }

        if (
            (cg_2.public == 0) &&
            (show_pubs == false)
        ) {
            continue;
        }

        let region = cg[0].split(":")[0];
        if (region in regions_global) {
            cg_2.region = regions_global[region][0];
            cg_2.region_preference = regions_global[region][2];
            cg_2.regions_group = regions_groups_global[regions_global[region][1]][0];
            cg_2.regions_group_preference = regions_groups_global[regions_global[region][1]][1];
            
            if (regions_group != null) {
                if (cg_2.regions_group != regions_group) {
                    continue;
                }
            }

        } else if (regions_group == null) {
            cg_2.region = region;
            cg_2.region_preference = 0;
            cg_2.regions_group = "";
            cg_2.regions_group_preference = 0;

        } else {
            continue;
        }

        if (cg[4].g in modes_global) {
            cg_2.mode = modes_global[cg[4].g][0];
            cg_2.mode_type = modes_types_global[modes_global[cg[4].g][1]];
            
            if (mode_type != null) {
                if (cg_2.mode_type != mode_type) {
                    continue;
                }
            }
            
        } else if (mode_type == null) {
            cg_2.mode = "???";
            cg_2.mode_type = "";

        } else {
            continue;
        }

        cgs_local.push(cg_2);
    }

    return cgs_local;
}


/**
 * Return tagged, sorted lobbies
 * 
 * @param {Array} cgs Lobbies
 * @param {String} mode_type Whitelisted mode type (null for all)
 * @param {String} regions_group Whitelisted regions group (null for all)
 */
function sorted_cgs(cgs) {
    // sort lobbies by popularity
    cgs.sort((a, b) => compare_cgs_popularity(a, b, cgs));

    // tag lobbies with unique, unique_not_full and star
    let cg_unique = new Set();
    let cg_unique_not_full = new Set();
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];

        if (!cg_unique.has(cg.map)) {
            cg_unique.add(cg.map);
            cg.unique = true;
        }

        if (
            !(cg_unique_not_full.has(cg.map)) &&
            (cg.players < cg.total) &&
            (cg.players > 0)
        ) {
            cg_unique_not_full.add(cg.map);
            cg.unique_not_full = true;
            cg.star = true;
        }
    }
    
    // new cgs which we will populate with sorted lobbies
    let cgs_local_2 = new Array();

    let repeats_allowed = 10;           // maximum number of repeats allowed per map
    let repeats_min_player_ratio = 0.4; // ratio of players below which repeat lobbies are ignored
    let repeats_min_players = 0;        // number of players below which repeat lobbies are ignored

    // append starred lobbies and repeats
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];

        if (!("star" in cg)) { continue; }
        if ("done" in cg) { continue; }

        cg.done = true;
        cgs_local_2.push(cg);

        // for repeats, check if at least one of mode or region is unique
        let mode_regions = new Set();
        mode_regions.add(cg.mode + "_" + cg.regions_group);

        // an alternative to mode_regions for repeats, check if region is unique
        let only_regions = new Set();
        only_regions.add(cg.regions_group);
        
        // search for repeats
        let repeat_count = 0;
        for (let j = 0; j < cgs.length; j++) {
            let cg_2 = cgs[j];

            if (cg.map != cg_2.map) { continue; }
            if (i == j) { continue; }
            if ("done" in cg_2) { continue; }
            if (only_regions.has(cg_2.regions_group)) { continue; }
            // if (mode_regions.has(cg_2.mode + "_" + cg_2.regions_group)) { continue; }
            
            if (
                (cg_2.players < cg_2.total) && 
                (cg_2.players >= repeats_min_players) && 
                ((cg_2.players / cg.players) >= repeats_min_player_ratio) && 
                (repeat_count < repeats_allowed)
            ) {
                cg_2.done = true;
                cg_2.status = "repeated";
                cgs_local_2.push(cg_2);

                mode_regions.add(cg_2.mode + "_" + cg_2.regions_group);
                only_regions.add(cg_2.regions_group);
                repeat_count += 1;
            }
        }
    }

    // sort lobbies by map
    cgs.sort((a, b) => compare_cgs_name(a, b, cgs));
    
    // append full lobbies
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];
        if ("done" in cg) { continue; }
        if (cg.players == cg.total) {
            cg.status = "full";
            cg.done = true;
            cgs_local_2.push(cg);
        }
    }

    // append non empty lobbies
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];
        if ("done" in cg) { continue; }
        if (cg.players > 0) {
            cg.status = "non-empty";
            cg.done = true;
            cgs_local_2.push(cg);
        }
    }

    // append empty lobbies
    for (let i = 0; i < cgs.length; i++) {
        let cg = cgs[i];
        if ("done" in cg) { continue; }
        if (cg.players == 0) {
            cg.status = "empty";
            cg.done = true;
            cgs_local_2.push(cg);
        }
    }

    return cgs_local_2;
}


/**
 * Wrapper to populate table with lobbies
 * 
 * @param {String} mode_type Whitelisted mode type (null for all)
 * @param {String} regions_group Whitelisted regions group (null for all)
 */
async function populate_wrapper(mode_type, regions_group) {
    // update cgs_global if required
    if (update_cgs == true) {
        let table = document.getElementById("cgs");
        table.innerHTML = "Loading...";

        let update_cgs_return = await update_cgs_global();
        update_cgs = false;

        if (update_cgs_return == null) {
            let a_element = document.createElement("a");
            a_element.innerHTML = "reloading the page";
            a_element.href = "javascript:window.location.reload(true)";
            table.innerHTML = "Something went wrong, try ";
            table.appendChild(a_element);

            // show the actual reason underneath, so it's clear whether this is
            // a local network issue or the data source (cgs_server) itself being down
            if (last_cgs_error) {
                let error_detail = document.createElement("div");
                error_detail.style.opacity = "0.7";
                error_detail.style.fontSize = "0.85em";
                error_detail.style.marginTop = "0.5em";
                error_detail.innerHTML = last_cgs_error;
                table.appendChild(document.createElement("br"));
                table.appendChild(error_detail);
            }

            // nothing to render, don't fall through into polished_cgs(undefined)
            if (cgs_global == null) { return; }
        }
    }

    // update global variables
    latest_mode_type = mode_type;
    latest_regions_group = regions_group;

    // sort cgs and populate table
    let cgs_local = polished_cgs(cgs_global, mode_type, regions_group);
    cgs_local = sorted_cgs(cgs_local);
    populate_table(cgs_local);
    populate_stats(cgs_local);
}


/**
 * Get lucky link (for quick join)
 * 
 * @param {String} mode_type Whitelisted mode type (null for all)
 * @param {String} regions_group Whitelisted regions group (null for all)
 */
async function get_lucky_link(mode_type, regions_group) {
    // update cgs_global each time to minimize chance of being redirected into a full lobby
    let update_cgs_return = await update_cgs_global();
    if (update_cgs_return == null) { return null; }
    
    let cgs_local = polished_cgs(cgs_global, mode_type, regions_group);
    cgs_local = sorted_cgs(cgs_local);

    let cgs_lucky = new Array();    // all lucky lobbies
    let lobbies_total_points = 0;   // lobbies get points, which linearly increase their luck
    let lucky_min_players = 4;      // player count below which lobbies are ignored
    for (let i = 0; i < cgs_local.length; i++) {
        let cg = cgs_local[i];
        if (
            ("star" in cg) &&
            (cg.players >= lucky_min_players)
        ) {
            cgs_lucky.push(cg);
            lobbies_total_points += cg.region_preference;
        }
    }

    // no suitable lobbies
    if (lobbies_total_points == 0) {
        return null;
    }

    // a random lucky number
    let lucky_points = Math.random() * lobbies_total_points;
    let lucky_link;
    for (let i = 0; i < cgs_lucky.length; i++) {
        let cg = cgs_lucky[i];

        // subtract lobby points from lucky_points
        lucky_points -= cg.region_preference;

        if (lucky_points <= 0) {
            // found the lucky lobby
            lucky_link = "https://krunker.io/?game=" + cg.link;
            break;
        }
    }

    return lucky_link;
}


/**
 * Wrapper to quick join a lobby
 * 
 * @param {String} mode_type Whitelisted mode type (null for all)
 * @param {String} regions_group Whitelisted regions group (null for all)
 * @param {Element} self
 */
async function lucky_wrapper(mode_type, regions_group, self) {
    self.innerHTML = "⏳";
    
    // get lucky link and open in new tab
    let lucky_link = await get_lucky_link(mode_type, regions_group);
    if (lucky_link == null) {
        self.innerHTML = "❌";
    } else {
        self.innerHTML = "✅";
        window.open(lucky_link, '_blank').focus();
    }
    
    setTimeout(function() {
        self.innerHTML = "🎲";
    }, 2000); 
}


async function main() {
    await populate_wrapper();
}

main();

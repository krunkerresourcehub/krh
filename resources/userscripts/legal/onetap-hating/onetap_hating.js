window.addEventListener("load", () => {
    const menuContainer = document.querySelector("#menuItemContainer");
    if (!menuContainer) {
        console.warn("[LombreScripts] #menuItemContainer not found");
        return;
    }
    if (document.querySelector("#lombre_settings")) {
        return
    }
    // Création du bouton
    const btn = document.createElement("div");
    btn.id = "lombre_settings"
    btn.className = "menuItem";
    btn.setAttribute("onmouseenter", "playTick()");
    btn.style.cursor = "pointer";
    btn.innerHTML = `
    <span class="material-icons-outlined menBtnIcn" style="color:green">extension</span>
    <div class="menuItemTitle" id="menuBtnSettings">Modules</div>`;
    btn.addEventListener("click", () => {
        const popup = document.querySelector("#lombreMenuOverlay");
        popup ? hideCustomPopup() : showCustomPopup();
    });
    menuContainer.appendChild(btn);
    console.log("[LombreScripts] Button added");
});


// ====================
//
// onetap_hating SCRIPT
// 
// ====================

const VERSION = "1.0.0";
localStorage.setItem("lombre_onetap_hating_version", VERSION);


const defaults = {
    lombre_onetap_hating_onetap_class: '["icon_1.png", "icon_14.png", "icon_29.png"]',
    lombre_onetap_hating_you_text_color: '["rgb(255, 255, 255)", "#fff"]',
    lombre_onetap_hating_you_text_username: "You",
    lombre_onetap_hating_status: true
}

const GITHUB_VERSION_URL = "https://raw.githubusercontent.com/LombreBlanche34/krunker_onetap_hating/refs/heads/main/version"

// Initialize localStorage if values don't exist
Object.keys(defaults).forEach(key => {
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaults[key]);
        console.log(`[LombreScripts] [onetap_hating.js] ${key} created with default value: ${defaults[key]}`);
    }
});

async function checkForUpdate() {
    const response = await fetch(GITHUB_VERSION_URL);
    const githubResult = (await response.text())
    const latestVersion = githubResult.split(";")[0]
    if (latestVersion !== VERSION) {
        const change = githubResult.split(";")[1]
        alert(`New version for onetap_hating.js\nActual: ${VERSION} New: ${latestVersion}\n${change}`)
    }
}

checkForUpdate()

// Check if script is enabled
const scriptStatus = localStorage.getItem('lombre_onetap_hating_status');
const isEnabled = scriptStatus === 'true' || scriptStatus === true;


if (!isEnabled) {
    console.log("[LombreScripts] [onetap_hating.js] Script is disabled (lombre_onetap_hating_status = false)");
    return; // Exit script
}

console.log("[LombreScripts] [onetap_hating.js] Script is enabled");

// Load configuration
const config = {
    OTWEAPON: JSON.parse(localStorage.getItem('lombre_onetap_hating_onetap_class')),
    YOUCOLOR: JSON.parse(localStorage.getItem('lombre_onetap_hating_you_text_color')),
    YOUTEXT: localStorage.getItem("lombre_onetap_hating_you_text_username")
};


// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Counters
    let onetapDeaths = 0;
    let totalDeaths = 0;

    const onetapWeapons = config.OTWEAPON; // Sniper, Crossbow, Infiltrator

    // Function to display the counters
    function updateCounters() {
        let counter = document.getElementById('deathCounter');
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'deathCounter';
            counter.style.cssText = `
                position: fixed;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: #ff0000;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                z-index: 9999;
                border: 2px solid #ff0000;
                text-align: center;
            `;
            document.body.appendChild(counter);
        }

        counter.textContent = `One-Tap Deaths: ${onetapDeaths}/${totalDeaths}`;
    }

    // Function to check if it's a death
    function checkForDeath(chatItem) {
        const chatMsg = chatItem.querySelector('.chatMsg');
        if (!chatMsg) return {
            isDeath: false,
            isOnetap: false
        };

        // Check if "You" is present (victim)
        const youSpan = Array.from(chatMsg.querySelectorAll('span')).find(
            span => span.textContent === config.YOUTEXT && config.YOUCOLOR.includes(span.style.color)
        );
        if (!youSpan) return {
            isDeath: false,
            isOnetap: false
        };

        // Check if there's an enemy name (red)
        const enemyName = chatMsg.querySelector('span[style*="color:#eb5656"]');
        if (!enemyName) return {
            isDeath: false,
            isOnetap: false
        };

        // Check if there's a weapon icon (weapon OR melee)
        const weaponIcon = chatMsg.querySelector('.weaponChatIcon');
        const meleeIcon = chatMsg.querySelector('.meleeChatIcon');
        const thrownIcon = chatMsg.querySelector('.thrownChatIcon');

        if (!weaponIcon && !meleeIcon) return {
            isDeath: false,
            isOnetap: false
        };

        // Check the order: enemy -> icon -> You
        const msgHTML = chatMsg.innerHTML;
        const enemyIndex = msgHTML.indexOf(enemyName.outerHTML);
        const youIndex = msgHTML.indexOf(youSpan.outerHTML);

        // Find the icon index (weapon or melee)
        let iconIndex;
        if (weaponIcon) {
            iconIndex = msgHTML.indexOf(weaponIcon.outerHTML);
        } else if (meleeIcon) {
            iconIndex = msgHTML.indexOf(meleeIcon.outerHTML);
        }

        if (!(enemyIndex < iconIndex && iconIndex < youIndex)) {
            return {
                isDeath: false,
                isOnetap: false
            };
        }

        // It's a death, check if it's a one-tap
        let isOnetap = false;

        // Check normal weapons
        if (weaponIcon && onetapWeapons.some(weapon => weaponIcon.src.includes(weapon))) {
            isOnetap = true;
        }

        // Check thrown knives (thrownIcon + meleeIcon)
        if (thrownIcon && meleeIcon) {
            isOnetap = true;
        }

        return {
            isDeath: true,
            isOnetap: isOnetap
        };
    }

    // Observer to monitor new messages
    const chatObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.id && node.id.startsWith('chatMsg_')) {
                    const chatItem = node.querySelector('.chatItem');
                    if (chatItem) {
                        const result = checkForDeath(chatItem);

                        if (result.isDeath) {
                            totalDeaths++;

                            if (result.isOnetap) {
                                onetapDeaths++;
                                const enemyName = chatItem.querySelector('span[style*="color:#eb5656"]');
                                console.log(`One-Tap Death by ${enemyName?.textContent}!`);
                            }

                            updateCounters();
                            console.log(`Deaths - One-Tap: ${onetapDeaths}/${totalDeaths}`);
                        }
                    }
                }
            });
        });
    });

    // Start observing the chat
    const chatList = document.getElementById('chatList');
    if (chatList) {
        chatObserver.observe(chatList, {
            childList: true,
            subtree: true
        });
        updateCounters();
        console.log('Death Counter initialized!');
    } else {
        console.error('chatList not found!');
    }
});



// ====================
//
// SETTINGS SCRIPT
// 
// ====================


// Function to retrieve all module settings
function getModuleSettings() {
    const settings = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('lombre_')) {
            const moduleName = key.split("_")[1] + "_" + key.split("_")[2];
            const settingName = key.split(`lombre_${moduleName}_`)[1];

            if (!settings[moduleName]) {
                settings[moduleName] = {};
            }

            let value = localStorage.getItem(key);

            try {
                value = JSON.parse(value);
            } catch (e) {
                // Keep string value if it's not JSON
            }

            settings[moduleName][settingName] = {
                key: key,
                value: value
            };
        }
    }

    return settings;
}

// Function to create a settings section (Krunker style)
function createSettingSection(moduleName, params) {
    const sectionId = moduleName.replace(/[^a-zA-Z0-9]/g, '_');
    const paramCount = Object.keys(params).length;

    // get the status of the module
    const statusKey = `lombre_${moduleName}_status`;
    const versionValue = localStorage.getItem(`lombre_${moduleName}_version`)
    const statusValue = params['status'] ? params['status'].value : null;
    const hasStatus = statusValue !== null && typeof statusValue === 'boolean';

    let sectionHTML = `
    <div style="background: rgba(0, 0, 0, 0.2); margin-bottom: 10px; border-radius: 6px; overflow: hidden;">
        <div class="lombre-section-header" data-section="${sectionId}" 
             style="background: rgba(255, 255, 255, 0.1); padding: 15px 20px; cursor: pointer; 
                    display: flex; align-items: center; justify-content: space-between; 
                    transition: background 0.2s; user-select: none;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="lombre-arrow" style="font-size: 14px; transition: transform 0.2s;">▼</span>
                <span style="color: #fff; font-size: 16px; font-weight: 500;">${moduleName.replace(/_/g, ' ')}</span>
                <span style="color: rgba(255, 255, 255, 0.4); font-size: 13px;">(${paramCount})</span>
                ${hasStatus ? `
                <label style="position: relative; display: inline-block; width: 44px; height: 22px; cursor: pointer; margin-left: 8px;" onclick="event.stopPropagation();">
                    <input type="checkbox" 
                           class="lombre-setting-input lombre-module-status" 
                           data-key="${statusKey}"
                           data-type="boolean"
                           ${statusValue ? 'checked' : ''}
                           onchange="lombreSaveSetting(this)"
                           style="opacity: 0; width: 0; height: 0;">
                    <span class="lombre-status-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; 
                                 background: ${statusValue ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'}; 
                                 transition: 0.3s; border-radius: 22px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
                        <span class="lombre-status-knob" style="position: absolute; content: ''; height: 16px; width: 16px; left: 3px; 
                                     bottom: 3px; background: white; transition: 0.3s; border-radius: 50%; 
                                     transform: translateX(${statusValue ? '22px' : '0'});
                                     box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
                    </span>
                </label>
                ${versionValue ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-left: 8px;">v${versionValue}</span>` : ''}
                ` : ''}
            </div>
        </div>
        <div class="lombre-section-body" id="lombre_body_${sectionId}" 
             style="padding: 20px; display: block; background: rgba(0, 0, 0, 0.3);">
`;

    for (const [paramName, paramData] of Object.entries(params)) {
        // skip if its "status" since its on the header
        if (paramName === 'status' || paramName === 'version') continue;

        const isArray = Array.isArray(paramData.value);
        const isObject = typeof paramData.value === 'object' && !isArray && paramData.value !== null;
        const isBoolean = typeof paramData.value === 'boolean';
        const isNumber = typeof paramData.value === 'number' && !isBoolean;
        const isString = typeof paramData.value === 'string';

        sectionHTML += `<div style="margin-bottom: 25px;">`;
        sectionHTML += `<div style="color: rgba(255, 255, 255, 0.85); font-size: 14px; margin-bottom: 10px; font-weight: 400;">${paramName.replace(/_/g, ' ')}</div>`;

        if (isArray || isObject) {
            // Textarea for JSON
            sectionHTML += `
                <textarea 
                    class="lombre-setting-input" 
                    data-key="${paramData.key}"
                    data-type="json"
                    placeholder="JSON format"
                    style="width: 100%; min-height: 100px; background: rgba(0, 0, 0, 0.4); 
                           border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; 
                           padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; 
                           font-size: 13px; resize: vertical;"
                    onchange="lombreSaveSetting(this)"
                >${JSON.stringify(paramData.value, null, 2)}</textarea>
            `;
        } else if (isBoolean) {
            // Krunker-style switch
            sectionHTML += `
                <label style="position: relative; display: inline-block; width: 54px; height: 28px; cursor: pointer;">
                    <input type="checkbox" 
                           class="lombre-setting-input" 
                           data-key="${paramData.key}"
                           data-type="boolean"
                           ${paramData.value ? 'checked' : ''}
                           onchange="lombreSaveSetting(this)"
                           style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; 
                                 background: ${paramData.value ? '#2196F3' : 'rgba(255, 255, 255, 0.2)'}; 
                                 transition: 0.3s; border-radius: 28px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);">
                        <span style="position: absolute; content: ''; height: 22px; width: 22px; left: 3px; 
                                     bottom: 3px; background: white; transition: 0.3s; border-radius: 50%; 
                                     transform: translateX(${paramData.value ? '26px' : '0'});
                                     box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></span>
                    </span>
                </label>
            `;
        } else if (isNumber) {
            // Numeric input + Slider
            const maxVal = Math.max(1000, Math.abs(paramData.value) * 2);
            sectionHTML += `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <input type="range" 
                           min="0" 
                           max="${maxVal}" 
                           step="1" 
                           value="${paramData.value}" 
                           class="lombre-setting-input lombre-slider"
                           data-key="${paramData.key}"
                           data-type="number"
                           oninput="lombreSaveSetting(this)"
                           style="flex: 1; height: 6px; border-radius: 3px; outline: none; 
                                  background: linear-gradient(to right, 
                                      #2196F3 0%, 
                                      #2196F3 ${(paramData.value / maxVal) * 100}%, 
                                      rgba(255,255,255,0.15) ${(paramData.value / maxVal) * 100}%, 
                                      rgba(255,255,255,0.15) 100%);
                                  -webkit-appearance: none;">
                    <input type="number" 
                           class="lombre-setting-input lombre-number-input" 
                           data-key="${paramData.key}"
                           data-type="number"
                           value="${paramData.value}"
                           onchange="lombreSaveSetting(this)"
                           style="width: 80px; background: rgba(0, 0, 0, 0.4); 
                                  border: 1px solid rgba(255, 255, 255, 0.1); 
                                  color: #fff; padding: 8px 12px; border-radius: 4px; 
                                  text-align: center; font-size: 14px; font-weight: 500;">
                </div>
            `;
        } else {
            // Text input
            sectionHTML += `
                <input type="text" 
                       class="lombre-setting-input" 
                       data-key="${paramData.key}"
                       data-type="string"
                       value="${paramData.value}"
                       onchange="lombreSaveSetting(this)"
                       style="width: 100%; background: rgba(0, 0, 0, 0.4); 
                              border: 1px solid rgba(255, 255, 255, 0.1); 
                              color: #fff; padding: 10px 12px; border-radius: 4px; 
                              font-size: 14px;">
            `;
        }

        sectionHTML += `</div>`;
    }

    sectionHTML += `</div></div>`;

    return sectionHTML;
}

// Function to save a setting
window.lombreSaveSetting = function (element) {
    const key = element.getAttribute('data-key');
    const type = element.getAttribute('data-type');

    try {
        let value;

        if (type === 'boolean') {
            value = element.checked;
            // Animate the switch
            const slider = element.nextElementSibling;
            const knob = slider.querySelector('span');

            const isModuleStatus = element.classList.contains('lombre-module-status');
            const color = isModuleStatus ? '#4CAF50' : '#2196F3';

            slider.style.background = value ? color : 'rgba(255, 255, 255, 0.2)';
            knob.style.transform = `translateX(${value ? (isModuleStatus ? '22px' : '26px') : '0'})`;
        } else if (type === 'json') {
            value = JSON.parse(element.value);
            element.style.borderColor = 'rgba(76, 175, 80, 0.5)';
            setTimeout(() => {
                element.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }, 500);
        } else if (type === 'number') {
            value = parseFloat(element.value);

            // Sync slider and input
            const otherInputs = document.querySelectorAll(`[data-key="${key}"]`);
            otherInputs.forEach(input => {
                if (input !== element) {
                    input.value = value;
                    // Update slider background if it's a slider
                    if (input.classList.contains('lombre-slider')) {
                        const max = parseFloat(input.max);
                        const percent = (value / max) * 100;
                        input.style.background = `linear-gradient(to right, #2196F3 0%, #2196F3 ${percent}%, rgba(255,255,255,0.15) ${percent}%, rgba(255,255,255,0.15) 100%)`;
                    }
                }
            });
        } else {
            value = element.value;
        }

        localStorage.setItem(key, JSON.stringify(value));
        element.style.borderColor = '';
    } catch (e) {
        element.style.borderColor = '#ff4444';
        lombreShowNotification('Invalid value', 'error');
        setTimeout(() => {
            element.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }, 1500);
    }
};

// System notification
function lombreShowNotification(message, type = 'success') {
    const existing = document.querySelector('.lombre-notification');
    if (existing) existing.remove();

    const color = type === 'success' ? '#4CAF50' : type === 'error' ? '#ff4444' : '#ff9800';

    const notif = document.createElement('div');
    notif.className = 'lombre-notification';
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        background: ${color};
        color: #fff;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        z-index: 100001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        animation: lombreSlideIn 0.3s ease;
    `;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.style.animation = 'lombreSlideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

// Reset function
window.lombreResetSettings = function () {
    if (confirm('⚠️ Reset all module settings?\n\nThis will delete all saved settings and cannot be undone.\nRestart required')) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('lombre_')) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        lombreShowNotification('Settings reset successfully', 'success');

        setTimeout(() => {
            hideCustomPopup();
            setTimeout(showCustomPopup, 100);
        }, 1200);
    }
};

// Export function
window.lombreExportSettings = function () {
    const settings = getModuleSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lombre_settings_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    lombreShowNotification(`Settings exported successfully!\nDownload folder -> lombre_settings_${Date.now()}.json`, 'success');
};

// Import function
window.lombreImportSettings = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);

                let count = 0;
                for (const [moduleName, params] of Object.entries(settings)) {
                    for (const [paramName, paramData] of Object.entries(params)) {
                        localStorage.setItem(paramData.key, JSON.stringify(paramData.value));
                        count++;
                    }
                }

                lombreShowNotification(`${count} settings imported successfully`, 'success');
                setTimeout(() => {
                    hideCustomPopup();
                    setTimeout(showCustomPopup, 100);
                }, 1200);
            } catch (err) {
                lombreShowNotification('Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// Search function
window.lombreSearchModules = function (searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    const sections = document.querySelectorAll('[class="lombre-section-header"]');

    sections.forEach(header => {
        const moduleName = header.textContent.toLowerCase();
        const section = header.parentElement;

        if (searchTerm === '' || moduleName.includes(searchTerm)) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
};

// Main function to display the popup
function showCustomPopup() {
    let existingPopup = document.querySelector("#lombreMenuOverlay");
    if (existingPopup) {
        existingPopup.remove();
    }

    // Add styles
    if (!document.querySelector('#lombre-styles')) {
        const style = document.createElement('style');
        style.id = 'lombre-styles';
        style.textContent = `
            @keyframes lombreSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes lombreSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            /* Slider styles */
            .lombre-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fff;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                transition: transform 0.1s;
            }

            .lombre-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
            }

            .lombre-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #fff;
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            /* Hover effects */
            .lombre-section-header:hover {
                background: rgba(255, 255, 255, 0.15) !important;
            }

            .lombre-number-input:focus,
            .lombre-setting-input:focus {
                outline: none;
                border-color: #2196F3 !important;
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    const modules = getModuleSettings();
    let settingsHTML = '';

    if (Object.keys(modules).length === 0) {
        settingsHTML = `
            <div style="color: rgba(255, 255, 255, 0.4); text-align: center; padding: 80px 20px; font-size: 16px;">
                <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;">📦</div>
                <div style="font-size: 18px; margin-bottom: 10px;">No Lombre modules found</div>
                <div style="font-size: 13px; opacity: 0.6;">Modules must have localStorage keys with prefix "lombre_"</div>
            </div>
        `;
    } else {
        for (const [moduleName, params] of Object.entries(modules)) {
            settingsHTML += createSettingSection(moduleName, params);
        }
    }

    const overlay = document.createElement('div');
    overlay.id = 'lombreMenuOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;

    const menuWindow = document.createElement('div');
    menuWindow.id = 'lombreMenuWindow';
    menuWindow.style.cssText = `
        background: #1a1a1a;
        width: 1000px;
        max-width: 95%;
        max-height: 90vh;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
    `;

    menuWindow.innerHTML = `
        <div style="background: rgba(0, 0, 0, 0.4); padding: 20px 25px; border-bottom: 2px solid rgba(255, 255, 255, 0.05); flex-shrink: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <div>
                    <h2 style="margin: 0; color: #fff; font-size: 22px; font-weight: 600;">Lombre Module Settings</h2>
                    <p style="margin: 5px 0 0 0; color: rgba(255, 255, 255, 0.4); font-size: 13px;">
                        ${Object.keys(modules).length} module(s) loaded, all modules need a game refresh to apply new settings
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="lombreImportSettings()" style="background: #2196F3; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Import</button>
                    <button onclick="lombreExportSettings()" style="background: #2196F3; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Export</button>
                    <button onclick="lombreResetSettings()" style="background: #ff9800; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Reset</button>
                    <button onclick="window.open('https://discord.gg/9aUJK9yAq9', '_blank')" style="background: #5865F2; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Discord</button>
                    <button onclick="window.open('https://krunker.io/social.html?p=profile&q=Lombre_Blanche', '_blank')" style="background: #00C853; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Support ❤️</button>
                    <button onclick="hideCustomPopup()" style="background: #ff4444; color: #fff; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;">Close</button>
                </div>
            </div>
            <input type="text" 
                   placeholder="Search modules..." 
                   oninput="lombreSearchModules(this.value)"
                   style="width: 100%; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1); 
                          color: #fff; padding: 12px 16px; border-radius: 4px; font-size: 14px;">
        </div>
        <div style="padding: 25px; overflow-y: auto; flex: 1;">
            ${settingsHTML}
        </div>
    `;

    overlay.appendChild(menuWindow);
    document.body.appendChild(overlay);

    // Setup collapse handlers
    const headers = menuWindow.querySelectorAll('.lombre-section-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sectionId = header.getAttribute('data-section');
            const body = document.getElementById(`lombre_body_${sectionId}`);
            const arrow = header.querySelector('.lombre-arrow');

            if (body.style.display === 'none') {
                body.style.display = 'block';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                body.style.display = 'none';
                arrow.style.transform = 'rotate(-90deg)';
            }
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideCustomPopup();
    });
}

function hideCustomPopup() {
    const popup = document.querySelector("#lombreMenuOverlay");
    if (popup) popup.remove();
}

window.hideCustomPopup = function () {
    const popup = document.querySelector("#lombreMenuOverlay");
    if (popup) popup.remove();
}
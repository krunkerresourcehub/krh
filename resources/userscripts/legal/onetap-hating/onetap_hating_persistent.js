// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Load counters from localStorage or initialize with default values
    let onetapDeaths = parseInt(localStorage.getItem('onetapDeaths')) || 0;
    let totalDeaths = parseInt(localStorage.getItem('totalDeaths')) || 0;

    const onetapWeapons = ['icon_1.png', 'icon_14.png', 'icon_29.png']; // Sniper, Crossbow, Infiltrator

    // Function to save counters to localStorage
    function saveCounters() {
        localStorage.setItem('onetapDeaths', onetapDeaths);
        localStorage.setItem('totalDeaths', totalDeaths);
    }

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
            span => span.textContent === 'You' && span.style.color === 'rgb(255, 255, 255)'
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
        };

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

                            // Save counters after each death
                            saveCounters();
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

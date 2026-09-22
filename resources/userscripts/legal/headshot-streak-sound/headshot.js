const headshotSounds = [
    "https://files.catbox.moe/v1r52r.ogg",
    "https://files.catbox.moe/x1nukp.ogg",
    "https://files.catbox.moe/us78zu.ogg",
    "https://files.catbox.moe/iejcct.ogg",
    "https://files.catbox.moe/18mrf6.ogg",
    "https://files.catbox.moe/8f2hc4.ogg",
    "https://files.catbox.moe/ocf44n.ogg",
    "https://files.catbox.moe/30ddq0.ogg"
];

let headshotStreak = 0;

function playHeadshotSound(index) {
    const audio = new Audio(headshotSounds[index]);
    audio.play();
}

function observe() {
    const chatContainer = document.querySelector("#chatList");

    const mutationWatcher = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((newNode) => {
                    if (newNode.nodeType === 1 && newNode.tagName === "DIV") {
                        const messageSpan = newNode.querySelector("span.chatMsg");
                        if (messageSpan) {
                            const coloredSpans = messageSpan.querySelectorAll("span[style*='color:#']");
                            if (coloredSpans.length > 0) {
                                const firstColoredSpan = coloredSpans[0];
                                const spanColor = firstColoredSpan.style.color.trim().toLowerCase();
                                const spanText = firstColoredSpan.textContent.trim();

                                if ((spanColor === "rgb(255, 255, 255)" || spanColor === "#fff") && spanText === "You") {
                                    const headshotIcon = messageSpan.querySelector("img.headShotChatIcon");

                                    if (headshotIcon) {
                                        // Headshot détecté
                                        if (headshotStreak < headshotSounds.length) {
                                            playHeadshotSound(headshotStreak);
                                        } else {
                                            playHeadshotSound(headshotSounds.length - 1);
                                        }
                                        headshotStreak++;
                                    } 
                                }
                            }
                        }
                    }
                });
            }
        });
    });

    mutationWatcher.observe(chatContainer, {
        childList: true
    });
}

setTimeout(() => {
    observe();
}, 3000);

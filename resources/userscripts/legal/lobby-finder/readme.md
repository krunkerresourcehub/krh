# Krunker Matchmaker Scripts

Two lightweight userscripts to browse and join **Krunker.io** lobbies directly from the main page.

---

## 📋 Which version should you use?

### matchmaker.js – Fast & Simple
- Uses Krunker's API cache (updates every 10 seconds)
- Near-instant loading
- Perfect for quick matchmaking

### precise_matchmaker.js – Accurate & Reliable 
- Real-time data directly from servers
- **Avoids "game is full" errors**
- Takes slightly longer but guarantees joinable lobbies
- Best for finding quality pubs lobbies that match your playstyle

---

## ✨ Features

- Browse available public lobbies in your region
- See player count, map, mode, and time remaining
- Join any lobby with one click
- Press **F2** to refresh the lobby list
- Clean interface that doesn't interfere with gameplay

---

## 🚀 Installation

1. Choose your preferred script
2. Copy it to your userscripts folder
3. Reload your client

---

## 🎯 How to Use

1. Open your client
2. Press **F2**
3. Browse up to 3 filtered lobbies for your region
4. Click **Join** to enter the game

**Note:** Scripts automatically use your saved region preference from Krunker settings.

---

## 💡 Why precise_matchmaker avoids "game is full"

**The Problem with matchmaker.js:**
- Relies on Krunker's matchmaker API
- Data refreshes every 10 seconds
- Lobbies can fill up during that delay
- You might click "Join" on an already-full game

**How precise_matchmaker.js fixes this:**
- Queries servers in real-time when you press F2
- Shows exact available slots **right now**
- No outdated data = no "game is full" messages
- Higher success rate when joining lobbies

---

## 📝 Technical Details

- Automatically filters customs and not FFA lobbies
- Displays maximum 3 lobbies per search
- Lightweight and optimized
- Uses your regional setting: `kro_setngss_defaultRegion`

---

## 🤝 Contributing

- Report bugs
- Suggest improvements
- Fork and modify as needed

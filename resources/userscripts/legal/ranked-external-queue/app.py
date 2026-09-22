import flet as ft
import json
import requests
import os
import time
import threading
import websocket
from pathlib import Path
from pypresence import Presence
from playsound3 import playsound

# Discord RPC Configuration
CLIENT_ID = "1445174302323376219" 
RPC = None
RPC_UPDATE_INTERVAL = 1

class KrunkerQueue:
    def __init__(self):
        self.token = None
        self.ws = None
        self.start_time = None
        self.is_queued = False
        self.selected_regions = []
        self.selected_maps = []
        self.custom_clients = []

    def get_token_from_leveldb(self, path):
        """Retrieves the token from a client's localStorage"""
        try:
            if not os.path.exists(path):
                return None

            for file in os.listdir(path):
                if file.endswith(('.ldb', '.log')):
                    filepath = os.path.join(path, file)
                    try:
                        with open(filepath, 'rb') as f:
                            content = f.read()
                            if b'__FRVR_auth_access_token' in content:
                                start = content.find(b'eyJ')
                                if start != -1:
                                    end = content.find(b'\x00', start)
                                    if end == -1:
                                        end = start + 1000
                                    token = content[start:end].decode('utf-8', errors='ignore')
                                    token = token.split('\x00')[0].split('"')[0]
                                    if token.startswith('eyJ'):
                                        return token
                    except:
                        continue
            return None
        except Exception as e:
            print(f"Error reading: {e}")
            return None

    def login_with_credentials(self, username, password):
        """Login with username/password"""
        url = "https://gapi.svc.krunker.io/auth/login/username"
        headers = {
            'accept': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.0 Electron/12.0.0-nightly.20201116 Safari/537.36',
            'content-type': 'application/json',
            'origin': 'https://krunker.io',
        }
        data = {
            "username": username,
            "password": password
        }

        try:
            response = requests.post(url, headers=headers, json=data)
            result = response.json()

            if result.get('data', {}).get('type') == 'login_ok':
                return {'success': True, 'token': result['data']['access_token']}
            elif result.get('data', {}).get('type') == 'check_2fa':
                return {'success': False, '2fa': True, 'challenge_id': result['data']['challenge_id']}
            else:
                return {'success': False, 'error': 'Login failed'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def verify_2fa(self, challenge_id, code):
        """Verifies the 2FA code"""
        url = f"https://gapi.svc.krunker.io/auth/2fa/challenge/{challenge_id}"
        headers = {
            'accept': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.0 Electron/12.0.0-nightly.20201116 Safari/537.36',
            'content-type': 'application/json',
            'origin': 'https://krunker.io',
        }
        data = {"code": code}

        try:
            response = requests.post(url, headers=headers, json=data)
            result = response.json()

            if result.get('data', {}).get('type') == 'login_ok':
                return {'success': True, 'token': result['data']['access_token']}
            else:
                return {'success': False, 'error': '2FA verification failed'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

def update_presence():
    """Updates the Discord RPC based on the application state"""
    global RPC, krunker

    if RPC is None:
        return

    try:
        if krunker.token:
            # User is connected
            details = "Connected to Krunker"

            if krunker.is_queued:
                if krunker.start_time:
                    elapsed = int(time.time() - krunker.start_time)
                    minutes = elapsed // 60
                    seconds = elapsed % 60
                    state = f"Searching for match"

                    # Add selected maps and regions
                    regions_display = ", ".join(krunker.selected_regions)
                    maps_display = ", ".join([map_name.upper() for map_name in krunker.selected_maps])

                    details = f"Queue: {regions_display} | Maps: {maps_display}"
                else:
                    state = "Searching for match (00:00)"
            else:
                state = "Ready to Queue"

            RPC.update(
                state=state,
                details=details,
                large_image="krunker",
                large_text="github: LombreBlanche34",
                start=krunker.start_time if krunker.start_time else time.time()
            )
        else:
            # User is not connected
            RPC.update(
                state="Not logged in",
                details="Krunker External Queue",
                large_image="krunker",
                large_text="github: LombreBlanche34",
                small_image="status",
                small_text="Offline",
            )
    except Exception as e:
        print(f"Error updating RPC: {e}")

def presence_update_thread():
    """Thread to regularly update the RPC"""
    global RPC
    while True:
        try:
            update_presence()
            time.sleep(RPC_UPDATE_INTERVAL)
        except Exception as e:
            print(f"Error in RPC update thread: {e}")
            time.sleep(5)

def main(page: ft.Page):
    global RPC, krunker

    page.title = "Krunker External Queue"
    page.theme_mode = ft.ThemeMode.DARK
    page.window.width = 550
    page.window.height = 900
    page.window.resizable = True
    page.padding = 0

    # Initialize Discord RPC
    try:
        RPC = Presence(CLIENT_ID)
        RPC.connect()
        print("Rich Presence connected!")

        # Start the RPC update thread
        threading.Thread(target=presence_update_thread, daemon=True).start()
    except Exception as e:
        print(f"Error connecting to RPC: {e}")
        RPC = None

    # Version text
    version_text = ft.Text("v1.0.0", size=12, color=ft.Colors.GREY_500, text_align=ft.TextAlign.RIGHT)

    krunker = KrunkerQueue()
    ws_task = None
    challenge_id = None
    timer_thread = None
    stop_timer = False

    default_paths = [
        os.path.join(os.getenv('APPDATA'), 'crankshaft', 'Local Storage', 'leveldb'),
        os.path.join(os.getenv('APPDATA'), 'pc7', 'Local Storage', 'leveldb'),
    ]

    regions_map = {
        'EU': ft.Checkbox(label="EU", value=True),
        'NA': ft.Checkbox(label="NA", value=False),
        'ASIA': ft.Checkbox(label="ASIA", value=False),
    }

    maps_map = {
        'burg_new': ft.Checkbox(label="Burg", value=True),
        'sandstorm_v3': ft.Checkbox(label="Sandstorm", value=True),
        'undergrowth': ft.Checkbox(label="Undergrowth", value=True),
        'industry': ft.Checkbox(label="Industry", value=True),
        'site': ft.Checkbox(label="Site", value=True),
        'bureau': ft.Checkbox(label="Bureau", value=True),
        'eterno_sim': ft.Checkbox(label="Eterno (used for tests)", value=False),
    }

    # ==================== LOGIN PAGE ====================

    login_status_text = ft.Text("", size=14, text_align=ft.TextAlign.CENTER)

    username_field = ft.TextField(
        label="Username",
        width=350,
        icon=ft.Icons.PERSON
    )
    password_field = ft.TextField(
        label="Password",
        password=True,
        can_reveal_password=True,
        width=350,
        icon=ft.Icons.LOCK
    )
    code_2fa_field = ft.TextField(
        label="2FA Code",
        width=350,
        visible=False,
        max_length=6,
        icon=ft.Icons.SECURITY
    )

    login_btn = ft.ElevatedButton(
        "Login",
        width=350,
        height=45,
        icon=ft.Icons.LOGIN
    )
    verify_2fa_btn = ft.ElevatedButton(
        "Verify 2FA",
        width=350,
        height=45,
        visible=False,
        icon=ft.Icons.VERIFIED_USER
    )

    client_dropdown = ft.Dropdown(
        label="Select Client",
        width=350,
        options=[
            ft.dropdown.Option("crankshaft", "Crankshaft"),
            ft.dropdown.Option("pc7", "PC7"),
        ],
        icon=ft.Icons.COMPUTER
    )

    detect_btn = ft.ElevatedButton(
        "Detect Token",
        width=350,
        height=45,
        icon=ft.Icons.SEARCH
    )

    def on_detect_token(e):
        """Detects the token from a client"""
        client = client_dropdown.value
        if not client:
            login_status_text.value = "❌ Select a client first"
            login_status_text.color = ft.Colors.RED
            page.update()
            return

        login_status_text.value = "⏳ Searching for token..."
        login_status_text.color = ft.Colors.BLUE
        page.update()

        path_index = 0 if client == "crankshaft" else 1
        token = krunker.get_token_from_leveldb(default_paths[path_index])

        if token:
            krunker.token = token
            print(f"[TOKEN DETECTED]")
            login_status_text.value = f"✓ Token detected from {client}! You can now go to Queue tab."
            login_status_text.color = ft.Colors.GREEN

            # Switch to the Queue tab after 1 second
            def switch_to_queue():
                time.sleep(1)
                tabs.selected_index = 1
                page.update()
                update_presence()

            threading.Thread(target=switch_to_queue, daemon=True).start()
        else:
            login_status_text.value = f"❌ Token not found in {client}"
            login_status_text.color = ft.Colors.RED

        page.update()

    def on_login(e):
        """Handles login"""
        nonlocal challenge_id

        if not username_field.value or not password_field.value:
            login_status_text.value = "❌ Enter username and password"
            login_status_text.color = ft.Colors.RED
            page.update()
            return

        login_status_text.value = "⏳ Logging in..."
        login_status_text.color = ft.Colors.BLUE
        page.update()

        result = krunker.login_with_credentials(username_field.value, password_field.value)

        if result.get('success'):
            krunker.token = result['token']
            print(f"[LOGIN SUCCESS]")
            login_status_text.value = "✓ Login successful! You can now go to Queue tab."
            login_status_text.color = ft.Colors.GREEN

            # Switch to the Queue tab after 1 second
            def switch_to_queue():
                time.sleep(1)
                tabs.selected_index = 1
                page.update()
                update_presence()

            threading.Thread(target=switch_to_queue, daemon=True).start()
        elif result.get('2fa'):
            challenge_id = result['challenge_id']
            login_status_text.value = "🔐 2FA required - Enter your code below"
            login_status_text.color = ft.Colors.ORANGE
            code_2fa_field.visible = True
            verify_2fa_btn.visible = True
            login_btn.disabled = True
        else:
            login_status_text.value = f"❌ {result.get('error', 'Login failed')}"
            login_status_text.color = ft.Colors.RED

        page.update()

    def on_verify_2fa(e):
        """Verifies the 2FA code"""
        if not code_2fa_field.value or len(code_2fa_field.value) != 6:
            login_status_text.value = "❌ Enter valid 6-digit code"
            login_status_text.color = ft.Colors.RED
            page.update()
            return

        login_status_text.value = "⏳ Verifying 2FA..."
        login_status_text.color = ft.Colors.BLUE
        page.update()

        result = krunker.verify_2fa(challenge_id, code_2fa_field.value)

        if result.get('success'):
            krunker.token = result['token']
            print(f"[2FA SUCCESS]")
            login_status_text.value = "✓ 2FA verified! Login successful. You can now go to Queue tab."
            login_status_text.color = ft.Colors.GREEN
            code_2fa_field.visible = False
            verify_2fa_btn.visible = False
            login_btn.disabled = False

            # Switch to the Queue tab after 1 second
            def switch_to_queue():
                time.sleep(1)
                tabs.selected_index = 1
                page.update()
                update_presence()

            threading.Thread(target=switch_to_queue, daemon=True).start()
        else:
            login_status_text.value = f"❌ {result.get('error', '2FA failed')}"
            login_status_text.color = ft.Colors.RED

        page.update()

    detect_btn.on_click = on_detect_token
    login_btn.on_click = on_login
    verify_2fa_btn.on_click = on_verify_2fa

    login_page = ft.Container(
        content=ft.Column([
            ft.Container(height=5),
            ft.Icon(ft.Icons.ACCOUNT_CIRCLE, size=80, color=ft.Colors.BLUE),
            ft.Text("Authentication", size=32, weight=ft.FontWeight.BOLD),

            ft.Container(height=5),
            login_status_text,
            ft.Container(height=5),

            ft.Divider(height=5),

            ft.Text("🔍 Auto-detect Token", size=20, weight=ft.FontWeight.BOLD),
            ft.Text("Detect token from installed clients", size=12, color=ft.Colors.GREY),
            ft.Container(height=10),
            client_dropdown,
            detect_btn,

            ft.Container(height=20),
            ft.Divider(height=20),

            ft.Text("🔑 Manual Login", size=20, weight=ft.FontWeight.BOLD),
            ft.Text("Login with your Krunker credentials", size=12, color=ft.Colors.GREY),
            ft.Container(height=10),
            username_field,
            password_field,
            login_btn,
            code_2fa_field,
            verify_2fa_btn,

        ],
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        scroll=ft.ScrollMode.AUTO),
        padding=20,
    )

    # ==================== QUEUE PAGE ====================

    queue_status_text = ft.Text("Not in queue", size=16, weight=ft.FontWeight.BOLD, color=ft.Colors.ORANGE)
    timer_text = ft.Text("", size=24, weight=ft.FontWeight.BOLD)

    queue_btn = ft.ElevatedButton(
        "Join Queue",
        width=350,
        height=50,
        bgcolor=ft.Colors.GREEN,
        color=ft.Colors.WHITE,
        icon=ft.Icons.PLAY_ARROW
    )
    leave_btn = ft.ElevatedButton(
        "Leave Queue",
        width=350,
        height=50,
        bgcolor=ft.Colors.RED,
        color=ft.Colors.WHITE,
        visible=False,
        icon=ft.Icons.STOP
    )

    match_info = ft.Container(
        content=ft.Column([
            ft.Icon(ft.Icons.EMOJI_EVENTS, size=60, color=ft.Colors.YELLOW),
            ft.Text("Match Found!", size=24, weight=ft.FontWeight.BOLD, color=ft.Colors.GREEN),
            ft.Text("", size=14, color=ft.Colors.WHITE, text_align=ft.TextAlign.CENTER),
        ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
        bgcolor=ft.Colors.GREEN_900,
        border_radius=10,
        padding=20,
        visible=False,
    )

    def update_timer():
        """Updates the timer"""
        nonlocal stop_timer
        while krunker.is_queued and not stop_timer:
            if krunker.start_time:
                elapsed = int(time.time() - krunker.start_time)
                minutes = elapsed // 60
                seconds = elapsed % 60
                timer_text.value = f"⏱️ {minutes:02d}:{seconds:02d}"
                page.update()
            time.sleep(1)

    def connect_websocket(url):
        """WebSocket connection with websocket-client"""
        nonlocal stop_timer, timer_thread

        print("=" * 80)
        print("[WEBSOCKET] Initializing connection...")
        # print(f"[WEBSOCKET] URL: {url}")
        print("=" * 80)

        def on_message(ws, message):
            print(f"[WS] Message received: {message}")
            try:
                data = json.loads(message)

                if data.get('type') == 'QUEUE_STATUS':
                    status = data.get('payload', {}).get('status')
                    print(f"[WS] Queue status: {status}")

                    if status == 'QUEUED':
                        krunker.is_queued = True
                        krunker.start_time = time.time()
                        queue_status_text.value = "🔄 Searching for Match..."
                        queue_status_text.color = ft.Colors.ORANGE
                        queue_btn.visible = False
                        leave_btn.visible = True
                        leave_btn.disabled = False
                        page.update()

                        print("[WS] Waiting for match...")

                        # Start the timer
                        stop_timer = False
                        timer_thread = threading.Thread(target=update_timer, daemon=True)
                        timer_thread.start()

                    elif status == 'MATCHED':
                        krunker.is_queued = False
                        stop_timer = True

                        assignment = data.get('payload', {}).get('assignment', {})
                        map_name = assignment.get('extensions', {}).get('map', 'Unknown')
                        region = assignment.get('extensions', {}).get('region', 'Unknown').strip()
                        connection = assignment.get('connection', 'Unknown')

                        print(f"[WS] 🎉 MATCH FOUND! 🎉")
                        print(f"[WS] Map: {map_name}")
                        print(f"[WS] Region: {region}")
                        print(f"[WS] Server: {connection}")

                        playsound("https://files.catbox.moe/qprgrz.mp3")
                        queue_status_text.value = "✅ Match Found!"
                        queue_status_text.color = ft.Colors.GREEN
                        timer_text.value = ""

                        match_info.content.controls[2].value = f"Map: {map_name.upper()}\nRegion: {region.upper()}\nServer: {connection}"
                        match_info.visible = True

                        queue_btn.visible = True
                        queue_btn.disabled = False
                        leave_btn.visible = False

                        page.update()

                        ws.close()

            except json.JSONDecodeError as e:
                print(f"[WS] JSON parsing error: {str(e)}")
            except Exception as e:
                print(f"[WS] Error in on_message: {str(e)}")

        def on_error(ws, error):
            print(f"[WS] ❌ WebSocket ERROR: {error}")
            krunker.is_queued = False
            stop_timer = True
            queue_status_text.value = f"❌ Error: {error}"
            queue_status_text.color = ft.Colors.RED
            queue_btn.visible = True
            queue_btn.disabled = False
            leave_btn.visible = False
            timer_text.value = ""
            page.update()

        def on_close(ws, close_status_code, close_msg):
            print(f"[WS] Connection closed")
            if krunker.is_queued:
                queue_status_text.value = "⚠️ Disconnected"
                queue_status_text.color = ft.Colors.ORANGE
                page.update()

        def on_open(ws):
            print(f"[WS] ✅ WebSocket connection established!")
            queue_status_text.value = "🔗 Connected..."
            queue_status_text.color = ft.Colors.BLUE
            page.update()

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.0 Electron/12.0.0-nightly.20201116 Safari/537.36',
            'Origin': 'https://krunker.io'
        }

        krunker.ws = websocket.WebSocketApp(url,
                                         header=headers,
                                         on_message=on_message,
                                         on_error=on_error,
                                         on_close=on_close,
                                         on_open=on_open)

        try:
            krunker.ws.run_forever()
        except Exception as e:
            print(f"[WS] Exception: {str(e)}")

    def on_queue(e):
        """Joins the queue"""
        if not krunker.token:
            queue_status_text.value = "❌ Please login first (go to Login tab)"
            queue_status_text.color = ft.Colors.RED
            page.update()
            update_presence()
            return

        # Update selected regions and maps
        krunker.selected_regions = [k for k, v in regions_map.items() if v.value]
        krunker.selected_maps = [k for k, v in maps_map.items() if v.value]

        if not krunker.selected_regions:
            queue_status_text.value = "❌ Select at least 1 region"
            queue_status_text.color = ft.Colors.RED
            page.update()
            update_presence()
            return

        if not krunker.selected_maps:
            queue_status_text.value = "❌ Select at least 1 map"
            queue_status_text.color = ft.Colors.RED
            page.update()
            update_presence()
            return

        queue_btn.disabled = True
        match_info.visible = False
        queue_status_text.value = "⏳ Joining queue..."
        queue_status_text.color = ft.Colors.BLUE
        page.update()
        update_presence()
        region_codes = {
            'EU': 'eu',
            'NA': 'na',
            'ASIA': 'as'
        }

        regions_str = ','.join([region_codes[r] for r in krunker.selected_regions])
        maps_str = ','.join(krunker.selected_maps)
        ws_url = f"wss://gamefrontend.svc.krunker.io/v1/matchmaking/queue?token={krunker.token}&maps={maps_str}&regions={regions_str}"
        # Start the websocket in a thread
        ws_thread = threading.Thread(target=connect_websocket, args=(ws_url,), daemon=True)
        ws_thread.start()

    def on_leave(e):
        """"Leaves the queue"""
        nonlocal stop_timer

        print("[QUEUE] Leaving queue...")
        krunker.is_queued = False
        stop_timer = True

        if krunker.ws:
            krunker.ws.close()
            print("[WEBSOCKET] Closed")

        queue_status_text.value = "Left queue"
        queue_status_text.color = ft.Colors.ORANGE
        timer_text.value = ""
        queue_btn.visible = True
        queue_btn.disabled = False
        leave_btn.visible = False
        page.update()
        update_presence()

    queue_btn.on_click = on_queue
    leave_btn.on_click = on_leave

    queue_page = ft.Container(
        content=ft.Column([
            ft.Container(height=20),
            ft.Icon(ft.Icons.SPORTS_ESPORTS, size=80, color=ft.Colors.GREEN),
            ft.Text("Ranked Queue", size=32, weight=ft.FontWeight.BOLD),

            ft.Container(height=10),

            # Status
            ft.Container(
                content=ft.Column([
                    queue_status_text,
                    timer_text,
                ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
                bgcolor=ft.Colors.BLUE_GREY_900,
                border_radius=10,
                padding=20,
                width=400,
            ),

            match_info,

            ft.Container(height=20),

            # Queue settings
            ft.Text("🌍 Regions", size=20, weight=ft.FontWeight.BOLD),
            ft.Row([regions_map[k] for k in ['EU', 'NA', 'ASIA']], alignment=ft.MainAxisAlignment.CENTER),

            ft.Container(height=10),

            ft.Text("🗺️ Maps", size=20, weight=ft.FontWeight.BOLD),
            ft.Column([
                ft.Row([maps_map['burg_new'], maps_map['sandstorm_v3'], maps_map['undergrowth']], alignment=ft.MainAxisAlignment.CENTER),
                ft.Row([maps_map['industry'], maps_map['site'], maps_map['bureau']], alignment=ft.MainAxisAlignment.CENTER),
                ft.Row([maps_map['eterno_sim']], alignment=ft.MainAxisAlignment.CENTER),
            ], spacing=5),

            ft.Container(height=20),

            # Queue buttons
            queue_btn,
            leave_btn,

        ],
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        scroll=ft.ScrollMode.AUTO),
        padding=20,
    )

    # ==================== SETTINGS PAGE ====================

    settings_status_text = ft.Text("", size=14, text_align=ft.TextAlign.CENTER)

    # List of clients
    clients_list = ft.ListView(expand=True, spacing=10)

    # Fields to add a custom client
    custom_client_path = ft.TextField(
        label="Custom Client Path",
        width=350,
        hint_text="Example: C:\\Users\\YourName\\AppData\\Local\\YourClient\\Local Storage\\leveldb"
    )

    add_client_btn = ft.ElevatedButton(
        "Add Custom Client",
        width=350,
        height=45,
        icon=ft.Icons.ADD
    )

    def refresh_clients_list():
        """"Updates the list of clients"""
        clients_list.controls = []

        # Add default clients
        for i, path in enumerate(default_paths):
            name = "Crankshaft" if i == 0 else "PC7"
            item = ft.Container(
                content=ft.Row([
                    ft.Text(name, size=16, weight=ft.FontWeight.BOLD),
                    ft.Text(path, size=14, color=ft.Colors.GREY),
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                padding=10,
                bgcolor=ft.Colors.BLUE_GREY_800,
                border_radius=5
            )
            clients_list.controls.append(item)

        # Add custom clients
        for i, client in enumerate(krunker.custom_clients):
            item = ft.Container(
                content=ft.Row([
                    ft.Text(client['name'], size=16, weight=ft.FontWeight.BOLD),
                    ft.Text(client['path'], size=14, color=ft.Colors.GREY),
                    ft.IconButton(
                        icon=ft.Icons.DELETE,
                        icon_color=ft.Colors.RED,
                        on_click=lambda e, idx=i: remove_client(idx)
                    )
                ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                padding=10,
                bgcolor=ft.Colors.BLUE_GREY_800,
                border_radius=5
            )
            clients_list.controls.append(item)

        page.update()

    def add_client(e):
        """Adds a custom client"""
        path = custom_client_path.value.strip()
        if not path:
            settings_status_text.value = "❌ Please enter a valid path"
            settings_status_text.color = ft.Colors.RED
            page.update()
            return

        # Check if the path exists
        if not os.path.exists(path):
            settings_status_text.value = "❌ Path does not exist"
            settings_status_text.color = ft.Colors.RED
            page.update()
            return

        # Extract client name from path
        name = os.path.basename(os.path.dirname(os.path.dirname(path)))

        # Check if client already exists
        for client in krunker.custom_clients:
            if client['path'] == path:
                settings_status_text.value = "❌ This client already exists"
                settings_status_text.color = ft.Colors.RED
                page.update()
                return

        # Add the client
        krunker.custom_clients.append({'name': name, 'path': path})
        settings_status_text.value = f"✓ Added client: {name}"
        settings_status_text.color = ft.Colors.GREEN
        custom_client_path.value = ""
        refresh_clients_list()

    def remove_client(idx):
        """Removes a custom client"""
        if 0 <= idx < len(krunker.custom_clients):
            name = krunker.custom_clients[idx]['name']
            krunker.custom_clients.pop(idx)
            settings_status_text.value = f"✓ Removed client: {name}"
            settings_status_text.color = ft.Colors.GREEN
            refresh_clients_list()

    add_client_btn.on_click = add_client

    settings_page = ft.Container(
        content=ft.Column([
            ft.Container(height=5),
            ft.Icon(ft.Icons.SETTINGS, size=80, color=ft.Colors.BLUE),
            ft.Text("Settings", size=32, weight=ft.FontWeight.BOLD),

            ft.Container(height=5),
            settings_status_text,
            ft.Container(height=5),

            ft.Divider(height=5),

            ft.Text("📁 Client Management", size=20, weight=ft.FontWeight.BOLD),
            ft.Text("Manage your Krunker clients", size=12, color=ft.Colors.GREY),
            ft.Container(height=10),

            # List of clients
            ft.Text("Installed Clients", size=16, weight=ft.FontWeight.BOLD),
            clients_list,

            ft.Container(height=20),
            ft.Divider(height=20),

            # Add custom client
            ft.Text("Add Custom Client", size=16, weight=ft.FontWeight.BOLD),
            custom_client_path,
            add_client_btn,

        ],
        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
        scroll=ft.ScrollMode.AUTO),
        padding=20,
    )

    # ==================== TABS ====================

    tabs = ft.Tabs(
        selected_index=0,
        animation_duration=300,
        tabs=[
            ft.Tab(
                text="Login",
                icon=ft.Icons.LOGIN,
                content=login_page,
            ),
            ft.Tab(
                text="Queue",
                icon=ft.Icons.QUEUE,
                content=queue_page,
            ),
            ft.Tab(
                text="Settings",
                icon=ft.Icons.SETTINGS,
                content=settings_page,
            ),
        ],
        expand=1,
    )

    # Add version text to the app bar
    # app_bar = ft.AppBar(
    #     title=ft.Row([
    #         ft.Text("Krunker External Queue"),
    #         ft.Container(version_text, alignment=ft.alignment.center_right, expand=True)
    #     ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
    #     center_title=False,
    #     bgcolor=ft.Colors.BLUE_900,
    # )

    page.add(tabs)

    # Close RPC when the app closes
    def on_window_event(e):
        if e.data == "close":
            if RPC is not None:
                RPC.close()
                print("Rich Presence disconnected")

    page.on_window_event = on_window_event

if __name__ == "__main__":
    ft.app(target=main)

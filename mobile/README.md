# WedaLink mobile app

Customer + provider app (Expo, TypeScript).

## Run with Expo Go and the local API

A physical phone cannot use `localhost` to reach the development computer. Both
the phone and computer must be on the same Wi-Fi network, and the API must
listen on the computer's network interface.

1. In `mobile`, copy `.env.example` to `.env`. On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Find the computer's Wi-Fi IPv4 address with `ipconfig`, then replace
   `YOUR_PC_WIFI_IP` in `mobile/.env` with that address. For example, use
   `10.0.0.25` if that is the computer's Wi-Fi IPv4 address. Do not use a
   VirtualBox/VM adapter address such as `192.168.56.1`.

3. Start the backend from `backend` and bind it to all interfaces:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

   If Windows Firewall prompts, allow Python on the private network. Keep the
   backend process running.

4. On the phone, open `http://<YOUR_PC_WIFI_IP>:8000/health` in a browser. It
   should return a healthy response. If it does not, check the IP, Wi-Fi
   network, firewall, and backend bind address before trying the app.

5. In `mobile`, restart Expo so it reads the new environment values, then scan
   its QR code:

   ```powershell
   npm run start -- --clear
   ```

For an Android emulator instead of a physical phone, the host computer is
usually reachable at `10.0.2.2`; use that address in `.env`. The `localhost`
fallback in the app is intended for web/local development, not a physical phone.

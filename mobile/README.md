# RestoMaster Mobile

Expo React Native customer app for the RestoMaster POS platform.

## Run locally

```bash
cd mobile
npm install
npm start
```

Then press `a` for Android, `i` for iOS on macOS, or `w` for web.

## Backend URL

The app reads `EXPO_PUBLIC_API_URL` and falls back to `http://localhost:8080/api`.

For an Android emulator, use the host machine address:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://10.0.2.2:8080/api"
npm start
```

For a physical device, use the computer's LAN IP or the deployed HTTPS backend URL.

## Validation

```bash
npm run typecheck
```

The current customer slice includes outlet branding, menu search and categories, API loading with offline fallback data, cart and checkout state, order history, profile shortcuts, and WhatsApp support.

Development login:
Email: customer@restomaster.io
Password: Customer@123
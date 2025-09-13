# Mobile App Network Configuration

## Overview
The mobile app now uses intelligent network configuration that automatically detects the correct API URL based on your development environment.

## How It Works

### Automatic Detection
- **Physical Device**: Uses your machine's IP address with port 4000
- **iOS Simulator**: Uses `localhost:4000`
- **Android Emulator**: Uses `10.0.2.2:4000`

### Backend Port
The backend runs on **port 4000**, not 3000.

## Setup Instructions

### 1. For Development (Recommended)
Leave the `.env` file empty or remove the `EXPO_PUBLIC_API_URL` line:
```bash
# API Configuration
EXPO_PUBLIC_API_URL=

# App Configuration
EXPO_PUBLIC_APP_NAME=TradeByBarter
EXPO_PUBLIC_APP_VERSION=1.0.0
```

The app will automatically detect the correct URL.

### 2. For Production
Set the production API URL in `.env`:
```bash
EXPO_PUBLIC_API_URL=https://api.tradebybarter.com/api/v1
```

## Testing

### On Simulator
1. Start your backend: `cd backend && npm run start:dev`
2. Start Expo: `cd mobile && npx expo start`
3. Open in iOS Simulator or Android Emulator
4. The app will use `localhost:4000` or `10.0.2.2:4000`

### On Physical Device
1. Make sure your phone and computer are on the same WiFi network
2. Start your backend: `cd backend && npm run start:dev`
3. Start Expo: `cd mobile && npx expo start`
4. Scan the QR code with Expo Go
5. The app will automatically use your machine's IP with port 4000

## Debugging Network Issues

### Check Network Configuration
The app logs network configuration on startup. Check the console for:
```
Network Configuration:
Base URL: http://[YOUR_IP]:4000/api/v1
Platform: ios/android
Environment: Development
Device Type: Physical Device/Simulator
```

### Test API Connection
Use the built-in validation function:
```typescript
import { validateApiConnection } from '@/constants/network';

const result = await validateApiConnection();
console.log(result);
```

### Common Issues

1. **Backend not running**: Make sure your backend is running on port 4000
2. **Wrong IP**: The app uses Expo's debugger host IP - make sure Expo is running
3. **Firewall**: Ensure your firewall allows connections on port 4000
4. **Network**: Phone and computer must be on same WiFi network

## Network Configuration Details

The network detection logic:
1. Checks for `EXPO_PUBLIC_API_URL` environment variable
2. Gets Expo's debugger host IP
3. If debugger host exists and isn't localhost → Physical device
4. If Android → Use `10.0.2.2:4000`
5. If iOS → Use `localhost:4000`

This ensures the app works seamlessly across all development environments.
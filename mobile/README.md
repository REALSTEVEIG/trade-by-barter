# TradeByBarter Mobile App

A modern React Native Expo TypeScript mobile application for the TradeByBarter Nigerian barter marketplace platform.

##  Features

- **React Native**: Cross-platform mobile development
- **Expo SDK**: Rapid development and deployment
- **TypeScript**: Full type safety and modern JavaScript features
- **Navigation**: React Navigation for smooth screen transitions
- **Authentication**: Secure user authentication with biometric support
- **Maps Integration**: Google Maps for location-based features
- **Camera & Gallery**: Image capture and selection
- **Push Notifications**: Real-time notifications
- **Offline Support**: Works without internet connection
- **Performance**: Optimized for smooth user experience
- **Testing**: Unit and integration tests with Jest
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration
- **Git Hooks**: Pre-commit hooks for code quality enforcement

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 18.0.0)
- **npm** (>= 9.0.0)
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**

### Development Environment Setup

#### For iOS Development:
- **macOS** (required for iOS development)
- **Xcode** (latest version)
- **iOS Simulator**

#### For Android Development:
- **Android Studio**
- **Android SDK**
- **Android Emulator** or physical device

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual configuration values:
   ```env
   EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="your-google-web-client-id"
   # ... other variables
   ```

##  Running the Application

### Start the Development Server
```bash
npm start
```

This will start the Expo development server and show a QR code.

### Run on Specific Platforms

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

#### Web Browser
```bash
npm run web
```

### Using Expo Go App
1. Install Expo Go on your physical device
2. Scan the QR code shown in terminal
3. The app will load on your device

##  Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Start on Android emulator/device |
| `npm run ios` | Start on iOS simulator/device |
| `npm run web` | Start web version |
| `npm run build` | Build the app for production |
| `npm run build:android` | Build Android APK |
| `npm run build:ios` | Build iOS app |
| `npm run lint` | Run ESLint and fix issues |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run check-emojis` | Scan codebase for emoji violations |
| `npm run validate` | Run all validation checks |

##  Project Structure

```
mobile/
├── src/                       # Source code (if using custom structure)
├── assets/                    # Static assets
│   ├── images/               # Image assets
│   ├── icons/                # Icon assets
│   ├── fonts/                # Custom fonts
│   └── sounds/               # Audio files
├── components/               # Reusable UI components
│   ├── common/              # Common components
│   ├── forms/               # Form components
│   ├── navigation/          # Navigation components
│   └── ui/                  # Base UI components
├── screens/                 # Screen components
│   ├── auth/               # Authentication screens
│   ├── home/               # Home screens
│   ├── profile/            # Profile screens
│   ├── products/           # Product screens
│   └── trades/             # Trading screens
├── navigation/             # Navigation configuration
├── hooks/                  # Custom React hooks
├── services/              # API and external services
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── store/                 # State management
├── constants/             # App constants
├── config/                # Configuration files
├── scripts/               # Utility scripts
├── .env.example           # Environment variables template
├── .eslintrc.js          # ESLint configuration
├── .prettierrc.js        # Prettier configuration
├── .commitlintrc.js      # Commit message linting
├── app.json              # Expo configuration
├── expo.json             # Additional Expo settings
├── App.tsx               # Root component
└── README.md             # This file
```

##  Platform-Specific Features

### iOS Features
- **Face ID/Touch ID**: Biometric authentication
- **Haptic Feedback**: Native haptic responses
- **iOS Share Sheet**: Native sharing
- **App Store Guidelines**: Compliant with iOS standards

### Android Features
- **Fingerprint Auth**: Biometric authentication
- **Android Permissions**: Runtime permission handling
- **Material Design**: Android design principles
- **Play Store Guidelines**: Compliant with Android standards

##  Authentication

The app supports multiple authentication methods:

- **Email/Password**: Traditional authentication
- **Social Login**: Google, Facebook, Apple
- **Biometric Auth**: Fingerprint, Face ID, Touch ID
- **Phone Number**: SMS verification
- **Guest Mode**: Limited functionality without account

### Biometric Authentication Setup
```bash
expo install expo-local-authentication
```

##  Maps & Location

### Google Maps Integration
1. Get Google Maps API key
2. Enable required APIs in Google Cloud Console
3. Add API key to environment variables
4. Configure platform-specific settings

### Required APIs
- Maps JavaScript API
- Maps SDK for Android
- Maps SDK for iOS
- Places API
- Geocoding API

##  Camera & Media

### Camera Features
- Photo capture
- Video recording
- Gallery selection
- Image editing
- QR code scanning

### Setup
```bash
expo install expo-camera expo-image-picker expo-media-library
```

##  Push Notifications

### Expo Push Notifications
1. Configure Expo push token
2. Set up notification categories
3. Handle notification responses
4. Background notification handling

### Firebase Cloud Messaging (FCM)
For more advanced notification features:
1. Set up Firebase project
2. Configure FCM for Android/iOS
3. Implement custom notification handling

##  Styling & Theming

### Styling Approach
- **StyleSheet**: React Native's built-in styling
- **Styled Components**: CSS-in-JS (optional)
- **Theme Provider**: Consistent theming
- **Responsive Design**: Screen size adaptation
- **Dark Mode**: Support for dark/light themes

### Design System
- Consistent color palette
- Typography scale
- Spacing system
- Component variants
- Animation guidelines

##  Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Stack
- **Jest**: Testing framework
- **React Native Testing Library**: Component testing
- **Detox**: E2E testing (optional)
- **Maestro**: Mobile UI testing (alternative)

##  Performance Optimization

### React Native Performance
- Optimized FlatList usage
- Image optimization
- Bundle splitting
- Memory management
- Navigation optimization

### Expo Optimization
- OTA updates
- Asset optimization
- Bundle size reduction
- Startup time optimization

##  Code Quality & Standards

### Zero Emoji Policy
This project enforces a **ZERO-TOLERANCE policy for emojis** in the codebase. All commits are automatically scanned for emoji characters and will be rejected if any are found.

### Code Style
- **ESLint**: Enforces coding standards and catches errors
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Strict mode enabled for maximum type safety
- **Conventional Commits**: Standardized commit message format

### Pre-commit Hooks
Before each commit, the following checks are automatically run:
- Emoji detection and rejection
- ESLint validation
- TypeScript compilation check
- Commit message format validation

### Commit Message Format
```
type(scope): Description

Examples:
feat(auth): Add biometric authentication
fix(navigation): Resolve screen transition issue
feat(camera): Implement QR code scanning
docs(readme): Update installation instructions
```

##  Building & Deployment

### Development Builds
```bash
# Build for development
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Production Builds
```bash
# Build for production
eas build --profile production --platform android
eas build --profile production --platform ios
```

### App Store Deployment

#### iOS App Store
1. Create App Store Connect entry
2. Configure app metadata
3. Upload build with Transporter
4. Submit for review

#### Google Play Store
1. Create Google Play Console entry
2. Configure store listing
3. Upload APK/AAB
4. Submit for review

### Over-the-Air (OTA) Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

##  Key Libraries

| Library | Purpose |
|---------|---------|
| Expo | Development platform |
| React Navigation | Navigation |
| React Native Async Storage | Local storage |
| Expo Location | GPS and location |
| Expo Camera | Camera functionality |
| Expo Notifications | Push notifications |
| React Hook Form | Form handling |
| Zustand | State management |
| React Query | Data fetching |
| Reanimated | Animations |

##  Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
npx expo start --clear
```

#### iOS build issues
```bash
cd ios && pod install
```

#### Android build issues
```bash
npx expo run:android --clean
```

#### Environment variables not loading
- Ensure `.env` file is in root directory
- Restart Expo development server
- Check variable naming (must start with `EXPO_PUBLIC_`)

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes following the coding standards
4. Ensure all tests pass: `npm run test`
5. Run validation checks: `npm run validate`
6. Test on both iOS and Android
7. Commit using conventional commit format
8. Push to your branch: `git push origin feat/amazing-feature`
9. Create a Pull Request

##  License

This project is proprietary software. All rights reserved.

##  Support

For support and questions, contact the development team at `dev@tradebybarter.com`
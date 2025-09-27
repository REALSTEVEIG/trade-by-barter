import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/auth-context';
import { COLORS } from '@/constants';

// Auth Screens
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import SplashScreen from '@/screens/auth/SplashScreen';

// Main App Screens
import FeedScreen from '@/screens/main/FeedScreen';
import SearchScreen from '@/screens/main/SearchScreen';
import CreateListingScreen from '@/screens/main/CreateListingScreen';
import ChatListScreen from '@/screens/chat/ChatListScreen';
import ChatScreen from '@/screens/chat/ChatScreen';
import WalletScreen from '@/screens/wallet/WalletScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import ListingDetailScreen from '@/screens/main/ListingDetailScreen';
import OffersScreen from '@/screens/offers/OffersScreen';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Create: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  ListingDetail: { listingId: string };
  Chat: { chatId: string; otherUserId?: string; listingId?: string };
  Wallet: undefined;
  Offers: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Auth Navigator with memo to prevent unnecessary resets
const AuthNavigator = React.memo(() => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
});

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconProps = {
            size: size,
            color: color,
            strokeWidth: focused ? 2.5 : 2,
          };

          switch (route.name) {
            case 'Feed':
              return <Home {...iconProps} />;
            case 'Search':
              return <Search {...iconProps} />;
            case 'Create':
              return <PlusCircle {...iconProps} />;
            case 'Chats':
              return <MessageCircle {...iconProps} />;
            case 'Profile':
              return <User {...iconProps} />;
            default:
              return <Home {...iconProps} />;
          }
        },
        tabBarActiveTintColor: COLORS.primary.DEFAULT,
        tabBarInactiveTintColor: COLORS.neutral.gray,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: COLORS.neutral.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'System',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <MainTab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      <MainTab.Screen 
        name="Create" 
        component={CreateListingScreen}
        options={{ tabBarLabel: 'Post' }}
      />
      <MainTab.Screen 
        name="Chats" 
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chats' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </MainTab.Navigator>
  );
}

// App Navigator (Main app with stacks)
function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary.DEFAULT,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <AppStack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
      <AppStack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ title: 'My Wallet' }}
      />
      <AppStack.Screen 
        name="Offers" 
        component={OffersScreen}
        options={{ title: 'My Offers' }}
      />
    </AppStack.Navigator>
  );
}

// Root Navigator with stable navigation structure
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      screenListeners={{
        // Prevent navigation state reset on auth changes
        beforeRemove: (e) => {
          // Allow normal navigation but prevent auth-related resets
          if (e.data.action.type === 'RESET') {
            // Allow reset only for authentication changes, not auth state updates
            return;
          }
        },
      }}
    >
      {isAuthenticated ? (
        <RootStack.Screen
          key="main"
          name="Main"
          component={AppNavigator}
        />
      ) : (
        <RootStack.Screen
          key="auth"
          name="Auth"
          component={AuthNavigator}
          options={{
            // Ensure screen doesn't remount on auth state changes
            freezeOnBlur: false,
          }}
        />
      )}
    </RootStack.Navigator>
  );
}

// Main Navigation Container
export default function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
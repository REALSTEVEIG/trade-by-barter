import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { ToastProvider } from '@/contexts/toast-context';
import Navigation from '@/navigation';
import { ToastManager } from '@/components/ui';
import ToastContainer from '@/components/ui/ToastContainer';
import { COLORS } from '@/constants';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NotificationProvider>
          <ToastProvider>
            <AuthProvider>
              <StatusBar style="light" backgroundColor={COLORS.primary.DEFAULT} />
              <Navigation />
              <ToastManager />
              <ToastContainer />
            </AuthProvider>
          </ToastProvider>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

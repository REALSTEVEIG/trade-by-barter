import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '@/constants';
import { useToast } from '@/contexts/toast-context';
import Button from '@/components/ui/Button';

const WalletScreen: React.FC = () => {
  const { showToast } = useToast();

  const handleTopUp = () => {
    showToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Wallet top-up with Paystack will be available soon!',
      duration: 3000,
    });
  };

  const handleWithdraw = () => {
    showToast({
      type: 'info',
      title: 'Coming Soon',
      message: 'Wallet withdrawal will be available soon!',
      duration: 3000,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Wallet size={80} color={COLORS.primary.DEFAULT} />
        </View>
        
        <Text style={styles.title}>My Wallet</Text>
        <Text style={styles.subtitle}>
          Manage your Nigerian Naira balance
        </Text>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₦0.00</Text>
        </View>
        
        <Text style={styles.description}>
          Your wallet will integrate with Paystack for secure payments, top-ups, and withdrawals to Nigerian bank accounts.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Top Up Wallet"
            onPress={handleTopUp}
            variant="primary"
            size="lg"
            style={styles.button}
          />
          
          <Button
            title="Withdraw Funds"
            onPress={handleWithdraw}
            variant="outline"
            size="lg"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    marginBottom: 32,
  },
  balanceCard: {
    backgroundColor: COLORS.primary[50],
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  actions: {
    alignSelf: 'stretch',
  },
  button: {
    marginBottom: 16,
  },
});

export default WalletScreen;
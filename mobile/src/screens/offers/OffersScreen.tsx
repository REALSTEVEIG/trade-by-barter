import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '@/constants';
import Button from '@/components/ui/Button';

const OffersScreen: React.FC = () => {
  const handleViewOffers = () => {
    Alert.alert('Coming Soon', 'Viewing offers will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ArrowLeftRight size={80} color={COLORS.primary.DEFAULT} />
        </View>
        
        <Text style={styles.title}>My Offers</Text>
        <Text style={styles.subtitle}>
          Track all your trade offers and negotiations
        </Text>
        
        <Text style={styles.description}>
          Here you'll be able to see all offers you've made and received, track their status, and manage your negotiations.
        </Text>

        <Button
          title="View All Offers"
          onPress={handleViewOffers}
          variant="primary"
          size="lg"
          style={styles.button}
        />
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
    marginBottom: 16,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    alignSelf: 'stretch',
  },
});

export default OffersScreen;
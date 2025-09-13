import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '@/navigation';
import { COLORS, TYPOGRAPHY } from '@/constants';
import Button from '@/components/ui/Button';

type ListingDetailRouteProp = RouteProp<AppStackParamList, 'ListingDetail'>;

const ListingDetailScreen: React.FC = () => {
  const route = useRoute<ListingDetailRouteProp>();
  const { listingId } = route.params;

  const handleMakeOffer = () => {
    Alert.alert('Coming Soon', 'Making offers will be available soon!');
  };

  const handleContact = () => {
    Alert.alert('Coming Soon', 'Contacting sellers will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={80} color={COLORS.primary.DEFAULT} />
        </View>
        
        <Text style={styles.title}>Listing Details</Text>
        <Text style={styles.subtitle}>
          Listing ID: {listingId}
        </Text>
        <Text style={styles.description}>
          This screen will show detailed information about the selected listing including photos, description, price, and seller information.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Make an Offer"
            onPress={handleMakeOffer}
            variant="primary"
            size="lg"
            style={styles.button}
          />
          
          <Button
            title="Contact Seller"
            onPress={handleContact}
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
    marginBottom: 8,
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

export default ListingDetailScreen;
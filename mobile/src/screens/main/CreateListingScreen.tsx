import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '@/constants';
import Button from '@/components/ui/Button';

const CreateListingScreen: React.FC = () => {
  const handleCreateListing = () => {
    Alert.alert('Coming Soon', 'Listing creation will be available soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="add-circle-outline" size={80} color={COLORS.primary.DEFAULT} />
        </View>
        
        <Text style={styles.title}>Create New Listing</Text>
        <Text style={styles.subtitle}>
          Share what you want to trade or sell with the TradeByBarter community
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="camera-outline" size={24} color={COLORS.secondary.DEFAULT} />
            <Text style={styles.featureText}>Add photos</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pricetag-outline" size={24} color={COLORS.secondary.DEFAULT} />
            <Text style={styles.featureText}>Set price or trade preference</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="location-outline" size={24} color={COLORS.secondary.DEFAULT} />
            <Text style={styles.featureText}>Add location</Text>
          </View>
        </View>

        <Button
          title="Start Creating"
          onPress={handleCreateListing}
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
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginLeft: 16,
  },
  button: {
    alignSelf: 'stretch',
  },
});

export default CreateListingScreen;
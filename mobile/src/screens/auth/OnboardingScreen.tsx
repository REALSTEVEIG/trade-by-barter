import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { ArrowLeftRight, Users, ShieldCheck, HelpCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '@/constants';
import { Button } from '@/components/ui';

interface OnboardingSlide {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: ArrowLeftRight,
    title: 'Trade goods-for-goods',
    subtitle: 'Exchange items directly with other users. No money involved, just fair trades.',
  },
  {
    id: '2',
    icon: Users,
    title: 'Connect with traders',
    subtitle: 'Join a community of trusted traders across Nigeria. Build your reputation through successful trades.',
  },
  {
    id: '3',
    icon: ShieldCheck,
    title: 'Safe and secure',
    subtitle: 'Trade with confidence using our secure platform. Every user is verified for your safety.',
  },
];

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      // Navigate to login/signup
      console.log('Navigate to auth');
    }
  };

  const handleSkip = () => {
    // Navigate to login/signup
    console.log('Skip to auth');
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        {React.createElement(item.icon, {
          size: 64,
          color: "#FFFFFF"
        })}
      </View>
      
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.neutral.light}
        translucent={false}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>TradeByBarter</Text>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HelpCircle
            size={24}
            color={COLORS.neutral.gray}
          />
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        style={styles.slideContainer}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {renderPagination()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipTextButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          
          <Button
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  skipButton: {
    padding: 4,
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.accent.DEFAULT,
  },
  inactiveDot: {
    backgroundColor: COLORS.neutral.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipTextButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  nextButton: {
    paddingHorizontal: 32,
    borderRadius: 25,
  },
});

export default OnboardingScreen;
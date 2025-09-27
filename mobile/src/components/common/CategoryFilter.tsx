import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, PRODUCT_CATEGORIES } from '@/constants';

export interface CategoryFilterProps {
  selectedCategory?: string;
  onCategorySelect: (category: string) => void;
  categories?: Array<{ value: string; label: string }>;
  style?: ViewStyle;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
  categories = PRODUCT_CATEGORIES.slice(0, 8), // Show first 8 category objects
  style,
}) => {
  const renderCategoryPill = (categoryObj: { value: string; label: string }, index: number) => {
    const isSelected = selectedCategory === categoryObj.value;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.categoryPill,
          isSelected && styles.categoryPillSelected,
        ]}
        onPress={() => onCategorySelect(categoryObj.value)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.categoryText,
          isSelected && styles.categoryTextSelected,
        ]}>
          {categoryObj.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* "All" category option */}
        <TouchableOpacity
          style={[
            styles.categoryPill,
            !selectedCategory && styles.categoryPillSelected,
          ]}
          onPress={() => onCategorySelect('')}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.categoryText,
            !selectedCategory && styles.categoryTextSelected,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map(renderCategoryPill)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPillSelected: {
    backgroundColor: COLORS.primary.DEFAULT,
    borderColor: COLORS.primary.DEFAULT,
  },
  categoryText: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.neutral.dark,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CategoryFilter;
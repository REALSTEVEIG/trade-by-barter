import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Check,
  ArrowLeft,
  Camera,
  ChevronDown
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  NIGERIAN_STATES, 
  CATEGORIES, 
  PRODUCT_CONDITIONS,
  TRADE_OPTIONS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES 
} from '@/constants';
import { listingsApi } from '@/lib/api';
import Button from '@/components/ui/Button';

interface CreateListingFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  priceInKobo: number;
  state: string;
  city: string;
  specificLocation: string;
  acceptsCash: boolean;
  acceptsSwap: boolean;
  isSwapOnly: boolean;
  swapPreferences: string;
  images: { uri: string; type: string; name: string }[];
}

interface DropdownItem {
  label: string;
  value: string;
}

const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [formData, setFormData] = useState<CreateListingFormData>({
    title: '',
    description: '',
    category: '',
    condition: '',
    priceInKobo: 0,
    state: '',
    city: '',
    specificLocation: '',
    acceptsCash: true,
    acceptsSwap: true,
    isSwapOnly: false,
    swapPreferences: '',
    images: []
  });

  const handleImagePicker = async () => {
    if (formData.images.length >= 6) {
      Alert.alert('Limit Reached', 'You can only add up to 6 photos');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => openImagePicker('camera') },
        { text: 'Gallery', onPress: () => openImagePicker('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newImage = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`
      };

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof CreateListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTradeTypeChange = (tradeType: string) => {
    switch (tradeType) {
      case 'swap':
        setFormData(prev => ({
          ...prev,
          acceptsCash: false,
          acceptsSwap: true,
          isSwapOnly: true,
        }));
        break;
      case 'cash':
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: false,
          isSwapOnly: false,
        }));
        break;
      case 'both':
      default:
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: true,
          isSwapOnly: false,
        }));
        break;
    }
  };

  const getCurrentTradeType = (): string => {
    if (formData.isSwapOnly && formData.acceptsSwap && !formData.acceptsCash) {
      return 'swap';
    } else if (formData.acceptsCash && !formData.acceptsSwap) {
      return 'cash';
    } else {
      return 'both';
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Validation Error', 'Category is required');
      return false;
    }
    if (!formData.condition) {
      Alert.alert('Validation Error', 'Condition is required');
      return false;
    }
    if (!formData.state) {
      Alert.alert('Validation Error', 'State is required');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Validation Error', 'City is required');
      return false;
    }
    if (formData.images.length === 0) {
      Alert.alert('Validation Error', 'At least one photo is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('priceInKobo', formData.priceInKobo.toString());
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('specificLocation', formData.specificLocation);
      formDataToSend.append('acceptsCash', formData.acceptsCash.toString());
      formDataToSend.append('acceptsSwap', formData.acceptsSwap.toString());
      formDataToSend.append('isSwapOnly', formData.isSwapOnly.toString());
      
      if (formData.swapPreferences) {
        formDataToSend.append('swapPreferences', JSON.stringify([formData.swapPreferences]));
      }
      
      // Add images
      formData.images.forEach((image) => {
        formDataToSend.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      });

      await listingsApi.createListing(formDataToSend);
      Alert.alert('Success', SUCCESS_MESSAGES.LISTING_CREATED, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomDropdown = ({
    items,
    selectedValue,
    onValueChange,
    placeholder,
    isVisible,
    onClose
  }: {
    items: DropdownItem[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    isVisible: boolean;
    onClose: () => void;
  }) => (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {placeholder}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={COLORS.neutral.dark} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedValue === item.value && styles.modalItemSelected
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedValue === item.value && styles.modalItemTextSelected
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <Check size={20} color={COLORS.primary.DEFAULT} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const getSelectedLabel = (items: DropdownItem[], value: string, placeholder: string) => {
    const item = items.find(item => item.value === value);
    return item ? item.label : placeholder;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.neutral.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post an Item</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photos</Text>
            <View style={styles.imageGrid}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {formData.images.length < 6 && (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleImagePicker}
                >
                  <Camera size={24} color={COLORS.neutral.gray} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.photoHint}>Add up to 6 photos. First photo will be your main image.</Text>
          </View>

          {/* Item Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholder="What are you trading?"
                placeholderTextColor={COLORS.neutral.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Describe your item in detail..."
                placeholderTextColor={COLORS.neutral.gray}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.category && styles.dropdownPlaceholder]}>
                    {getSelectedLabel(CATEGORIES, formData.category, 'Select category')}
                  </Text>
                  <ChevronDown size={20} color={COLORS.neutral.gray} />
                </TouchableOpacity>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Condition *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowConditionModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.condition && styles.dropdownPlaceholder]}>
                    {getSelectedLabel(PRODUCT_CONDITIONS, formData.condition, 'Select condition')}
                  </Text>
                  <ChevronDown size={20} color={COLORS.neutral.gray} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Value (₦)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.priceInKobo > 0 ? (formData.priceInKobo / 100).toString() : ''}
                  onChangeText={(text) => handleInputChange('priceInKobo', parseFloat(text || '0') * 100)}
                  placeholder="0"
                  placeholderTextColor={COLORS.neutral.gray}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>Estimated value of your item</Text>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.state && styles.dropdownPlaceholder]}>
                    {formData.state || 'Select state'}
                  </Text>
                  <ChevronDown size={20} color={COLORS.neutral.gray} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="Enter your city"
                placeholderTextColor={COLORS.neutral.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specific Location (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.specificLocation}
                onChangeText={(text) => handleInputChange('specificLocation', text)}
                placeholder="e.g., Computer Village, Ikeja"
                placeholderTextColor={COLORS.neutral.gray}
              />
            </View>
          </View>

          {/* Trading Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How do you want to trade?</Text>
            
            {TRADE_OPTIONS.map((option) => {
              const isSelected = getCurrentTradeType() === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.tradeOption, isSelected && styles.tradeOptionSelected]}
                  onPress={() => handleTradeTypeChange(option.value)}
                >
                  <View style={styles.radioContainer}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.tradeOptionContent}>
                      <Text style={[styles.tradeOptionTitle, isSelected && styles.tradeOptionTitleSelected]}>
                        {option.label}
                      </Text>
                      <Text style={styles.tradeOptionDescription}>{option.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {formData.acceptsSwap && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>What are you looking for in exchange? (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.swapPreferences}
                  onChangeText={(text) => handleInputChange('swapPreferences', text)}
                  placeholder="e.g., iPhone, Laptop, etc."
                  placeholderTextColor={COLORS.neutral.gray}
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title={isLoading ? 'Posting...' : 'Post Item'}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              disabled={isLoading}
              loading={isLoading}
              fullWidth
            />
          </View>
        </ScrollView>

        {/* Custom Dropdowns */}
        <CustomDropdown
          items={CATEGORIES}
          selectedValue={formData.category}
          onValueChange={(value) => handleInputChange('category', value)}
          placeholder="Category"
          isVisible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        />

        <CustomDropdown
          items={PRODUCT_CONDITIONS}
          selectedValue={formData.condition}
          onValueChange={(value) => handleInputChange('condition', value)}
          placeholder="Condition"
          isVisible={showConditionModal}
          onClose={() => setShowConditionModal(false)}
        />

        <CustomDropdown
          items={NIGERIAN_STATES.map(state => ({ label: state, value: state }))}
          selectedValue={formData.state}
          onValueChange={(value) => handleInputChange('state', value)}
          placeholder="State"
          isVisible={showStateModal}
          onClose={() => setShowStateModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: SPACING.md,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.status.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  photoHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.neutral.dark,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  dropdownText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  dropdownPlaceholder: {
    color: COLORS.neutral.gray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  modalItemSelected: {
    backgroundColor: COLORS.primary[50],
  },
  modalItemText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.dark,
  },
  modalItemTextSelected: {
    color: COLORS.primary.DEFAULT,
    fontWeight: '500',
  },
  inputHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    marginTop: SPACING.xs,
  },
  tradeOption: {
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tradeOptionSelected: {
    borderColor: COLORS.primary.DEFAULT,
    backgroundColor: COLORS.primary[50],
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  radioSelected: {
    borderColor: COLORS.primary.DEFAULT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.DEFAULT,
  },
  tradeOptionContent: {
    flex: 1,
  },
  tradeOptionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.neutral.dark,
  },
  tradeOptionTitleSelected: {
    color: COLORS.primary.DEFAULT,
  },
  tradeOptionDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    marginTop: 2,
  },
  submitContainer: {
    marginVertical: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
});

export default CreateListingScreen;
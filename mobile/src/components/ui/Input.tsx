import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '@/constants';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      marginBottom: 16,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: '#F9FAFB',
      borderWidth: 1,
      borderColor: error ? '#EF4444' : isFocused ? COLORS.primary.DEFAULT : COLORS.neutral.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: multiline ? 12 : 0,
      minHeight: multiline ? 80 : 48,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontFamily: TYPOGRAPHY.fontFamily.inter,
      fontSize: TYPOGRAPHY.fontSize.base,
      color: COLORS.neutral.dark,
      paddingVertical: multiline ? 0 : 12,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontFamily: TYPOGRAPHY.fontFamily.inter,
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: '500',
      color: COLORS.neutral.dark,
      marginBottom: 6,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontFamily: TYPOGRAPHY.fontFamily.inter,
      fontSize: TYPOGRAPHY.fontSize.xs,
      color: '#EF4444',
      marginTop: 4,
    };
  };

  const shouldShowPasswordToggle = secureTextEntry && rightIcon === undefined;
  const finalSecureTextEntry = secureTextEntry && !isPasswordVisible;
  const finalRightIcon = shouldShowPasswordToggle 
    ? (isPasswordVisible ? 'eye-off' : 'eye')
    : rightIcon;

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
          {required && <Text style={{ color: '#EF4444' }}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary.DEFAULT : COLORS.neutral.gray}
            style={{ marginRight: 8 }}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.neutral.gray}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={finalSecureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />
        
        {finalRightIcon && (
          <TouchableOpacity
            onPress={shouldShowPasswordToggle ? handleTogglePasswordVisibility : onRightIconPress}
            style={{ marginLeft: 8 }}
            disabled={!shouldShowPasswordToggle && !onRightIconPress}
          >
            <Ionicons
              name={finalRightIcon}
              size={20}
              color={isFocused ? COLORS.primary.DEFAULT : COLORS.neutral.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={getErrorStyle()}>{error}</Text>}
    </View>
  );
};


export default Input;
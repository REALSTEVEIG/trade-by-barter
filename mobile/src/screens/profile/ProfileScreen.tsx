import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/auth-context';
import { COLORS, TYPOGRAPHY, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { authApi } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout, refreshUser } = useAuth();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose how you want to update your profile picture',
      [
        { text: 'Take Photo', onPress: () => openImagePicker('camera') },
        { text: 'Choose from Gallery', onPress: () => openImagePicker('library') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        await updateProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const updateProfilePicture = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUpdatingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`
      } as any);

      await authApi.updateProfile(formData);
      await refreshUser();
      
      Alert.alert('Success', SUCCESS_MESSAGES.PROFILE_UPDATED);
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your profile information',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon!'),
    },
    {
      icon: 'list-outline',
      title: 'My Listings',
      subtitle: 'View and manage your items',
      onPress: () => {},
    },
    {
      icon: 'heart-outline',
      title: 'Favorites',
      subtitle: 'Items you liked',
      onPress: () => {},
    },
    {
      icon: 'swap-horizontal-outline',
      title: 'My Offers',
      subtitle: 'Track your trade offers',
      onPress: () => navigation.navigate('Offers' as any),
    },
    {
      icon: 'wallet-outline',
      title: 'Wallet',
      subtitle: 'Manage your payments',
      onPress: () => navigation.navigate('Wallet' as any),
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Verification',
      subtitle: 'Verify your account',
      onPress: () => {},
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact us',
      onPress: () => {},
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons
          name={item.icon}
          size={24}
          color={COLORS.primary.DEFAULT}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.neutral.gray}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            style={styles.avatarContainer}
            disabled={isUpdatingAvatar}
          >
            <Avatar
              source={user?.avatar ? { uri: user.avatar } : undefined}
              name={user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
              size="xl"
              style={styles.avatar}
            />
            <View style={styles.cameraIcon}>
              {isUpdatingAvatar ? (
                <Ionicons name="refresh" size={16} color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>
            {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Trades</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="lg"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary[50],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    // marginBottom: 16,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: 4,
  },
  email: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.neutral.border,
    marginHorizontal: 16,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  menuSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 2,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  logoutButton: {
    borderColor: COLORS.status.error,
  },
});

export default ProfileScreen;
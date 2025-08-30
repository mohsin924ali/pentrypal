// ========================================
// Main Navigator - Bottom Tab Navigation
// ========================================

import React, { type FC } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../providers/ThemeProvider';
import { Typography } from '../components/atoms/Typography/Typography';
import { selectFriendRequests } from '../../application/store/slices/socialSlice';

// Screens
import { DashboardScreen } from '../screens/Dashboard';
import { ListsStackNavigator } from './ListsStackNavigator';
import { PantryScreen } from '../screens/Pantry';
import { SocialScreen } from '../screens/Social';
import { ProfileScreen } from '../screens/Profile';
import { ShopScreen } from '../screens/Shop';

// Navigation Icons
const HomeIcon = require('../../assets/images/Home.png');
const ListIcon = require('../../assets/images/List.png');
const PantryIcon = require('../../assets/images/Pantry.png');
const ShopIcon = require('../../assets/images/Shop.png');
const SocialIcon = require('../../assets/images/Social.png');
const ProfileIcon = require('../../assets/images/Profile.png');

// Types
export type MainTabParamList = {
  Dashboard: undefined;
  Lists: undefined;
  Pantry: undefined;
  Shop: undefined;
  Social: undefined;
  Profile: undefined;
};

// Create tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Navigator Component
 *
 * Bottom tab navigation for the main app sections:
 * - Dashboard (Home/Overview)
 * - Lists (Shopping Lists)
 * - Pantry (Inventory Management)
 * - Shop (Shopping Mode)
 * - Social (Friends & Collaboration)
 * - Profile (User Settings)
 */
export const MainNavigator: FC = () => {
  const { theme } = useTheme();
  const friendRequests = useSelector(selectFriendRequests);

  // Calculate pending requests count
  const pendingRequestsCount = friendRequests?.received?.length || 0;
  console.log(
    '🔍 MainNavigator - friendRequests:',
    friendRequests,
    'pendingRequestsCount:',
    pendingRequestsCount,
    'type:',
    typeof pendingRequestsCount
  );

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e' },
          text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
          surface: { background: '#ffffff' },
          border: { primary: '#e5e5e5' },
        },
      };

  // Tab bar icon component
  const TabIcon: FC<{
    iconSource: any;
    focused: boolean;
    color: string;
    size: number;
    badgeCount?: number;
  }> = ({ iconSource, focused, color, size, badgeCount }) => (
    <View
      style={{
        width: size + 4,
        height: size + 4,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: focused ? 1.1 : 1 }],
        position: 'relative',
      }}>
      <Image
        source={iconSource}
        style={{
          width: size,
          height: size,
          tintColor: color, // This applies the theme color
        }}
        resizeMode='contain'
      />
      {badgeCount && badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            minWidth: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 6,
          }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              lineHeight: 16,
              color: '#FFFFFF',
            }}>
            {badgeCount?.toString() || '0'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: safeTheme.colors.primary['500'],
        tabBarInactiveTintColor: safeTheme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: safeTheme.colors.surface.background,
          borderTopColor: safeTheme.colors.border.primary,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 24,
          height: 85,
          ...theme.shadows.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name='Dashboard'
        component={DashboardScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon iconSource={HomeIcon} focused={focused} color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Home dashboard',
        }}
      />

      <Tab.Screen
        name='Lists'
        component={ListsStackNavigator}
        options={{
          title: 'Lists',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon iconSource={ListIcon} focused={focused} color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Shopping lists',
        }}
      />

      <Tab.Screen
        name='Pantry'
        component={PantryScreen}
        options={{
          title: 'Pantry',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon iconSource={PantryIcon} focused={focused} color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Pantry inventory',
        }}
      />

      <Tab.Screen
        name='Shop'
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon iconSource={ShopIcon} focused={focused} color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'Shopping mode',
        }}>
        {props => (
          <ShopScreen
            {...({
              ...props,
              onScanBarcode: () => console.log('Scan barcode'),
              onManualEntry: () => console.log('Manual entry'),
              onCompleteItem: (item: any) => console.log('Complete item:', item.name),
              onUndoItem: (item: any) => console.log('Undo item:', item.name),
              onFinishShopping: () => console.log('Finish shopping'),
            } as any)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name='Social'
        component={SocialScreen}
        options={{
          title: 'Social',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              iconSource={SocialIcon}
              focused={focused}
              color={color}
              size={size}
              badgeCount={pendingRequestsCount}
            />
          ),
          tabBarAccessibilityLabel: 'Social features',
        }}
      />

      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon iconSource={ProfileIcon} focused={focused} color={color} size={size} />
          ),
          tabBarAccessibilityLabel: 'User profile',
        }}
      />
    </Tab.Navigator>
  );
};

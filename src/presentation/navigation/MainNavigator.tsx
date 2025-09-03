// ========================================
// Main Navigator - Bottom Tab Navigation
// ========================================

import React, { type FC } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../providers/ThemeProvider';
import { selectFriendRequests } from '../../application/store/slices/socialSlice';
import { useAppInitialization } from '../../application/hooks/useAppInitialization';

// Styles
import { createFallbackTheme, createTabBarStyles } from './MainNavigator.styles';

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

// Tab bar icon component - MINIMAL VERSION TO DEBUG
const TabIcon: FC<{
  iconSource: number;
  focused: boolean;
  color: string;
  size: number;
  badgeCount?: number;
}> = ({ iconSource, focused, color, size }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={iconSource}
        style={{
          width: size,
          height: size,
          tintColor: color,
        }}
        resizeMode='contain'
      />
    </View>
  );
};

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

  // Initialize app services including WebSocket
  useAppInitialization();

  // Calculate pending requests count - defensive approach
  const pendingRequestsCount = React.useMemo(() => {
    const count = friendRequests?.received?.length || 0;
    return typeof count === 'number' ? count : 0;
  }, [friendRequests?.received?.length]);

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors ? theme : createFallbackTheme();

  // Create tab bar styles using the theme
  const { tabBarStyle, tabBarLabelStyle, tabBarIconStyle } = createTabBarStyles(safeTheme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: safeTheme.colors.primary['500'],
        tabBarInactiveTintColor: safeTheme.colors.text.tertiary,
        tabBarStyle,
        tabBarLabelStyle,
        tabBarIconStyle,
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
        {({ navigation }) => (
          <ShopScreen
            onBackPress={() => navigation.goBack()}
            onNavigationTabPress={(tab: string) => {
              if (tab === 'Dashboard') navigation.navigate('Dashboard');
              else if (tab === 'Lists') navigation.navigate('Lists');
              else if (tab === 'Pantry') navigation.navigate('Pantry');
              else if (tab === 'Social') navigation.navigate('Social');
              else if (tab === 'Profile') navigation.navigate('Profile');
            }}
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

/**
 * Bottom Navigation Component
 * Reusable navigation bar with Dashboard, Lists, Pantry, Community, Profile tabs
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';

export type NavigationTab = 'dashboard' | 'lists' | 'pantry' | 'shopping' | 'community' | 'profile';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabPress: (tab: NavigationTab) => void;
}

interface TabItem {
  id: NavigationTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const tabs: TabItem[] = [
  { id: 'dashboard', label: 'Dash', icon: 'dashboard' },
  { id: 'lists', label: 'Lists', icon: 'list-alt' },
  { id: 'pantry', label: 'Pantry', icon: 'kitchen' },
  { id: 'shopping', label: 'Shop', icon: 'shopping-cart' },
  { id: 'community', label: 'Social', icon: 'people' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.id;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tabItem,
          isActive && styles.activeTabItem,
        ]}
        onPress={() => onTabPress(tab.id)}
        accessibilityRole="button"
        accessibilityLabel={`Navigate to ${tab.label}`}
        accessibilityState={{ selected: isActive }}
      >
        <View style={[
          styles.tabContent,
          isActive && styles.activeTabContent,
        ]}>
          <MaterialIcons
            name={tab.icon}
            size={24}
            color={isActive ? Theme.colors.background.primary : Theme.colors.text.secondary}
            style={styles.tabIcon}
          />
          <Typography
            variant="caption"
            color={isActive ? Theme.colors.background.primary : Theme.colors.text.secondary}
            style={[
              styles.tabLabel,
              isActive && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Typography>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: Theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  } as ViewStyle,

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
    height: 72,
  } as ViewStyle,

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: 2,
    minWidth: 60,
  } as ViewStyle,

  activeTabItem: {
    // Active tab styling handled by content
  } as ViewStyle,

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    minWidth: 52,
    maxWidth: 64,
  } as ViewStyle,

  activeTabContent: {
    backgroundColor: '#4ADE80',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,

  tabIcon: {
    marginBottom: 2,
  } as ViewStyle,

  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    numberOfLines: 1,
  } as ViewStyle,

  activeTabLabel: {
    fontWeight: '600',
  } as ViewStyle,
};

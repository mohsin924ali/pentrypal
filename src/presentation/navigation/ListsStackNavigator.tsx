/**
 * Lists Stack Navigator
 * Handles navigation between Lists screen and CreateList screen
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { EnhancedListsScreen, CreateListScreen } from '../screens/Lists';
import type { CreateListScreenProps } from '../screens/Lists';

// Navigation types
export type ListsStackParamList = {
  ListsHome: undefined;
  CreateList: {
    editMode?: boolean;
    existingListName?: string;
    existingItems?: any[];
  };
};

const Stack = createStackNavigator<ListsStackParamList>();

export const ListsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // We'll handle headers in individual screens
      }}>
      <Stack.Screen
        name='ListsHome'
        component={EnhancedListsScreen}
        options={{
          title: 'Shopping Lists',
        }}
      />
      <Stack.Screen
        name='CreateList'
        options={{
          title: 'Create List',
          presentation: 'modal', // Present as modal on iOS
        }}>
        {props => (
          <CreateListScreen
            {...props}
            onBackPress={() => props.navigation.goBack()}
            editMode={props.route.params?.editMode || false}
            existingListName={props.route.params?.existingListName || ''}
            existingItems={props.route.params?.existingItems || []}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

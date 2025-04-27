import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';
import WelcomeScreen from './app/screens/WelcomeScreen';
import DashboardScreen from './app/screens/Dashboard';
import ItemListScreen from './app/screens/ItemList';
import AddItemScreen from './app/components/AddItem';
import SalesDetailsScreen from './app/screens/SalesDetailsScreen';
import { COLORS } from './app/config/config';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = 'dashboard';
        else if (route.name === 'Items') iconName = 'list';
        else if (route.name === 'Add Item') iconName = 'add';
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.text,
      tabBarStyle: { backgroundColor: COLORS.white },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Items" component={ItemListScreen} />
    <Tab.Screen name="Add Item" component={AddItemScreen} />
  </Tab.Navigator>
);

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await SecureStore.getItemAsync('hasLaunched');
        setIsFirstLaunch(hasLaunched === null || hasLaunched === 'false');
        if (hasLaunched === null || hasLaunched === 'false') {
          await SecureStore.setItemAsync('hasLaunched', 'true');
        }
      } catch (error) {
        console.error('Error checking hasLaunched:', error);
        setIsFirstLaunch(true);
      }
    };
    checkFirstLaunch();
  }, []);

  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isFirstLaunch ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainApp} />
            <Stack.Screen
              name="SalesDetails"
              component={SalesDetailsScreen}
              options={{ headerShown: true, title: 'Sales Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
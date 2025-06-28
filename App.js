import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Контекст темы
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Импорт экранов
import HomeScreen from './screens/HomeScreen';
import AddTransactionScreen from './screens/AddTransactionScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CurrencyScreen from './screens/CurrencyScreen';
import HelpScreen from './screens/HelpScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Стек навигации для настроек
function SettingsStack() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.shadow,
        },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Currency" 
        component={CurrencyScreen}
        options={{ title: 'Валюта' }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
        options={{ title: 'Помощь' }}
      />
    </Stack.Navigator>
  );
}

// Основная навигация
function MainTabs() {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Главная') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Добавить') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Статистика') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Настройки') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarStyle: {
            backgroundColor: theme.cardBackground,
            borderTopColor: theme.border,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadow,
          },
          headerTintColor: theme.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Главная" component={HomeScreen} />
        <Tab.Screen name="Добавить" component={AddTransactionScreen} />
        <Tab.Screen name="Статистика" component={StatisticsScreen} />
        <Tab.Screen name="Настройки" component={SettingsStack} />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}

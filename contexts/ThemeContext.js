import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

const SETTINGS_KEY = 'app_settings';
const CURRENCIES = {
  RUB: { symbol: '₽', name: 'Российский рубль' },
  USD: { symbol: '$', name: 'Доллар США' },
  EUR: { symbol: '€', name: 'Евро' },
  UAH: { symbol: '₴', name: 'Украинская гривна' },
  BYN: { symbol: 'Br', name: 'Белорусский рубль' },
  KZT: { symbol: '₸', name: 'Казахстанский тенге' },
};

const LIGHT_THEME = {
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  accent: '#007AFF',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  shadow: '#000000',
};

const DARK_THEME = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#888888',
  border: '#333333',
  accent: '#0A84FF',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  shadow: '#000000',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currency, setCurrency] = useState('RUB');
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  // Загрузка настроек при запуске
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setIsDarkMode(parsedSettings.isDarkMode || false);
        setCurrency(parsedSettings.currency || 'RUB');
        setNotifications(parsedSettings.notifications !== false);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const settings = {
        isDarkMode,
        currency,
        notifications,
        ...newSettings,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await saveSettings({ isDarkMode: newValue });
  };

  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    await saveSettings({ currency: newCurrency });
  };

  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await saveSettings({ notifications: newValue });
  };

  const value = {
    theme,
    isDarkMode,
    currency,
    notifications,
    loading,
    currencies: CURRENCIES,
    toggleDarkMode,
    changeCurrency,
    toggleNotifications,
    getCurrencySymbol: () => CURRENCIES[currency]?.symbol || '₽',
    getCurrencyName: () => CURRENCIES[currency]?.name || 'Российский рубль',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

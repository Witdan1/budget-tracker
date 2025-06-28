import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function CurrencyScreen({ navigation }) {
  const { theme, currency, currencies, changeCurrency } = useTheme();

  const handleCurrencySelect = async (currencyCode) => {
    await changeCurrency(currencyCode);
    navigation.goBack();
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Выберите валюту</Text>
      
      {Object.entries(currencies).map(([code, currencyData]) => (
        <TouchableOpacity
          key={code}
          style={styles.currencyItem}
          onPress={() => handleCurrencySelect(code)}
        >
          <View style={styles.currencyLeft}>
            <Text style={styles.currencySymbol}>{currencyData.symbol}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{code}</Text>
              <Text style={styles.currencyName}>{currencyData.name}</Text>
            </View>
          </View>
          
          {currency === code && (
            <Ionicons name="checkmark" size={24} color={theme.accent} />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
    margin: 20,
    marginBottom: 10,
  },
  currencyItem: {
    backgroundColor: theme.cardBackground,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.accent,
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    marginLeft: 15,
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: theme.textSecondary,
  },
});

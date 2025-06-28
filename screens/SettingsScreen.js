import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactions } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { 
    theme, 
    isDarkMode, 
    currency, 
    notifications, 
    toggleDarkMode, 
    toggleNotifications,
    getCurrencyName,
    getCurrencySymbol 
  } = useTheme();

  const handleExportData = async () => {
    try {
      const transactions = await getTransactions();
      
      if (transactions.length === 0) {
        Alert.alert('Внимание', 'Нет данных для экспорта');
        return;
      }

      // Формируем CSV строку
      let csvContent = 'Дата,Тип,Категория,Название,Сумма\n';
      
      transactions.forEach(transaction => {
        const row = [
          transaction.date,
          transaction.type === 'income' ? 'Доход' : 'Расход',
          transaction.category,
          transaction.title.replace(/,/g, ';'), // Заменяем запятые точками с запятой
          transaction.amount
        ].join(',');
        csvContent += row + '\n';
      });

      Alert.alert(
        'Экспорт данных',
        `Готово к экспорту ${transactions.length} транзакций\n\nДанные:\n${csvContent.substring(0, 200)}...`,
        [
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Удалить все данные',
      'Вы уверены? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('budget_transactions');
              Alert.alert('Успех', 'Все данные удалены');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить данные');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'О приложении',
      'Бюджет-Трекер v1.0\n\nПриложение для учета личных финансов.\n\nРазработано с помощью React Native и Expo.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange,
    rightIcon = 'chevron-forward',
    danger = false 
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingsLeft}>
        <View style={[
          styles.settingsIcon, 
          { backgroundColor: danger ? theme.error : theme.accent }
        ]}>
          <Ionicons name={icon} size={20} color="#FFF" />
        </View>
        <View style={styles.settingsText}>
          <Text style={[styles.settingsTitle, danger && { color: theme.error }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={switchValue ? '#FFF' : '#FFF'}
        />
      ) : (
        <Ionicons name={rightIcon} size={20} color={theme.textTertiary} />
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      {/* Профиль */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Профиль</Text>
        
        {renderSettingsItem({
          icon: 'person',
          title: 'Мой профиль',
          subtitle: 'Управление аккаунтом',
          onPress: () => Alert.alert('Информация', 'Функция в разработке'),
        })}
      </View>

      {/* Настройки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        
        {renderSettingsItem({
          icon: 'moon',
          title: 'Темная тема',
          subtitle: 'Включить темное оформление',
          showSwitch: true,
          switchValue: isDarkMode,
          onSwitchChange: toggleDarkMode,
        })}
        
        {renderSettingsItem({
          icon: 'notifications',
          title: 'Уведомления',
          subtitle: 'Напоминания о записи трат',
          showSwitch: true,
          switchValue: notifications,
          onSwitchChange: toggleNotifications,
        })}
        
        {renderSettingsItem({
          icon: 'globe',
          title: 'Валюта',
          subtitle: `${getCurrencyName()} (${getCurrencySymbol()})`,
          onPress: () => navigation.navigate('Currency'),
        })}
      </View>

      {/* Данные */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Данные</Text>
        
        {renderSettingsItem({
          icon: 'download',
          title: 'Экспорт данных',
          subtitle: 'Сохранить данные в CSV файл',
          onPress: handleExportData,
        })}
        
        {renderSettingsItem({
          icon: 'cloud-upload',
          title: 'Резервное копирование',
          subtitle: 'Синхронизация с облаком',
          onPress: () => Alert.alert('Информация', 'Функция в разработке'),
        })}
        
        {renderSettingsItem({
          icon: 'trash',
          title: 'Очистить все данные',
          subtitle: 'Удалить все транзакции',
          onPress: handleClearAllData,
          danger: true,
        })}
      </View>

      {/* Поддержка */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Поддержка</Text>
        
        {renderSettingsItem({
          icon: 'help-circle',
          title: 'Помощь',
          subtitle: 'Часто задаваемые вопросы',
          onPress: () => navigation.navigate('Help'),
        })}
        
        {renderSettingsItem({
          icon: 'star',
          title: 'Оценить приложение',
          subtitle: 'Оставить отзыв в магазине',
          onPress: () => Alert.alert('Информация', 'Функция в разработке'),
        })}
        
        {renderSettingsItem({
          icon: 'information-circle',
          title: 'О приложении',
          subtitle: 'Версия и информация',
          onPress: handleAbout,
        })}
      </View>

      {/* Версия */}
      <Text style={styles.versionText}>
        Версия 1.0.0
      </Text>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  section: {
    backgroundColor: theme.cardBackground,
    marginTop: 20,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  versionText: {
    textAlign: 'center',
    color: theme.textTertiary,
    fontSize: 14,
    paddingVertical: 20,
  },
});

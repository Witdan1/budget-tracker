import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions, deleteTransaction } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = {
  // Доходы
  salary: { name: 'Зарплата', icon: 'card', color: '#4CAF50' },
  freelance: { name: 'Фриланс', icon: 'laptop', color: '#2196F3' },
  investment: { name: 'Инвестиции', icon: 'trending-up', color: '#FF9800' },
  gift: { name: 'Подарок', icon: 'gift', color: '#E91E63' },
  other_income: { name: 'Другое', icon: 'add-circle', color: '#9C27B0' },
  
  // Расходы
  food: { name: 'Еда', icon: 'restaurant', color: '#FF5722' },
  transport: { name: 'Транспорт', icon: 'car', color: '#607D8B' },
  shopping: { name: 'Покупки', icon: 'bag', color: '#795548' },
  entertainment: { name: 'Развлечения', icon: 'game-controller', color: '#FF9800' },
  health: { name: 'Здоровье', icon: 'medical', color: '#F44336' },
  education: { name: 'Образование', icon: 'school', color: '#3F51B5' },
  bills: { name: 'Счета', icon: 'receipt', color: '#009688' },
  other_expense: { name: 'Другое', icon: 'remove-circle', color: '#757575' },
};

export default function HomeScreen() {
  const { theme, getCurrencySymbol } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
      
      // Подсчет статистики
      const totalIncome = data
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = data
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setIncome(totalIncome);
      setExpense(totalExpense);
      setBalance(totalIncome - totalExpense);
    } catch (error) {
      console.error('Ошибка загрузки транзакций:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDeleteTransaction = async (id, title) => {
    Alert.alert(
      'Удалить транзакцию',
      `Вы уверены, что хотите удалить "${title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
              await loadTransactions();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить транзакцию');
            }
          },
        },
      ]
    );
  };

  // Загружаем данные при фокусе на экран
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const renderTransaction = ({ item }) => {
    const category = CATEGORIES[item.category] || CATEGORIES.other_expense;
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onLongPress={() => handleDeleteTransaction(item.id, item.title)}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon} size={20} color="#FFF" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{item.title}</Text>
            <Text style={styles.transactionCategory}>{category.name}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? theme.success : theme.error },
          ]}
        >
          {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} {getCurrencySymbol()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Карточка баланса */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Текущий баланс</Text>
        <Text
          style={[
            styles.balanceAmount,
            { color: balance >= 0 ? theme.success : theme.error },
          ]}
        >
          {balance.toLocaleString()} {getCurrencySymbol()}
        </Text>
        
        {/* Статистика доходов и расходов */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="arrow-up" size={16} color={theme.success} />
            </View>
            <View>
              <Text style={styles.statLabel}>Доходы</Text>
              <Text style={[styles.statAmount, { color: theme.success }]}>
                +{income.toLocaleString()} {getCurrencySymbol()}
              </Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="arrow-down" size={16} color={theme.error} />
            </View>
            <View>
              <Text style={styles.statLabel}>Расходы</Text>
              <Text style={[styles.statAmount, { color: theme.error }]}>
                -{expense.toLocaleString()} {getCurrencySymbol()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Заголовок списка */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Все транзакции ({transactions.length})
        </Text>
        {transactions.length > 0 && (
          <Text style={styles.helpText}>
            Удерживайте для удаления
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={theme.textTertiary} />
      <Text style={styles.emptyTitle}>Нет транзакций</Text>
      <Text style={styles.emptyText}>
        Добавьте свою первую транзакцию, нажав на вкладку "Добавить"
      </Text>
    </View>
  );

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  balanceCard: {
    backgroundColor: theme.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  helpText: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  transactionItem: {
    backgroundColor: theme.cardBackground,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.textTertiary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
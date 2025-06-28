import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTransactions } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

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

export default function StatisticsScreen() {
  const { theme, getCurrencySymbol } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [incomeStats, setIncomeStats] = useState([]);
  const [expenseStats, setExpenseStats] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadStatistics = async () => {
    try {
      const allTransactions = await getTransactions();
      
      // Фильтрация по периоду
      const now = new Date();
      let filteredTransactions = [];
      
      if (selectedPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTransactions = allTransactions.filter(t => {
          const transactionDate = new Date(t.date.split('.').reverse().join('-'));
          return transactionDate >= weekAgo;
        });
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTransactions = allTransactions.filter(t => {
          const transactionDate = new Date(t.date.split('.').reverse().join('-'));
          return transactionDate >= monthAgo;
        });
      } else {
        filteredTransactions = allTransactions;
      }
      
      setTransactions(filteredTransactions);
      
      // Группировка по категориям
      const incomeByCategory = {};
      const expenseByCategory = {};
      let totalIncomeAmount = 0;
      let totalExpenseAmount = 0;
      
      filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          incomeByCategory[transaction.category] = 
            (incomeByCategory[transaction.category] || 0) + transaction.amount;
          totalIncomeAmount += transaction.amount;
        } else {
          expenseByCategory[transaction.category] = 
            (expenseByCategory[transaction.category] || 0) + transaction.amount;
          totalExpenseAmount += transaction.amount;
        }
      });
      
      // Преобразование в массивы для отображения
      const incomeArray = Object.entries(incomeByCategory)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalIncomeAmount > 0 ? (amount / totalIncomeAmount * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
      
      const expenseArray = Object.entries(expenseByCategory)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
      
      setIncomeStats(incomeArray);
      setExpenseStats(expenseArray);
      setTotalIncome(totalIncomeAmount);
      setTotalExpense(totalExpenseAmount);
      
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [selectedPeriod])
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: 'week', label: 'Неделя' },
        { key: 'month', label: 'Месяц' },
        { key: 'all', label: 'Всё время' },
      ].map(period => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextActive,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategoryStats = (stats, type, total) => {
    if (stats.length === 0) {
      return (
        <View style={styles.emptyStats}>
          <Text style={styles.emptyStatsText}>
            Нет данных за выбранный период
          </Text>
        </View>
      );
    }

    return stats.map((item, index) => {
      const category = CATEGORIES[item.category] || CATEGORIES.other_expense;
      const barWidth = (item.percentage / 100) * (width - 120);
      
      return (
        <View key={index} style={styles.categoryStatItem}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={16} color="#FFF" />
            </View>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPercentage}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
          
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                { width: barWidth, backgroundColor: category.color },
              ]}
            />
          </View>
          
          <Text style={styles.categoryAmount}>
            {item.amount.toLocaleString()} {getCurrencySymbol()}
          </Text>
        </View>
      );
    });
  };

  const renderSummaryCard = () => {
    const balance = totalIncome - totalExpense;
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Сводка за период</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="arrow-up" size={20} color={theme.success} />
            <Text style={styles.summaryLabel}>Доходы</Text>
            <Text style={[styles.summaryAmount, { color: theme.success }]}>
              +{totalIncome.toLocaleString()} {getCurrencySymbol()}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Ionicons name="arrow-down" size={20} color={theme.error} />
            <Text style={styles.summaryLabel}>Расходы</Text>
            <Text style={[styles.summaryAmount, { color: theme.error }]}>
              -{totalExpense.toLocaleString()} {getCurrencySymbol()}
            </Text>
          </View>
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Итого:</Text>
          <Text
            style={[
              styles.balanceAmount,
              { color: balance >= 0 ? theme.success : theme.error },
            ]}
          >
            {balance >= 0 ? '+' : ''}{balance.toLocaleString()} {getCurrencySymbol()}
          </Text>
        </View>
      </View>
    );
  };

  const styles = createStyles(theme);

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        {renderPeriodSelector()}
        <View style={styles.emptyContainer}>
          <Ionicons name="stats-chart-outline" size={64} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>Нет данных</Text>
          <Text style={styles.emptyText}>
            Добавьте транзакции для просмотра статистики
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderPeriodSelector()}
      {renderSummaryCard()}
      
      {/* Статистика расходов */}
      {expenseStats.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            Расходы по категориям
          </Text>
          {renderCategoryStats(expenseStats, 'expense', totalExpense)}
        </View>
      )}
      
      {/* Статистика доходов */}
      {incomeStats.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            Доходы по категориям
          </Text>
          {renderCategoryStats(incomeStats, 'income', totalIncome)}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    padding: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: theme.accent,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  periodButtonTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: theme.cardBackground,
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 5,
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsSection: {
    backgroundColor: theme.cardBackground,
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 15,
  },
  categoryStatItem: {
    marginBottom: 15,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  categoryPercentage: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  barContainer: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginBottom: 5,
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textPrimary,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyStats: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStatsText: {
    fontSize: 14,
    color: theme.textTertiary,
  },
});

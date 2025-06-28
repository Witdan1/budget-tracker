import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = 'budget_transactions';

// Получить все транзакции
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка загрузки транзакций:', error);
    return [];
  }
};

// Сохранить транзакцию
export const saveTransaction = async (transaction) => {
  try {
    const transactions = await getTransactions();
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('ru-RU'),
    };
    
    transactions.unshift(newTransaction);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction;
  } catch (error) {
    console.error('Ошибка сохранения транзакции:', error);
    throw error;
  }
};

// Удалить транзакцию
export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filteredTransactions));
  } catch (error) {
    console.error('Ошибка удаления транзакции:', error);
    throw error;
  }
};

// Получить статистику за период
export const getStatistics = async (period = 'month') => {
  try {
    const transactions = await getTransactions();
    const now = new Date();
    let filteredTransactions = [];
    
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date.split('.').reverse().join('-'));
        return transactionDate >= weekAgo;
      });
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date.split('.').reverse().join('-'));
        return transactionDate >= monthAgo;
      });
    } else {
      filteredTransactions = transactions;
    }
    
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      transactions: filteredTransactions,
      income,
      expense,
      balance: income - expense,
    };
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return {
      transactions: [],
      income: 0,
      expense: 0,
      balance: 0,
    };
  }
};



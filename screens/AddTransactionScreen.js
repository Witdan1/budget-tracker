import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveTransaction } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const CATEGORIES = {
  income: [
    { id: 'salary', name: 'Зарплата', icon: 'card' },
    { id: 'freelance', name: 'Фриланс', icon: 'laptop' },
    { id: 'investment', name: 'Инвестиции', icon: 'trending-up' },
    { id: 'gift', name: 'Подарок', icon: 'gift' },
    { id: 'other_income', name: 'Другое', icon: 'add-circle' },
  ],
  expense: [
    { id: 'food', name: 'Еда', icon: 'restaurant' },
    { id: 'transport', name: 'Транспорт', icon: 'car' },
    { id: 'shopping', name: 'Покупки', icon: 'bag' },
    { id: 'entertainment', name: 'Развлечения', icon: 'game-controller' },
    { id: 'health', name: 'Здоровье', icon: 'medical' },
    { id: 'education', name: 'Образование', icon: 'school' },
    { id: 'bills', name: 'Счета', icon: 'receipt' },
    { id: 'other_expense', name: 'Другое', icon: 'remove-circle' },
  ],
};

export default function AddTransactionScreen({ navigation }) {
  const { theme, getCurrencySymbol } = useTheme();
  const [type, setType] = useState('expense'); // 'income' или 'expense'
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Валидация
    if (!amount || !title || !selectedCategory) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    setIsLoading(true);

    try {
      const transaction = {
        type,
        amount: numAmount,
        title,
        category: selectedCategory,
      };

      await saveTransaction(transaction);
      
      // Очистка формы
      setAmount('');
      setTitle('');
      setSelectedCategory(null);
      
      Alert.alert('Успех', 'Транзакция добавлена!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Главная'),
        },
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить транзакцию');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategories = () => {
    const categories = CATEGORIES[type];
    return (
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Выберите категорию</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemSelected,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? '#FFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Переключатель типа транзакции */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.typeButtonActive,
              { backgroundColor: type === 'income' ? theme.success : theme.border },
            ]}
            onPress={() => {
              setType('income');
              setSelectedCategory(null);
            }}
          >
            <Ionicons 
              name="add-circle" 
              size={20} 
              color={type === 'income' ? '#FFF' : theme.textSecondary} 
            />
            <Text
              style={[
                styles.typeButtonText,
                type === 'income' && styles.typeButtonTextActive,
              ]}
            >
              Доход
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.typeButtonActive,
              { backgroundColor: type === 'expense' ? theme.error : theme.border },
            ]}
            onPress={() => {
              setType('expense');
              setSelectedCategory(null);
            }}
          >
            <Ionicons 
              name="remove-circle" 
              size={20} 
              color={type === 'expense' ? '#FFF' : theme.textSecondary} 
            />
            <Text
              style={[
                styles.typeButtonText,
                type === 'expense' && styles.typeButtonTextActive,
              ]}
            >
              Расход
            </Text>
          </TouchableOpacity>
        </View>

        {/* Поле ввода суммы */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Сумма</Text>
          <View style={styles.amountInputContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.currencyText}>{getCurrencySymbol()}</Text>
          </View>
        </View>

        {/* Поле ввода описания */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Описание</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Введите описание транзакции"
            placeholderTextColor={theme.textTertiary}
            maxLength={50}
          />
        </View>

        {/* Категории */}
        {renderCategories()}

        {/* Кнопка сохранения */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!amount || !title || !selectedCategory || isLoading) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!amount || !title || !selectedCategory || isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Сохранение...' : 'Добавить транзакцию'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  typeSelector: {
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
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  inputContainer: {
    margin: 20,
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 15,
    color: theme.textPrimary,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textSecondary,
  },
  textInput: {
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: theme.textPrimary,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoriesContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItemSelected: {
    backgroundColor: theme.accent,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: theme.accent,
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: theme.textTertiary,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
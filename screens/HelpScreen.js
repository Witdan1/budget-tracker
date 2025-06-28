import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const FAQ_DATA = [
  {
    id: 1,
    question: 'Как добавить новую транзакцию?',
    answer: 'Перейдите на вкладку "Добавить", выберите тип транзакции (доход или расход), введите сумму, описание и выберите категорию. Нажмите "Добавить транзакцию" для сохранения.',
  },
  {
    id: 2,
    question: 'Как удалить транзакцию?',
    answer: 'На главном экране найдите нужную транзакцию и удерживайте палец на ней. Появится окно подтверждения удаления.',
  },
  {
    id: 3,
    question: 'Как посмотреть статистику за определенный период?',
    answer: 'Перейдите на вкладку "Статистика" и выберите нужный период: неделя, месяц или всё время. Статистика обновится автоматически.',
  },
  {
    id: 4,
    question: 'Как экспортировать свои данные?',
    answer: 'В настройках найдите раздел "Данные" и выберите "Экспорт данных". Ваши транзакции будут сформированы в формате CSV.',
  },
  {
    id: 5,
    question: 'Как изменить валюту?',
    answer: 'В настройках нажмите на "Валюта" и выберите нужную валюту из списка. Все суммы будут отображаться в выбранной валюте.',
  },
  {
    id: 6,
    question: 'Безопасны ли мои данные?',
    answer: 'Все ваши данные хранятся локально на устройстве и не передаются на внешние серверы. Только вы имеете доступ к своим финансовым данным.',
  },
  {
    id: 7,
    question: 'Что означают категории транзакций?',
    answer: 'Категории помогают группировать ваши доходы и расходы: Еда, Транспорт, Развлечения и т.д. Это позволяет анализировать, на что вы тратите больше всего денег.',
  },
  {
    id: 8,
    question: 'Как включить темную тему?',
    answer: 'В настройках найдите переключатель "Темная тема" и включите его. Интерфейс приложения изменится на темный.',
  },
];

export default function HelpScreen({ navigation }) {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Помощь</Text>
        <Text style={styles.subtitle}>
          Часто задаваемые вопросы и ответы
        </Text>
      </View>

      {FAQ_DATA.map((item) => {
        const isExpanded = expandedItems.has(item.id);
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.faqItem}
            onPress={() => toggleExpanded(item.id)}
          >
            <View style={styles.questionContainer}>
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </View>
            
            {isExpanded && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Не нашли ответ?</Text>
        <Text style={styles.contactText}>
          Если у вас есть другие вопросы или предложения по улучшению приложения, 
          свяжитесь с нами через настройки приложения.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  faqItem: {
    backgroundColor: theme.cardBackground,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  answer: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  contactSection: {
    backgroundColor: theme.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
});

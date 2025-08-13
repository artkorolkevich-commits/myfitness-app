/**
 * Примеры использования модулей MyFitness App
 * 
 * @fileoverview Демонстрация основных возможностей всех модулей приложения
 * @version 1.0.0
 * @author MyFitness App Team
 */

// Импорты всех модулей
import { storage } from '../modules/storage.js';
import { exerciseManager } from '../modules/exercises.js';
import { yandexAPI } from '../modules/yandex-api.js';
import { aiService } from '../modules/ai-service.js';
import { historyManager } from '../modules/history-manager.js';
import { settingsManager } from '../modules/settings-manager.js';
import { bodyAnalysisManager } from '../modules/body-analysis-manager.js';
import { progressManager } from '../modules/progress-manager.js';
import { logger } from '../utils/logger.js';
import { validator } from '../utils/validator.js';
import { dom } from '../utils/dom.js';

/**
 * Пример 1: Работа с хранилищем данных
 */
function storageExample() {
  console.log('=== Пример работы с хранилищем ===');
  
  // Загрузка данных
  const workouts = storage.loadWorkouts();
  const config = storage.loadConfig();
  
  console.log('Загружено тренировок:', workouts.length);
  console.log('Текущая конфигурация:', config);
  
  // Сохранение новой тренировки
  const newWorkout = {
    id: 'workout-123',
    date: new Date().toISOString(),
    exercises: [
      {
        exercise: 'Жим лежа',
        sets: [
          { weight: 80, reps: 8 },
          { weight: 85, reps: 6 }
        ]
      }
    ]
  };
  
  storage.addWorkout(newWorkout);
  console.log('Тренировка сохранена');
}

/**
 * Пример 2: Работа с упражнениями
 */
function exercisesExample() {
  console.log('=== Пример работы с упражнениями ===');
  
  // Получение всех упражнений
  const allExercises = exerciseManager.getAllExercises();
  console.log('Всего упражнений:', allExercises.length);
  
  // Поиск упражнений
  const chestExercises = exerciseManager.getExercisesByGroup('Грудь');
  console.log('Упражнения для груди:', chestExercises);
  
  // Поиск по названию
  const searchResults = exerciseManager.searchExercises('жим');
  console.log('Результаты поиска "жим":', searchResults);
  
  // Выбор упражнений
  exerciseManager.selectExercise('Жим лежа');
  exerciseManager.selectExercise('Отжимания от пола');
  
  const selected = exerciseManager.getSelectedExercises();
  console.log('Выбранные упражнения:', selected);
}

/**
 * Пример 3: Работа с Yandex.Disk API
 */
async function yandexAPIExample() {
  console.log('=== Пример работы с Yandex.Disk API ===');
  
  // Инициализация (требует токен)
  const token = 'your-yandex-token';
  yandexAPI.init(token);
  
  try {
    // Получение информации о пользователе
    const userInfo = await yandexAPI.getUserInfo();
    console.log('Информация о пользователе:', userInfo);
    
    // Синхронизация данных
    await yandexAPI.syncData();
    console.log('Данные синхронизированы');
    
  } catch (error) {
    console.error('Ошибка работы с Yandex.Disk:', error);
  }
}

/**
 * Пример 4: Работа с AI сервисами
 */
async function aiServiceExample() {
  console.log('=== Пример работы с AI сервисами ===');
  
  // Инициализация (требует API ключ)
  const apiKey = 'your-huggingface-api-key';
  aiService.init(apiKey);
  
  try {
    // Тест подключения
    const connectionTest = await aiService.testHuggingFaceConnection();
    console.log('Тест подключения:', connectionTest);
    
    // Анализ фото (требует base64 изображение)
    const photoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
    const analysis = await aiService.analyzeBodyWithAI(photoData);
    console.log('Результат анализа:', analysis);
    
  } catch (error) {
    console.error('Ошибка работы с AI:', error);
  }
}

/**
 * Пример 5: Работа с историей тренировок
 */
function historyExample() {
  console.log('=== Пример работы с историей ===');
  
  // Инициализация
  historyManager.init();
  
  // Загрузка данных истории
  const historyData = historyManager.loadHistoryData();
  console.log('Данные истории загружены');
  
  // Рендеринг тренировок
  historyManager.renderWorkouts(historyData.workouts);
  console.log('Тренировки отрендерены');
}

/**
 * Пример 6: Работа с настройками
 */
function settingsExample() {
  console.log('=== Пример работы с настройками ===');
  
  // Инициализация
  settingsManager.init();
  
  // Сохранение настроек
  const newSettings = {
    yandexToken: 'new-token',
    autoSync: true,
    theme: 'light'
  };
  
  settingsManager.saveSettings(newSettings);
  console.log('Настройки сохранены');
}

/**
 * Пример 7: Работа с анализом тела
 */
function bodyAnalysisExample() {
  console.log('=== Пример работы с анализом тела ===');
  
  // Инициализация
  bodyAnalysisManager.init();
  
  // Симуляция загрузки фото
  const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
  bodyAnalysisManager.handlePhotoFile(mockFile);
  
  console.log('Анализ тела инициализирован');
}

/**
 * Пример 8: Работа с прогрессом
 */
function progressExample() {
  console.log('=== Пример работы с прогрессом ===');
  
  // Инициализация
  progressManager.init();
  
  // Заполнение списка упражнений
  progressManager.populateExerciseSelect();
  
  // Установка упражнения для отслеживания
  progressManager.currentExercise = 'Жим лежа';
  progressManager.updateProgressDisplay();
  
  console.log('Прогресс инициализирован');
}

/**
 * Пример 9: Работа с утилитами
 */
function utilsExample() {
  console.log('=== Пример работы с утилитами ===');
  
  // Логирование
  logger.info('Информационное сообщение');
  logger.success('Успешная операция');
  logger.warn('Предупреждение');
  logger.error('Ошибка', new Error('Test error'));
  
  // Валидация
  const workoutData = {
    date: new Date().toISOString(),
    exercises: []
  };
  
  const validation = validator.validateWorkout(workoutData);
  console.log('Результат валидации:', validation);
  
  // DOM утилиты
  const element = dom.getElement('testElement');
  if (element) {
    dom.setContent(element, 'Новый текст');
    dom.toggleElement(element, true);
  }
}

/**
 * Пример 10: Комплексный пример - создание тренировки
 */
async function complexWorkoutExample() {
  console.log('=== Комплексный пример: создание тренировки ===');
  
  try {
    // 1. Выбор упражнений
    exerciseManager.selectExercise('Жим лежа');
    exerciseManager.selectExercise('Разведение гантелей лежа');
    exerciseManager.selectExercise('Отжимания от пола');
    
    const selectedExercises = exerciseManager.getSelectedExercises();
    console.log('Выбраны упражнения:', selectedExercises);
    
    // 2. Создание тренировки
    const workout = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString(),
      exercises: selectedExercises.map(exercise => ({
        exercise: exercise.name,
        sets: [
          { weight: 80, reps: 8 },
          { weight: 85, reps: 6 },
          { weight: 90, reps: 4 }
        ]
      }))
    };
    
    // 3. Валидация
    const validation = validator.validateWorkout(workout);
    if (!validation.isValid) {
      throw new Error('Тренировка не прошла валидацию');
    }
    
    // 4. Сохранение
    storage.addWorkout(workout);
    logger.success('Тренировка создана и сохранена');
    
    // 5. Синхронизация с Yandex.Disk (если доступно)
    if (yandexAPI.isAuthenticated) {
      await yandexAPI.syncData();
      logger.success('Тренировка синхронизирована с Yandex.Disk');
    }
    
    // 6. Обновление истории
    historyManager.loadHistoryData();
    
    // 7. Обновление прогресса
    progressManager.updateProgressDisplay();
    
    console.log('Тренировка успешно создана!');
    
  } catch (error) {
    logger.error('Ошибка создания тренировки:', error);
  }
}

/**
 * Запуск всех примеров
 */
function runAllExamples() {
  console.log('🚀 Запуск примеров использования модулей MyFitness App');
  console.log('==================================================');
  
  // Базовые примеры
  storageExample();
  exercisesExample();
  historyExample();
  settingsExample();
  bodyAnalysisExample();
  progressExample();
  utilsExample();
  
  // Асинхронные примеры (требуют настройки)
  // yandexAPIExample();
  // aiServiceExample();
  
  // Комплексный пример
  complexWorkoutExample();
  
  console.log('==================================================');
  console.log('✅ Все примеры выполнены');
}

// Экспорт функций для использования в консоли
window.examples = {
  storageExample,
  exercisesExample,
  yandexAPIExample,
  aiServiceExample,
  historyExample,
  settingsExample,
  bodyAnalysisExample,
  progressExample,
  utilsExample,
  complexWorkoutExample,
  runAllExamples
};

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('📚 Примеры использования модулей загружены');
      console.log('💡 Запустите window.examples.runAllExamples() для демонстрации');
    }, 3000);
  });
}

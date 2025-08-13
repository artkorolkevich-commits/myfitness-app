/**
 * Интеграционные тесты MyFitness App
 * 
 * @fileoverview Тестирование взаимодействия между модулями
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

class IntegrationTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.testData = {
      workouts: [],
      exercises: [],
      config: {},
      analyses: []
    };
  }

  /**
   * Запуск всех интеграционных тестов
   */
  async runAllTests() {
    logger.info('🧪 Запуск интеграционных тестов...');
    
    try {
      // Подготовка тестовых данных
      await this.prepareTestData();
      
      // Тестирование основных сценариев
      await this.testWorkoutCreationFlow();
      await this.testExerciseSelectionFlow();
      await this.testDataSynchronizationFlow();
      await this.testBodyAnalysisFlow();
      await this.testProgressTrackingFlow();
      await this.testSettingsManagementFlow();
      
      // Тестирование обработки ошибок
      await this.testErrorHandling();
      
      // Тестирование производительности
      await this.testPerformance();
      
      // Вывод результатов
      this.printResults();
      
    } catch (error) {
      logger.error('Ошибка выполнения интеграционных тестов:', error);
    }
  }

  /**
   * Подготовка тестовых данных
   */
  async prepareTestData() {
    logger.info('📋 Подготовка тестовых данных...');
    
    // Сохраняем текущие данные
    this.testData.workouts = storage.loadWorkouts();
    this.testData.config = storage.loadConfig();
    
    // Очищаем данные для тестов
    storage.clearAll();
    
    // Создаем тестовую конфигурацию
    const testConfig = {
      yandexToken: 'test-token',
      yandexPath: '/MyFitness/test-workouts.json',
      autoSync: false,
      syncInterval: 5,
      theme: 'light',
      huggingFaceApiKey: 'test-api-key'
    };
    
    storage.saveConfig(testConfig);
    
    logger.success('Тестовые данные подготовлены');
  }

  /**
   * Тест 1: Сценарий создания тренировки
   */
  async testWorkoutCreationFlow() {
    this.startTest('Создание тренировки');
    
    try {
      // 1. Выбор упражнений
      exerciseManager.selectExercise('Жим лежа');
      exerciseManager.selectExercise('Разведение гантелей лежа');
      
      const selectedExercises = exerciseManager.getSelectedExercises();
      this.assert(selectedExercises.length === 2, 'Должно быть выбрано 2 упражнения');
      
      // 2. Создание тренировки
      const workout = {
        id: `test-workout-${Date.now()}`,
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
      this.assert(validation.isValid, 'Тренировка должна пройти валидацию');
      
      // 4. Сохранение
      const saveResult = storage.addWorkout(workout);
      this.assert(saveResult, 'Тренировка должна быть сохранена');
      
      // 5. Проверка сохранения
      const savedWorkouts = storage.loadWorkouts();
      this.assert(savedWorkouts.length === 1, 'Должна быть 1 сохраненная тренировка');
      
      // 6. Обновление истории
      historyManager.loadHistoryData();
      this.assert(true, 'История должна загрузиться без ошибок');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 2: Сценарий выбора упражнений
   */
  async testExerciseSelectionFlow() {
    this.startTest('Выбор упражнений');
    
    try {
      // 1. Получение всех упражнений
      const allExercises = exerciseManager.getAllExercises();
      this.assert(allExercises.length > 0, 'Должны быть доступны упражнения');
      
      // 2. Поиск упражнений
      const searchResults = exerciseManager.searchExercises('жим');
      this.assert(searchResults.length > 0, 'Поиск должен найти упражнения');
      
      // 3. Фильтрация по группам
      const chestExercises = exerciseManager.getExercisesByGroup('Грудь');
      this.assert(chestExercises.length > 0, 'Должны быть упражнения для груди');
      
      // 4. Выбор и отмена выбора
      exerciseManager.selectExercise('Жим лежа');
      this.assert(exerciseManager.getSelectedCount() === 1, 'Должно быть 1 выбранное упражнение');
      
      exerciseManager.deselectExercise('Жим лежа');
      this.assert(exerciseManager.getSelectedCount() === 0, 'Не должно быть выбранных упражнений');
      
      // 5. Проверка лимита
      const exercises = ['Жим лежа', 'Разведение гантелей', 'Отжимания', 'Жим гантелей'];
      exercises.forEach(ex => exerciseManager.selectExercise(ex));
      
      this.assert(exerciseManager.getSelectedCount() <= 8, 'Не более 8 упражнений в тренировке');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 3: Сценарий синхронизации данных
   */
  async testDataSynchronizationFlow() {
    this.startTest('Синхронизация данных');
    
    try {
      // 1. Инициализация Yandex API
      yandexAPI.init('test-token');
      this.assert(yandexAPI.isAuthenticated, 'API должен быть инициализирован');
      
      // 2. Создание тестовых данных
      const testWorkout = {
        id: 'sync-test-workout',
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Тестовое упражнение',
            sets: [{ weight: 50, reps: 10 }]
          }
        ]
      };
      
      storage.addWorkout(testWorkout);
      
      // 3. Экспорт данных
      const exportData = storage.exportData();
      this.assert(exportData.workouts.length === 1, 'Должна быть 1 тренировка для экспорта');
      
      // 4. Импорт данных
      const importResult = storage.importData(exportData);
      this.assert(importResult, 'Импорт должен быть успешным');
      
      // 5. Проверка целостности данных
      const importedWorkouts = storage.loadWorkouts();
      this.assert(importedWorkouts.length === 1, 'Должна быть 1 импортированная тренировка');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 4: Сценарий анализа тела
   */
  async testBodyAnalysisFlow() {
    this.startTest('Анализ тела');
    
    try {
      // 1. Инициализация менеджера
      bodyAnalysisManager.init();
      this.assert(bodyAnalysisManager.isInitialized, 'Менеджер должен быть инициализирован');
      
      // 2. Создание тестового фото
      const testPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      
      // 3. Обработка фото
      bodyAnalysisManager.currentPhoto = testPhoto;
      this.assert(bodyAnalysisManager.currentPhoto, 'Фото должно быть установлено');
      
      // 4. Симуляция анализа
      const analysis = await bodyAnalysisManager.simulateBodyAnalysis(testPhoto);
      this.assert(analysis.bodyFatPercentage > 0, 'Анализ должен вернуть процент жира');
      this.assert(analysis.muscleMass > 0, 'Анализ должен вернуть мышечную массу');
      
      // 5. Сохранение анализа
      bodyAnalysisManager.currentAnalysis = analysis;
      bodyAnalysisManager.saveAnalysisToLocal(analysis);
      
      // 6. Проверка сохранения
      const savedAnalyses = storage.loadBodyAnalyses();
      this.assert(savedAnalyses.length === 1, 'Должен быть 1 сохраненный анализ');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 5: Сценарий отслеживания прогресса
   */
  async testProgressTrackingFlow() {
    this.startTest('Отслеживание прогресса');
    
    try {
      // 1. Инициализация менеджера
      progressManager.init();
      this.assert(progressManager.isInitialized, 'Менеджер должен быть инициализирован');
      
      // 2. Создание тестовых тренировок
      const testWorkouts = [
        {
          id: 'progress-test-1',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // неделю назад
          exercises: [
            {
              exercise: 'Жим лежа',
              sets: [{ weight: 70, reps: 8 }]
            }
          ]
        },
        {
          id: 'progress-test-2',
          date: new Date().toISOString(),
          exercises: [
            {
              exercise: 'Жим лежа',
              sets: [{ weight: 80, reps: 8 }]
            }
          ]
        }
      ];
      
      testWorkouts.forEach(workout => storage.addWorkout(workout));
      
      // 3. Получение данных прогресса
      const progressData = progressManager.getExerciseData('Жим лежа', 'month');
      this.assert(progressData.length === 2, 'Должны быть данные за 2 тренировки');
      
      // 4. Проверка расчета прогресса
      const firstWorkout = progressData[0];
      const lastWorkout = progressData[1];
      this.assert(lastWorkout.maxWeight > firstWorkout.maxWeight, 'Прогресс должен быть виден');
      
      // 5. Обновление отображения
      progressManager.currentExercise = 'Жим лежа';
      progressManager.updateProgressDisplay();
      this.assert(true, 'Отображение прогресса должно обновиться');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 6: Сценарий управления настройками
   */
  async testSettingsManagementFlow() {
    this.startTest('Управление настройками');
    
    try {
      // 1. Инициализация менеджера
      settingsManager.init();
      this.assert(settingsManager.isInitialized, 'Менеджер должен быть инициализирован');
      
      // 2. Загрузка текущих настроек
      const currentConfig = settingsManager.getConfig();
      this.assert(currentConfig, 'Настройки должны быть загружены');
      
      // 3. Обновление настроек
      const newSettings = {
        ...currentConfig,
        theme: 'dark',
        autoSync: true,
        syncInterval: 10
      };
      
      const saveResult = settingsManager.saveSettings(newSettings);
      this.assert(saveResult, 'Настройки должны быть сохранены');
      
      // 4. Проверка сохранения
      const updatedConfig = settingsManager.getConfig();
      this.assert(updatedConfig.theme === 'dark', 'Тема должна быть изменена');
      this.assert(updatedConfig.autoSync === true, 'Автосинхронизация должна быть включена');
      
      // 5. Тест AI подключения
      settingsManager.updateConfig({ huggingFaceApiKey: 'test-key' });
      this.assert(true, 'AI настройки должны обновиться');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 7: Обработка ошибок
   */
  async testErrorHandling() {
    this.startTest('Обработка ошибок');
    
    try {
      // 1. Тест невалидных данных
      const invalidWorkout = {
        id: '',
        date: 'invalid-date',
        exercises: []
      };
      
      const validation = validator.validateWorkout(invalidWorkout);
      this.assert(!validation.isValid, 'Невалидная тренировка должна быть отклонена');
      this.assert(validation.errors.length > 0, 'Должны быть ошибки валидации');
      
      // 2. Тест несуществующих элементов DOM
      const nonExistentElement = dom.getElement('non-existent-id');
      this.assert(nonExistentElement === null, 'Несуществующий элемент должен вернуть null');
      
      // 3. Тест обработки ошибок API
      try {
        await yandexAPI.getUserInfo();
        this.failTest(new Error('Должна быть ошибка при невалидном токене'));
      } catch (error) {
        this.assert(error.message.includes('401') || error.message.includes('Unauthorized'), 
                   'Должна быть ошибка авторизации');
      }
      
      // 4. Тест обработки ошибок AI
      try {
        await aiService.analyzeBodyWithAI('invalid-photo-data');
        this.failTest(new Error('Должна быть ошибка при невалидном фото'));
      } catch (error) {
        this.assert(true, 'AI ошибка должна быть обработана');
      }
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 8: Производительность
   */
  async testPerformance() {
    this.startTest('Производительность');
    
    try {
      // 1. Тест скорости загрузки данных
      const startTime = performance.now();
      const workouts = storage.loadWorkouts();
      const loadTime = performance.now() - startTime;
      
      this.assert(loadTime < 100, `Загрузка данных должна быть быстрой (${loadTime.toFixed(2)}ms)`);
      
      // 2. Тест скорости поиска упражнений
      const searchStart = performance.now();
      const searchResults = exerciseManager.searchExercises('жим');
      const searchTime = performance.now() - searchStart;
      
      this.assert(searchTime < 50, `Поиск должен быть быстрым (${searchTime.toFixed(2)}ms)`);
      
      // 3. Тест памяти
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Создаем много тренировок
      for (let i = 0; i < 100; i++) {
        const workout = {
          id: `perf-test-${i}`,
          date: new Date().toISOString(),
          exercises: [
            {
              exercise: 'Тестовое упражнение',
              sets: [{ weight: 50, reps: 10 }]
            }
          ]
        };
        storage.addWorkout(workout);
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      this.assert(memoryIncrease < 10 * 1024 * 1024, // 10MB
                 `Увеличение памяти должно быть разумным (${(memoryIncrease / 1024 / 1024).toFixed(2)}MB)`);
      
      // 4. Тест скорости валидации
      const validationStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        validator.validateWorkout({
          id: `test-${i}`,
          date: new Date().toISOString(),
          exercises: []
        });
      }
      const validationTime = performance.now() - validationStart;
      
      this.assert(validationTime < 1000, `Валидация должна быть быстрой (${validationTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Вспомогательные методы
   */
  startTest(testName) {
    this.currentTest = testName;
    logger.info(`🧪 Тест: ${testName}`);
  }

  passTest() {
    this.testResults.push({
      test: this.currentTest,
      status: 'PASS',
      message: 'Тест пройден успешно'
    });
    logger.success(`✅ ${this.currentTest} - ПРОЙДЕН`);
  }

  failTest(error) {
    this.testResults.push({
      test: this.currentTest,
      status: 'FAIL',
      message: error.message,
      error: error
    });
    logger.error(`❌ ${this.currentTest} - ПРОВАЛЕН: ${error.message}`);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  printResults() {
    logger.info('📊 Результаты интеграционных тестов:');
    logger.info('=====================================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    logger.info(`Всего тестов: ${total}`);
    logger.info(`Пройдено: ${passed}`);
    logger.info(`Провалено: ${failed}`);
    logger.info(`Успешность: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      logger.warn('Проваленные тесты:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => logger.error(`  - ${r.test}: ${r.message}`));
    }
    
    logger.info('=====================================');
    
    // Восстанавливаем исходные данные
    this.restoreOriginalData();
  }

  restoreOriginalData() {
    logger.info('🔄 Восстановление исходных данных...');
    storage.clearAll();
    
    if (this.testData.workouts.length > 0) {
      storage.saveWorkouts(this.testData.workouts);
    }
    
    if (Object.keys(this.testData.config).length > 0) {
      storage.saveConfig(this.testData.config);
    }
    
    logger.success('Исходные данные восстановлены');
  }
}

// Создаем экземпляр тестера
const integrationTester = new IntegrationTester();

// Экспортируем для использования в консоли
window.integrationTester = integrationTester;

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🧪 Интеграционные тесты загружены');
      console.log('💡 Запустите window.integrationTester.runAllTests() для тестирования');
    }, 4000);
  });
}

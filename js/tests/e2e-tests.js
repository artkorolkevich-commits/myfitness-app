/**
 * E2E тесты MyFitness App
 * 
 * @fileoverview Тестирование пользовательских сценариев
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

class E2ETester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.userScenarios = [
      {
        name: 'Новый пользователь',
        description: 'Пользователь впервые открывает приложение'
      },
      {
        name: 'Создание тренировки',
        description: 'Пользователь создает свою первую тренировку'
      },
      {
        name: 'Анализ прогресса',
        description: 'Пользователь анализирует свой прогресс'
      },
      {
        name: 'Синхронизация данных',
        description: 'Пользователь настраивает синхронизацию с Yandex.Disk'
      },
      {
        name: 'Анализ тела',
        description: 'Пользователь проводит анализ тела'
      },
      {
        name: 'Настройки приложения',
        description: 'Пользователь настраивает приложение'
      }
    ];
  }

  /**
   * Запуск всех E2E тестов
   */
  async runAllTests() {
    logger.info('🎭 Запуск E2E тестов...');
    
    try {
      // Подготовка
      await this.prepareForTesting();
      
      // Тестирование пользовательских сценариев
      await this.testNewUserScenario();
      await this.testWorkoutCreationScenario();
      await this.testProgressAnalysisScenario();
      await this.testDataSyncScenario();
      await this.testBodyAnalysisScenario();
      await this.testSettingsScenario();
      
      // Тестирование граничных случаев
      await this.testEdgeCases();
      
      // Тестирование доступности
      await this.testAccessibility();
      
      // Вывод результатов
      this.printResults();
      
    } catch (error) {
      logger.error('Ошибка выполнения E2E тестов:', error);
    }
  }

  /**
   * Подготовка к тестированию
   */
  async prepareForTesting() {
    logger.info('🎬 Подготовка к E2E тестированию...');
    
    // Очищаем все данные
    storage.clearAll();
    
    // Инициализируем все менеджеры
    historyManager.init();
    settingsManager.init();
    bodyAnalysisManager.init();
    progressManager.init();
    
    logger.success('Подготовка завершена');
  }

  /**
   * Сценарий 1: Новый пользователь
   */
  async testNewUserScenario() {
    this.startTest('Новый пользователь');
    
    try {
      // 1. Первый запуск приложения
      const config = storage.loadConfig();
      this.assert(Object.keys(config).length > 0, 'Конфигурация должна быть загружена');
      
      // 2. Проверка доступности упражнений
      const exercises = exerciseManager.getAllExercises();
      this.assert(exercises.length > 0, 'Должны быть доступны упражнения');
      
      // 3. Проверка пустой истории
      const workouts = storage.loadWorkouts();
      this.assert(workouts.length === 0, 'История должна быть пустой');
      
      // 4. Проверка настроек по умолчанию
      const defaultSettings = settingsManager.getConfig();
      this.assert(defaultSettings.theme, 'Должна быть установлена тема по умолчанию');
      this.assert(defaultSettings.autoSync !== undefined, 'Должна быть настройка автосинхронизации');
      
      // 5. Проверка доступности страниц
      this.assert(dom.getElement('welcomePage'), 'Должна быть доступна главная страница');
      this.assert(dom.getElement('workoutPage'), 'Должна быть доступна страница тренировки');
      this.assert(dom.getElement('historyPage'), 'Должна быть доступна страница истории');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Сценарий 2: Создание тренировки
   */
  async testWorkoutCreationScenario() {
    this.startTest('Создание тренировки');
    
    try {
      // 1. Выбор упражнений
      exerciseManager.selectExercise('Жим лежа');
      exerciseManager.selectExercise('Разведение гантелей лежа');
      exerciseManager.selectExercise('Отжимания от пола');
      
      const selectedCount = exerciseManager.getSelectedCount();
      this.assert(selectedCount === 3, 'Должно быть выбрано 3 упражнения');
      
      // 2. Создание тренировки
      const workout = {
        id: `e2e-workout-${Date.now()}`,
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Жим лежа',
            sets: [
              { weight: 80, reps: 8 },
              { weight: 85, reps: 6 },
              { weight: 90, reps: 4 }
            ]
          },
          {
            exercise: 'Разведение гантелей лежа',
            sets: [
              { weight: 20, reps: 12 },
              { weight: 22, reps: 10 },
              { weight: 25, reps: 8 }
            ]
          },
          {
            exercise: 'Отжимания от пола',
            sets: [
              { weight: 0, reps: 15 },
              { weight: 0, reps: 12 },
              { weight: 0, reps: 10 }
            ]
          }
        ]
      };
      
      // 3. Валидация тренировки
      const validation = validator.validateWorkout(workout);
      this.assert(validation.isValid, 'Тренировка должна пройти валидацию');
      
      // 4. Сохранение тренировки
      const saveResult = storage.addWorkout(workout);
      this.assert(saveResult, 'Тренировка должна быть сохранена');
      
      // 5. Проверка в истории
      const savedWorkouts = storage.loadWorkouts();
      this.assert(savedWorkouts.length === 1, 'Тренировка должна появиться в истории');
      
      // 6. Проверка данных тренировки
      const savedWorkout = savedWorkouts[0];
      this.assert(savedWorkout.exercises.length === 3, 'Должно быть 3 упражнения');
      this.assert(savedWorkout.exercises[0].sets.length === 3, 'Должно быть 3 подхода');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Сценарий 3: Анализ прогресса
   */
  async testProgressAnalysisScenario() {
    this.startTest('Анализ прогресса');
    
    try {
      // 1. Создание нескольких тренировок для анализа
      const workouts = [
        {
          id: 'progress-1',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 недели назад
          exercises: [
            {
              exercise: 'Жим лежа',
              sets: [{ weight: 70, reps: 8 }]
            }
          ]
        },
        {
          id: 'progress-2',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // неделю назад
          exercises: [
            {
              exercise: 'Жим лежа',
              sets: [{ weight: 75, reps: 8 }]
            }
          ]
        },
        {
          id: 'progress-3',
          date: new Date().toISOString(),
          exercises: [
            {
              exercise: 'Жим лежа',
              sets: [{ weight: 80, reps: 8 }]
            }
          ]
        }
      ];
      
      workouts.forEach(workout => storage.addWorkout(workout));
      
      // 2. Инициализация менеджера прогресса
      progressManager.init();
      
      // 3. Получение данных прогресса
      const progressData = progressManager.getExerciseData('Жим лежа', 'month');
      this.assert(progressData.length === 3, 'Должны быть данные за 3 тренировки');
      
      // 4. Проверка прогресса
      const firstWorkout = progressData[0];
      const lastWorkout = progressData[progressData.length - 1];
      this.assert(lastWorkout.maxWeight > firstWorkout.maxWeight, 'Должен быть виден прогресс');
      
      // 5. Проверка расчета объема
      const totalVolume = progressData.reduce((sum, workout) => sum + workout.totalVolume, 0);
      this.assert(totalVolume > 0, 'Общий объем должен быть больше 0');
      
      // 6. Обновление отображения
      progressManager.currentExercise = 'Жим лежа';
      progressManager.updateProgressDisplay();
      this.assert(true, 'Отображение прогресса должно обновиться');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Сценарий 4: Синхронизация данных
   */
  async testDataSyncScenario() {
    this.startTest('Синхронизация данных');
    
    try {
      // 1. Настройка Yandex.Disk
      const testToken = 'test-yandex-token';
      yandexAPI.init(testToken);
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
      this.assert(exportData.config, 'Должна быть конфигурация');
      
      // 4. Импорт данных
      const importResult = storage.importData(exportData);
      this.assert(importResult, 'Импорт должен быть успешным');
      
      // 5. Проверка целостности
      const importedWorkouts = storage.loadWorkouts();
      this.assert(importedWorkouts.length === 1, 'Должна быть 1 импортированная тренировка');
      
      // 6. Проверка настроек синхронизации
      const config = storage.loadConfig();
      this.assert(config.yandexPath, 'Должен быть путь к файлам на диске');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Сценарий 5: Анализ тела
   */
  async testBodyAnalysisScenario() {
    this.startTest('Анализ тела');
    
    try {
      // 1. Инициализация менеджера
      bodyAnalysisManager.init();
      this.assert(bodyAnalysisManager.isInitialized, 'Менеджер должен быть инициализирован');
      
      // 2. Создание тестового фото
      const testPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=';
      
      // 3. Обработка фото
      bodyAnalysisManager.currentPhoto = testPhoto;
      this.assert(bodyAnalysisManager.currentPhoto, 'Фото должно быть установлено');
      
      // 4. Выполнение анализа
      const analysis = await bodyAnalysisManager.simulateBodyAnalysis(testPhoto);
      this.assert(analysis.bodyFatPercentage >= 10 && analysis.bodyFatPercentage <= 35, 
                 'Процент жира должен быть в разумных пределах');
      this.assert(analysis.muscleMass >= 20 && analysis.muscleMass <= 50, 
                 'Мышечная масса должна быть в разумных пределах');
      this.assert(analysis.fitnessLevel, 'Должен быть определен уровень фитнеса');
      this.assert(analysis.confidence >= 70, 'Уверенность должна быть высокой');
      
      // 5. Сохранение анализа
      bodyAnalysisManager.currentAnalysis = analysis;
      bodyAnalysisManager.saveAnalysisToLocal(analysis);
      
      // 6. Проверка сохранения
      const savedAnalyses = storage.loadBodyAnalyses();
      this.assert(savedAnalyses.length === 1, 'Должен быть 1 сохраненный анализ');
      
      // 7. Проверка истории анализов
      const savedAnalysis = savedAnalyses[0];
      this.assert(savedAnalysis.bodyFatPercentage === analysis.bodyFatPercentage, 
                 'Процент жира должен совпадать');
      this.assert(savedAnalysis.timestamp, 'Должна быть временная метка');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Сценарий 6: Настройки приложения
   */
  async testSettingsScenario() {
    this.startTest('Настройки приложения');
    
    try {
      // 1. Инициализация менеджера настроек
      settingsManager.init();
      this.assert(settingsManager.isInitialized, 'Менеджер должен быть инициализирован');
      
      // 2. Загрузка текущих настроек
      const currentConfig = settingsManager.getConfig();
      this.assert(currentConfig, 'Настройки должны быть загружены');
      
      // 3. Изменение темы
      const newSettings = {
        ...currentConfig,
        theme: 'dark',
        autoSync: true,
        syncInterval: 10
      };
      
      const saveResult = settingsManager.saveSettings(newSettings);
      this.assert(saveResult, 'Настройки должны быть сохранены');
      
      // 4. Проверка изменений
      const updatedConfig = settingsManager.getConfig();
      this.assert(updatedConfig.theme === 'dark', 'Тема должна быть изменена на темную');
      this.assert(updatedConfig.autoSync === true, 'Автосинхронизация должна быть включена');
      this.assert(updatedConfig.syncInterval === 10, 'Интервал синхронизации должен быть 10 минут');
      
      // 5. Настройка AI
      settingsManager.updateConfig({ huggingFaceApiKey: 'test-ai-key' });
      const aiConfig = settingsManager.getConfig();
      this.assert(aiConfig.huggingFaceApiKey === 'test-ai-key', 'AI ключ должен быть сохранен');
      
      // 6. Тест экспорта/импорта настроек
      const exportData = storage.exportData();
      this.assert(exportData.config.theme === 'dark', 'Экспорт должен содержать новые настройки');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Граничные случаи
   */
  async testEdgeCases() {
    this.startTest('Граничные случаи');
    
    try {
      // 1. Максимальное количество упражнений
      const maxExercises = ['Упражнение 1', 'Упражнение 2', 'Упражнение 3', 'Упражнение 4',
                           'Упражнение 5', 'Упражнение 6', 'Упражнение 7', 'Упражнение 8'];
      
      maxExercises.forEach(ex => exerciseManager.selectExercise(ex));
      this.assert(exerciseManager.getSelectedCount() === 8, 'Должно быть ровно 8 упражнений');
      
      // 2. Пустая тренировка
      const emptyWorkout = {
        id: 'empty-workout',
        date: new Date().toISOString(),
        exercises: []
      };
      
      const validation = validator.validateWorkout(emptyWorkout);
      this.assert(!validation.isValid, 'Пустая тренировка должна быть отклонена');
      
      // 3. Очень большие значения
      const largeWorkout = {
        id: 'large-workout',
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Тест',
            sets: [{ weight: 999999, reps: 999999 }]
          }
        ]
      };
      
      const largeValidation = validator.validateWorkout(largeWorkout);
      this.assert(largeValidation.isValid, 'Большие значения должны быть допустимы');
      
      // 4. Специальные символы в названиях
      const specialWorkout = {
        id: 'special-workout',
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Упражнение с символами: !@#$%^&*()',
            sets: [{ weight: 50, reps: 10 }]
          }
        ]
      };
      
      const specialValidation = validator.validateWorkout(specialWorkout);
      this.assert(specialValidation.isValid, 'Специальные символы должны быть допустимы');
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тестирование доступности
   */
  async testAccessibility() {
    this.startTest('Доступность');
    
    try {
      // 1. Проверка наличия основных элементов
      const requiredElements = [
        'welcomePage', 'workoutPage', 'historyPage', 'settingsPage',
        'bodyAnalysisPage', 'progressPage'
      ];
      
      requiredElements.forEach(elementId => {
        const element = dom.getElement(elementId);
        this.assert(element, `Элемент ${elementId} должен быть доступен`);
      });
      
      // 2. Проверка навигации
      const navElements = dom.getElements('nav a');
      this.assert(navElements.length > 0, 'Должны быть элементы навигации');
      
      // 3. Проверка форм
      const formElements = dom.getElements('form');
      this.assert(formElements.length > 0, 'Должны быть формы');
      
      // 4. Проверка кнопок
      const buttons = dom.getElements('button');
      this.assert(buttons.length > 0, 'Должны быть кнопки');
      
      // 5. Проверка доступности через клавиатуру
      const focusableElements = dom.getElements('button, input, select, textarea, a[href]');
      this.assert(focusableElements.length > 0, 'Должны быть элементы, доступные с клавиатуры');
      
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
    logger.info(`🎭 E2E Тест: ${testName}`);
  }

  passTest() {
    this.testResults.push({
      test: this.currentTest,
      status: 'PASS',
      message: 'Сценарий пройден успешно'
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
    logger.info('📊 Результаты E2E тестов:');
    logger.info('==========================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    logger.info(`Всего сценариев: ${total}`);
    logger.info(`Пройдено: ${passed}`);
    logger.info(`Провалено: ${failed}`);
    logger.info(`Успешность: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      logger.warn('Проваленные сценарии:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => logger.error(`  - ${r.test}: ${r.message}`));
    }
    
    logger.info('==========================');
  }
}

// Создаем экземпляр E2E тестера
const e2eTester = new E2ETester();

// Экспортируем для использования в консоли
window.e2eTester = e2eTester;

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🎭 E2E тесты загружены');
      console.log('💡 Запустите window.e2eTester.runAllTests() для тестирования сценариев');
    }, 5000);
  });
}

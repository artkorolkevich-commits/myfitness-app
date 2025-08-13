/**
 * Тесты производительности MyFitness App
 * 
 * @fileoverview Тестирование производительности и оптимизации
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

class PerformanceTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.performanceThresholds = {
      storageLoad: 50,      // мс
      storageSave: 100,     // мс
      exerciseSearch: 10,   // мс
      validation: 5,        // мс
      domOperation: 20,     // мс
      memoryIncrease: 5     // МБ
    };
  }

  /**
   * Запуск всех тестов производительности
   */
  async runAllTests() {
    logger.info('⚡ Запуск тестов производительности...');
    
    try {
      // Подготовка
      await this.prepareForTesting();
      
      // Тесты производительности модулей
      await this.testStoragePerformance();
      await this.testExerciseManagerPerformance();
      await this.testValidationPerformance();
      await this.testDOMPerformance();
      await this.testMemoryUsage();
      await this.testConcurrentOperations();
      await this.testLargeDataSets();
      
      // Тесты оптимизации
      await this.testCachingPerformance();
      await this.testLazyLoadingPerformance();
      
      // Вывод результатов
      this.printResults();
      
    } catch (error) {
      logger.error('Ошибка выполнения тестов производительности:', error);
    }
  }

  /**
   * Подготовка к тестированию
   */
  async prepareForTesting() {
    logger.info('⚡ Подготовка к тестированию производительности...');
    
    // Очищаем данные
    storage.clearAll();
    
    // Инициализируем менеджеры
    historyManager.init();
    settingsManager.init();
    bodyAnalysisManager.init();
    progressManager.init();
    
    logger.success('Подготовка завершена');
  }

  /**
   * Тест 1: Производительность хранилища
   */
  async testStoragePerformance() {
    this.startTest('Производительность хранилища');
    
    try {
      // 1. Тест загрузки данных
      const loadStart = performance.now();
      const workouts = storage.loadWorkouts();
      const loadTime = performance.now() - loadStart;
      
      this.assert(loadTime < this.performanceThresholds.storageLoad, 
                 `Загрузка данных должна быть быстрой (${loadTime.toFixed(2)}ms)`);
      
      // 2. Тест сохранения данных
      const testWorkout = {
        id: 'perf-test-workout',
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Тестовое упражнение',
            sets: [{ weight: 50, reps: 10 }]
          }
        ]
      };
      
      const saveStart = performance.now();
      storage.addWorkout(testWorkout);
      const saveTime = performance.now() - saveStart;
      
      this.assert(saveTime < this.performanceThresholds.storageSave, 
                 `Сохранение данных должно быть быстрым (${saveTime.toFixed(2)}ms)`);
      
      // 3. Тест массового сохранения
      const bulkWorkouts = [];
      for (let i = 0; i < 100; i++) {
        bulkWorkouts.push({
          id: `bulk-${i}`,
          date: new Date().toISOString(),
          exercises: [
            {
              exercise: `Упражнение ${i}`,
              sets: [{ weight: 50 + i, reps: 10 }]
            }
          ]
        });
      }
      
      const bulkSaveStart = performance.now();
      storage.saveWorkouts(bulkWorkouts);
      const bulkSaveTime = performance.now() - bulkSaveStart;
      
      this.assert(bulkSaveTime < 500, 
                 `Массовое сохранение должно быть быстрым (${bulkSaveTime.toFixed(2)}ms)`);
      
      // 4. Тест экспорта/импорта
      const exportStart = performance.now();
      const exportData = storage.exportData();
      const exportTime = performance.now() - exportStart;
      
      this.assert(exportTime < 200, 
                 `Экспорт данных должен быть быстрым (${exportTime.toFixed(2)}ms)`);
      
      const importStart = performance.now();
      storage.importData(exportData);
      const importTime = performance.now() - importStart;
      
      this.assert(importTime < 300, 
                 `Импорт данных должен быть быстрым (${importTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 2: Производительность менеджера упражнений
   */
  async testExerciseManagerPerformance() {
    this.startTest('Производительность менеджера упражнений');
    
    try {
      // 1. Тест получения всех упражнений
      const getAllStart = performance.now();
      const allExercises = exerciseManager.getAllExercises();
      const getAllTime = performance.now() - getAllStart;
      
      this.assert(getAllTime < 10, 
                 `Получение всех упражнений должно быть быстрым (${getAllTime.toFixed(2)}ms)`);
      
      // 2. Тест поиска упражнений
      const searchStart = performance.now();
      const searchResults = exerciseManager.searchExercises('жим');
      const searchTime = performance.now() - searchStart;
      
      this.assert(searchTime < this.performanceThresholds.exerciseSearch, 
                 `Поиск упражнений должен быть быстрым (${searchTime.toFixed(2)}ms)`);
      
      // 3. Тест фильтрации по группам
      const filterStart = performance.now();
      const chestExercises = exerciseManager.getExercisesByGroup('Грудь');
      const filterTime = performance.now() - filterStart;
      
      this.assert(filterTime < 5, 
                 `Фильтрация по группам должна быть быстрой (${filterTime.toFixed(2)}ms)`);
      
      // 4. Тест выбора упражнений
      const selectStart = performance.now();
      for (let i = 0; i < 100; i++) {
        exerciseManager.selectExercise('Жим лежа');
        exerciseManager.deselectExercise('Жим лежа');
      }
      const selectTime = performance.now() - selectStart;
      
      this.assert(selectTime < 100, 
                 `Выбор упражнений должен быть быстрым (${selectTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 3: Производительность валидации
   */
  async testValidationPerformance() {
    this.startTest('Производительность валидации');
    
    try {
      // 1. Тест валидации тренировки
      const workout = {
        id: 'valid-workout',
        date: new Date().toISOString(),
        exercises: [
          {
            exercise: 'Тестовое упражнение',
            sets: [{ weight: 50, reps: 10 }]
          }
        ]
      };
      
      const validationStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        validator.validateWorkout(workout);
      }
      const validationTime = performance.now() - validationStart;
      
      this.assert(validationTime < 1000, 
                 `Валидация тренировок должна быть быстрой (${validationTime.toFixed(2)}ms)`);
      
      // 2. Тест валидации упражнения
      const exercise = {
        exercise: 'Тестовое упражнение',
        sets: [{ weight: 50, reps: 10 }]
      };
      
      const exerciseValidationStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        validator.validateExercise(exercise);
      }
      const exerciseValidationTime = performance.now() - exerciseValidationStart;
      
      this.assert(exerciseValidationTime < 500, 
                 `Валидация упражнений должна быть быстрой (${exerciseValidationTime.toFixed(2)}ms)`);
      
      // 3. Тест валидации файлов
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const fileValidationStart = performance.now();
      for (let i = 0; i < 100; i++) {
        validator.validateImageFile(mockFile);
      }
      const fileValidationTime = performance.now() - fileValidationStart;
      
      this.assert(fileValidationTime < 100, 
                 `Валидация файлов должна быть быстрой (${fileValidationTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 4: Производительность DOM операций
   */
  async testDOMPerformance() {
    this.startTest('Производительность DOM операций');
    
    try {
      // 1. Тест получения элементов
      const getElementStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        dom.getElement('welcomePage');
      }
      const getElementTime = performance.now() - getElementStart;
      
      this.assert(getElementTime < 100, 
                 `Получение элементов должно быть быстрым (${getElementTime.toFixed(2)}ms)`);
      
      // 2. Тест создания элементов
      const createElementStart = performance.now();
      for (let i = 0; i < 100; i++) {
        dom.createElement('div', { className: 'test-element' }, `Элемент ${i}`);
      }
      const createElementTime = performance.now() - createElementStart;
      
      this.assert(createElementTime < 50, 
                 `Создание элементов должно быть быстрым (${createElementTime.toFixed(2)}ms)`);
      
      // 3. Тест установки содержимого
      const testElement = document.createElement('div');
      const setContentStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        dom.setContent(testElement, `Содержимое ${i}`);
      }
      const setContentTime = performance.now() - setContentStart;
      
      this.assert(setContentTime < 100, 
                 `Установка содержимого должна быть быстрой (${setContentTime.toFixed(2)}ms)`);
      
      // 4. Тест переключения элементов
      const toggleStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        dom.toggleElement(testElement, i % 2 === 0);
      }
      const toggleTime = performance.now() - toggleStart;
      
      this.assert(toggleTime < 100, 
                 `Переключение элементов должно быть быстрым (${toggleTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 5: Использование памяти
   */
  async testMemoryUsage() {
    this.startTest('Использование памяти');
    
    try {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // 1. Создание большого количества тренировок
      const largeWorkouts = [];
      for (let i = 0; i < 1000; i++) {
        largeWorkouts.push({
          id: `memory-test-${i}`,
          date: new Date().toISOString(),
          exercises: [
            {
              exercise: `Упражнение ${i}`,
              sets: Array.from({ length: 5 }, (_, j) => ({
                weight: 50 + j,
                reps: 10 + j
              }))
            }
          ]
        });
      }
      
      storage.saveWorkouts(largeWorkouts);
      
      const afterWorkoutsMemory = performance.memory?.usedJSHeapSize || 0;
      const workoutsMemoryIncrease = (afterWorkoutsMemory - initialMemory) / 1024 / 1024;
      
      this.assert(workoutsMemoryIncrease < this.performanceThresholds.memoryIncrease, 
                 `Увеличение памяти должно быть разумным (${workoutsMemoryIncrease.toFixed(2)}MB)`);
      
      // 2. Создание большого количества упражнений
      const largeExercises = [];
      for (let i = 0; i < 1000; i++) {
        largeExercises.push({
          name: `Упражнение ${i}`,
          group: 'Тестовая группа',
          description: `Описание упражнения ${i}`
        });
      }
      
      // Симуляция работы с упражнениями
      largeExercises.forEach(exercise => {
        exerciseManager.selectExercise(exercise.name);
      });
      
      const afterExercisesMemory = performance.memory?.usedJSHeapSize || 0;
      const exercisesMemoryIncrease = (afterExercisesMemory - afterWorkoutsMemory) / 1024 / 1024;
      
      this.assert(exercisesMemoryIncrease < 2, 
                 `Увеличение памяти от упражнений должно быть небольшим (${exercisesMemoryIncrease.toFixed(2)}MB)`);
      
      // 3. Очистка памяти
      storage.clearAll();
      exerciseManager.clearSelected();
      
      const afterCleanupMemory = performance.memory?.usedJSHeapSize || 0;
      const cleanupMemoryDecrease = (afterExercisesMemory - afterCleanupMemory) / 1024 / 1024;
      
      this.assert(cleanupMemoryDecrease > 0, 
                 `Очистка должна освобождать память (${cleanupMemoryDecrease.toFixed(2)}MB)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 6: Конкурентные операции
   */
  async testConcurrentOperations() {
    this.startTest('Конкурентные операции');
    
    try {
      // 1. Параллельное создание тренировок
      const concurrentStart = performance.now();
      
      const promises = Array.from({ length: 10 }, (_, i) => {
        return new Promise(resolve => {
          setTimeout(() => {
            const workout = {
              id: `concurrent-${i}`,
              date: new Date().toISOString(),
              exercises: [
                {
                  exercise: `Упражнение ${i}`,
                  sets: [{ weight: 50, reps: 10 }]
                }
              ]
            };
            storage.addWorkout(workout);
            resolve();
          }, Math.random() * 100);
        });
      });
      
      await Promise.all(promises);
      const concurrentTime = performance.now() - concurrentStart;
      
      this.assert(concurrentTime < 200, 
                 `Конкурентные операции должны быть быстрыми (${concurrentTime.toFixed(2)}ms)`);
      
      // 2. Параллельный поиск упражнений
      const searchPromises = Array.from({ length: 5 }, () => {
        return new Promise(resolve => {
          setTimeout(() => {
            exerciseManager.searchExercises('жим');
            resolve();
          }, Math.random() * 50);
        });
      });
      
      const searchStart = performance.now();
      await Promise.all(searchPromises);
      const searchTime = performance.now() - searchStart;
      
      this.assert(searchTime < 100, 
                 `Параллельный поиск должен быть быстрым (${searchTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 7: Большие наборы данных
   */
  async testLargeDataSets() {
    this.startTest('Большие наборы данных');
    
    try {
      // 1. Создание большого набора тренировок
      const largeDataSet = [];
      for (let i = 0; i < 10000; i++) {
        largeDataSet.push({
          id: `large-${i}`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          exercises: [
            {
              exercise: `Упражнение ${i % 100}`,
              sets: Array.from({ length: 3 }, (_, j) => ({
                weight: 50 + (i % 50),
                reps: 10 + (j % 5)
              }))
            }
          ]
        });
      }
      
      const largeSaveStart = performance.now();
      storage.saveWorkouts(largeDataSet);
      const largeSaveTime = performance.now() - largeSaveStart;
      
      this.assert(largeSaveTime < 2000, 
                 `Сохранение большого набора данных должно быть приемлемым (${largeSaveTime.toFixed(2)}ms)`);
      
      // 2. Загрузка большого набора данных
      const largeLoadStart = performance.now();
      const loadedData = storage.loadWorkouts();
      const largeLoadTime = performance.now() - largeLoadStart;
      
      this.assert(largeLoadTime < 1000, 
                 `Загрузка большого набора данных должна быть быстрой (${largeLoadTime.toFixed(2)}ms)`);
      this.assert(loadedData.length === 10000, 'Должны быть загружены все данные');
      
      // 3. Фильтрация большого набора данных
      const filterStart = performance.now();
      const filteredData = loadedData.filter(workout => 
        workout.exercises.some(ex => ex.exercise.includes('Упражнение 1'))
      );
      const filterTime = performance.now() - filterStart;
      
      this.assert(filterTime < 100, 
                 `Фильтрация большого набора данных должна быть быстрой (${filterTime.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 8: Производительность кэширования
   */
  async testCachingPerformance() {
    this.startTest('Производительность кэширования');
    
    try {
      // 1. Тест кэширования упражнений
      const firstCallStart = performance.now();
      const exercises1 = exerciseManager.getAllExercises();
      const firstCallTime = performance.now() - firstCallStart;
      
      const secondCallStart = performance.now();
      const exercises2 = exerciseManager.getAllExercises();
      const secondCallTime = performance.now() - secondCallStart;
      
      this.assert(secondCallTime < firstCallTime, 
                 `Повторный вызов должен быть быстрее (${secondCallTime.toFixed(2)}ms vs ${firstCallTime.toFixed(2)}ms)`);
      
      // 2. Тест кэширования поиска
      const search1Start = performance.now();
      const search1 = exerciseManager.searchExercises('жим');
      const search1Time = performance.now() - search1Start;
      
      const search2Start = performance.now();
      const search2 = exerciseManager.searchExercises('жим');
      const search2Time = performance.now() - search2Start;
      
      this.assert(search2Time < search1Time, 
                 `Повторный поиск должен быть быстрее (${search2Time.toFixed(2)}ms vs ${search1Time.toFixed(2)}ms)`);
      
      this.passTest();
      
    } catch (error) {
      this.failTest(error);
    }
  }

  /**
   * Тест 9: Производительность ленивой загрузки
   */
  async testLazyLoadingPerformance() {
    this.startTest('Производительность ленивой загрузки');
    
    try {
      // 1. Тест инициализации менеджеров
      const initStart = performance.now();
      
      // Инициализируем менеджеры по очереди
      historyManager.init();
      settingsManager.init();
      bodyAnalysisManager.init();
      progressManager.init();
      
      const initTime = performance.now() - initStart;
      
      this.assert(initTime < 100, 
                 `Инициализация менеджеров должна быть быстрой (${initTime.toFixed(2)}ms)`);
      
      // 2. Тест ленивой загрузки данных
      const lazyLoadStart = performance.now();
      
      // Загружаем данные только при необходимости
      const workouts = storage.loadWorkouts();
      const exercises = exerciseManager.getAllExercises();
      const config = storage.loadConfig();
      
      const lazyLoadTime = performance.now() - lazyLoadStart;
      
      this.assert(lazyLoadTime < 50, 
                 `Ленивая загрузка данных должна быть быстрой (${lazyLoadTime.toFixed(2)}ms)`);
      
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
    logger.info(`⚡ Тест производительности: ${testName}`);
  }

  passTest() {
    this.testResults.push({
      test: this.currentTest,
      status: 'PASS',
      message: 'Тест производительности пройден'
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
    logger.info('📊 Результаты тестов производительности:');
    logger.info('==========================================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    logger.info(`Всего тестов: ${total}`);
    logger.info(`Пройдено: ${passed}`);
    logger.info(`Провалено: ${failed}`);
    logger.info(`Успешность: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      logger.warn('Проваленные тесты производительности:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => logger.error(`  - ${r.test}: ${r.message}`));
    }
    
    logger.info('==========================================');
  }
}

// Создаем экземпляр тестера производительности
const performanceTester = new PerformanceTester();

// Экспортируем для использования в консоли
window.performanceTester = performanceTester;

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('⚡ Тесты производительности загружены');
      console.log('💡 Запустите window.performanceTester.runAllTests() для тестирования производительности');
    }, 6000);
  });
}

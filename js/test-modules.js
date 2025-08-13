/**
 * Тестовый файл для проверки работы модулей
 */

import { logger } from './utils/logger.js';
import { storage } from './modules/storage.js';
import { exerciseManager } from './modules/exercises.js';
import { yandexAPI } from './modules/yandex-api.js';
import { aiService } from './modules/ai-service.js';
import { validator } from './utils/validator.js';
import { dom } from './utils/dom.js';

class ModuleTester {
  constructor() {
    this.testResults = [];
  }

  /**
   * Запуск всех тестов
   */
  async runAllTests() {
    logger.info('Starting module tests...');
    
    try {
      await this.testStorage();
      await this.testExerciseManager();
      await this.testValidator();
      await this.testDOMUtils();
      await this.testYandexAPI();
      await this.testAIService();
      
      this.printResults();
    } catch (error) {
      logger.error('Test execution failed:', error);
    }
  }

  /**
   * Тест модуля хранилища
   */
  async testStorage() {
    logger.info('Testing storage module...');
    
    try {
      // Тест загрузки конфигурации
      const config = storage.loadConfig();
      this.assert(config, 'Config loaded successfully');
      
      // Тест сохранения конфигурации
      const testConfig = { testField: 'testValue' };
      const saveResult = storage.saveConfig(testConfig);
      this.assert(saveResult, 'Config saved successfully');
      
      // Тест работы с тренировками
      const workouts = storage.loadWorkouts();
      this.assert(Array.isArray(workouts), 'Workouts loaded as array');
      
      // Тест добавления тренировки
      const testWorkout = {
        exercises: [{
          exercise: 'Test Exercise',
          sets: [{ weight: 50, reps: 10 }]
        }]
      };
      const addResult = storage.addWorkout(testWorkout);
      this.assert(addResult, 'Workout added successfully');
      
      logger.success('Storage tests completed');
    } catch (error) {
      logger.error('Storage test failed:', error);
      this.testResults.push({ module: 'Storage', success: false, error: error.message });
    }
  }

  /**
   * Тест менеджера упражнений
   */
  async testExerciseManager() {
    logger.info('Testing exercise manager...');
    
    try {
      // Тест получения всех упражнений
      const allExercises = exerciseManager.getAllExercises();
      this.assert(Object.keys(allExercises).length > 0, 'Exercises data loaded');
      
      // Тест поиска упражнений
      const searchResults = exerciseManager.searchExercises('жим');
      this.assert(Array.isArray(searchResults), 'Search returns array');
      
      // Тест выбора упражнений
      const selectResult = exerciseManager.selectExercise('Жим лежа');
      this.assert(selectResult, 'Exercise selected successfully');
      
      // Тест получения выбранных упражнений
      const selected = exerciseManager.getSelectedExercises();
      this.assert(selected.includes('Жим лежа'), 'Selected exercise found');
      
      // Тест валидации упражнения
      const testExercise = {
        exercise: 'Test Exercise',
        sets: [{ weight: 50, reps: 10 }]
      };
      const validation = exerciseManager.validateExercise(testExercise);
      this.assert(validation.isValid, 'Exercise validation passed');
      
      logger.success('Exercise manager tests completed');
    } catch (error) {
      logger.error('Exercise manager test failed:', error);
      this.testResults.push({ module: 'ExerciseManager', success: false, error: error.message });
    }
  }

  /**
   * Тест валидатора
   */
  async testValidator() {
    logger.info('Testing validator...');
    
    try {
      // Тест валидации тренировки
      const testWorkout = {
        exercises: [{
          exercise: 'Test Exercise',
          sets: [{ weight: 50, reps: 10 }]
        }]
      };
      const workoutValidation = validator.validateWorkout(testWorkout);
      this.assert(workoutValidation.isValid, 'Workout validation passed');
      
      // Тест валидации API ключа
      const apiKeyValidation = validator.validateHuggingFaceApiKey('hf_test123456789');
      this.assert(apiKeyValidation.isValid, 'API key validation passed');
      
      // Тест валидации даты
      const dateValidation = validator.validateDate(new Date().toISOString());
      this.assert(dateValidation.isValid, 'Date validation passed');
      
      logger.success('Validator tests completed');
    } catch (error) {
      logger.error('Validator test failed:', error);
      this.testResults.push({ module: 'Validator', success: false, error: error.message });
    }
  }

  /**
   * Тест DOM утилит
   */
  async testDOMUtils() {
    logger.info('Testing DOM utils...');
    
    try {
      // Создаем тестовый элемент
      const testElement = document.createElement('div');
      testElement.id = 'test-element';
      document.body.appendChild(testElement);
      
      // Тест установки содержимого
      const setResult = dom.setContent(testElement, 'Test content');
      this.assert(setResult, 'Content set successfully');
      this.assert(testElement.textContent === 'Test content', 'Content matches');
      
      // Тест создания элемента
      const newElement = dom.createElement('span', { className: 'test-class' }, 'Test span');
      this.assert(newElement, 'Element created successfully');
      this.assert(newElement.tagName === 'SPAN', 'Element tag correct');
      this.assert(newElement.className === 'test-class', 'Element class correct');
      
      // Тест получения элемента
      const foundElement = dom.getElement('test-element');
      this.assert(foundElement, 'Element found successfully');
      
      // Очищаем тестовый элемент
      document.body.removeChild(testElement);
      
      logger.success('DOM utils tests completed');
    } catch (error) {
      logger.error('DOM utils test failed:', error);
      this.testResults.push({ module: 'DOMUtils', success: false, error: error.message });
    }
  }

  /**
   * Тест Yandex API
   */
  async testYandexAPI() {
    logger.info('Testing Yandex API...');
    
    try {
      // Тест получения OAuth URL
      const oauthUrl = yandexAPI.getOAuthUrl();
      this.assert(oauthUrl.includes('oauth.yandex.ru'), 'OAuth URL generated');
      
      // Тест обработки OAuth callback (без токена)
      const callbackResult = yandexAPI.handleOAuthCallback();
      this.assert(!callbackResult.success, 'OAuth callback handled correctly');
      
      logger.success('Yandex API tests completed');
    } catch (error) {
      logger.error('Yandex API test failed:', error);
      this.testResults.push({ module: 'YandexAPI', success: false, error: error.message });
    }
  }

  /**
   * Тест AI сервиса
   */
  async testAIService() {
    logger.info('Testing AI service...');
    
    try {
      // Тест без API ключа
      const testResult = await aiService.testHuggingFaceConnection();
      this.assert(!testResult.success, 'Test without API key handled correctly');
      
      // Тест с неверным API ключом
      aiService.init('invalid_key');
      const invalidTestResult = await aiService.testHuggingFaceConnection();
      this.assert(!invalidTestResult.success, 'Invalid API key handled correctly');
      
      logger.success('AI service tests completed');
    } catch (error) {
      logger.error('AI service test failed:', error);
      this.testResults.push({ module: 'AIService', success: false, error: error.message });
    }
  }

  /**
   * Проверка условия
   */
  assert(condition, message) {
    if (condition) {
      this.testResults.push({ module: 'Test', success: true, message });
    } else {
      this.testResults.push({ module: 'Test', success: false, message: `Failed: ${message}` });
    }
  }

  /**
   * Вывод результатов тестов
   */
  printResults() {
    logger.info('=== Test Results ===');
    
    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    
    logger.info(`Tests passed: ${passed}/${total}`);
    
    this.testResults.forEach(result => {
      if (result.success) {
        logger.success(`✓ ${result.message || 'Test passed'}`);
      } else {
        logger.error(`✗ ${result.message || result.error || 'Test failed'}`);
      }
    });
    
    logger.info('=== End Test Results ===');
  }
}

// Создаем экземпляр тестера
const moduleTester = new ModuleTester();

// Экспортируем для использования в консоли
window.moduleTester = moduleTester;

// Автоматический запуск тестов в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      moduleTester.runAllTests();
    }, 1000);
  });
}

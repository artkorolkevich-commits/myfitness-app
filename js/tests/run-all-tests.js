/**
 * Главный файл для запуска всех тестов MyFitness App
 * 
 * @fileoverview Объединяет все системы тестирования
 * @version 1.0.0
 * @author MyFitness App Team
 */

// Импорты всех тестеров
import { logger } from '../utils/logger.js';

class TestRunner {
  constructor() {
    this.testSuites = [
      { name: 'Модульные тесты', runner: window.moduleTester },
      { name: 'Интеграционные тесты', runner: window.integrationTester },
      { name: 'E2E тесты', runner: window.e2eTester },
      { name: 'Тесты производительности', runner: window.performanceTester }
    ];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: []
    };
  }

  /**
   * Запуск всех тестов
   */
  async runAllTests() {
    logger.info('🚀 Запуск всех тестов MyFitness App');
    logger.info('=====================================');
    
    const startTime = performance.now();
    
    try {
      // Запускаем все тестовые наборы
      for (const suite of this.testSuites) {
        if (suite.runner && typeof suite.runner.runAllTests === 'function') {
          logger.info(`🧪 Запуск ${suite.name}...`);
          
          const suiteStartTime = performance.now();
          await suite.runner.runAllTests();
          const suiteTime = performance.now() - suiteStartTime;
          
          this.results.suites.push({
            name: suite.name,
            time: suiteTime,
            status: 'completed'
          });
          
          logger.success(`✅ ${suite.name} завершены за ${suiteTime.toFixed(2)}ms`);
        } else {
          logger.warn(`⚠️ ${suite.name} недоступны`);
          this.results.suites.push({
            name: suite.name,
            time: 0,
            status: 'unavailable'
          });
        }
      }
      
      const totalTime = performance.now() - startTime;
      
      // Выводим общие результаты
      this.printSummary(totalTime);
      
    } catch (error) {
      logger.error('Ошибка выполнения тестов:', error);
    }
  }

  /**
   * Запуск конкретного набора тестов
   */
  async runTestSuite(suiteName) {
    const suite = this.testSuites.find(s => s.name === suiteName);
    
    if (!suite) {
      logger.error(`Тестовый набор "${suiteName}" не найден`);
      return;
    }
    
    if (!suite.runner || typeof suite.runner.runAllTests !== 'function') {
      logger.error(`Тестовый набор "${suiteName}" недоступен`);
      return;
    }
    
    logger.info(`🧪 Запуск ${suiteName}...`);
    const startTime = performance.now();
    
    try {
      await suite.runner.runAllTests();
      const time = performance.now() - startTime;
      logger.success(`✅ ${suiteName} завершены за ${time.toFixed(2)}ms`);
    } catch (error) {
      logger.error(`Ошибка выполнения ${suiteName}:`, error);
    }
  }

  /**
   * Запуск быстрых тестов (только модульные)
   */
  async runQuickTests() {
    logger.info('⚡ Запуск быстрых тестов...');
    
    if (window.moduleTester && typeof window.moduleTester.runAllTests === 'function') {
      const startTime = performance.now();
      await window.moduleTester.runAllTests();
      const time = performance.now() - startTime;
      logger.success(`✅ Быстрые тесты завершены за ${time.toFixed(2)}ms`);
    } else {
      logger.error('Модульные тесты недоступны');
    }
  }

  /**
   * Запуск тестов производительности
   */
  async runPerformanceTests() {
    logger.info('⚡ Запуск тестов производительности...');
    
    if (window.performanceTester && typeof window.performanceTester.runAllTests === 'function') {
      const startTime = performance.now();
      await window.performanceTester.runAllTests();
      const time = performance.now() - startTime;
      logger.success(`✅ Тесты производительности завершены за ${time.toFixed(2)}ms`);
    } else {
      logger.error('Тесты производительности недоступны');
    }
  }

  /**
   * Запуск пользовательских сценариев
   */
  async runUserScenarios() {
    logger.info('🎭 Запуск пользовательских сценариев...');
    
    if (window.e2eTester && typeof window.e2eTester.runAllTests === 'function') {
      const startTime = performance.now();
      await window.e2eTester.runAllTests();
      const time = performance.now() - startTime;
      logger.success(`✅ Пользовательские сценарии завершены за ${time.toFixed(2)}ms`);
    } else {
      logger.error('E2E тесты недоступны');
    }
  }

  /**
   * Вывод сводки результатов
   */
  printSummary(totalTime) {
    logger.info('📊 Сводка результатов тестирования:');
    logger.info('=====================================');
    
    this.results.suites.forEach(suite => {
      const status = suite.status === 'completed' ? '✅' : '⚠️';
      const timeStr = suite.time > 0 ? ` (${suite.time.toFixed(2)}ms)` : '';
      logger.info(`${status} ${suite.name}${timeStr}`);
    });
    
    logger.info('=====================================');
    logger.info(`⏱️ Общее время выполнения: ${totalTime.toFixed(2)}ms`);
    logger.info('🎯 Все тесты завершены!');
  }

  /**
   * Получение списка доступных тестов
   */
  getAvailableTests() {
    return this.testSuites
      .filter(suite => suite.runner && typeof suite.runner.runAllTests === 'function')
      .map(suite => suite.name);
  }

  /**
   * Проверка готовности тестов
   */
  checkTestReadiness() {
    logger.info('🔍 Проверка готовности тестов...');
    
    const available = this.getAvailableTests();
    const unavailable = this.testSuites
      .filter(suite => !suite.runner || typeof suite.runner.runAllTests !== 'function')
      .map(suite => suite.name);
    
    if (available.length > 0) {
      logger.success(`✅ Доступные тесты: ${available.join(', ')}`);
    }
    
    if (unavailable.length > 0) {
      logger.warn(`⚠️ Недоступные тесты: ${unavailable.join(', ')}`);
    }
    
    return {
      available,
      unavailable,
      total: this.testSuites.length
    };
  }
}

// Создаем экземпляр тестера
const testRunner = new TestRunner();

// Экспортируем для использования в консоли
window.testRunner = testRunner;

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🚀 Главный тестер загружен');
      console.log('💡 Доступные команды:');
      console.log('   window.testRunner.runAllTests() - запуск всех тестов');
      console.log('   window.testRunner.runQuickTests() - быстрые тесты');
      console.log('   window.testRunner.runPerformanceTests() - тесты производительности');
      console.log('   window.testRunner.runUserScenarios() - пользовательские сценарии');
      console.log('   window.testRunner.checkTestReadiness() - проверка готовности');
      
      // Проверяем готовность тестов
      testRunner.checkTestReadiness();
    }, 7000);
  });
}

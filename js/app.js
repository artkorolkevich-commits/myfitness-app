/**
 * Основной файл приложения MyFitness
 */

import { storage } from './modules/storage.js';
import { logger } from './utils/logger.js';
import { validator } from './utils/validator.js';
import { dom } from './utils/dom.js';
import { STORAGE_KEYS, DEFAULT_CONFIG, API_CONFIG } from './modules/config.js';
import { exerciseManager } from './modules/exercises.js';
import { yandexAPI } from './modules/yandex-api.js';
import { aiService } from './modules/ai-service.js';
import { uiManager } from './components/ui-manager.js';
import { historyManager } from './modules/history-manager.js';
import { settingsManager } from './modules/settings-manager.js';
import { bodyAnalysisManager } from './modules/body-analysis-manager.js';
import { progressManager } from './modules/progress-manager.js';

class MyFitnessApp {
  constructor() {
    this.config = null;
    this.currentPage = 'welcome';
    this.isInitialized = false;
  }

  /**
   * Инициализация приложения
   */
  async init() {
    try {
      logger.info('Initializing MyFitness app...');
      
      // Загружаем конфигурацию
      this.config = storage.loadConfig();
      
      // Инициализируем сервисы
      this.initServices();
      
      // Инициализируем UI
      uiManager.init();
      
      // Показываем приветственную страницу
      uiManager.showPage('welcome');
      
      this.isInitialized = true;
      logger.success('MyFitness app initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize app:', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Инициализация сервисов
   */
  initServices() {
    // Инициализируем Yandex API
    if (this.config.yandexToken) {
      yandexAPI.init(this.config.yandexToken);
    }

    // Инициализируем AI сервис
    if (this.config.huggingFaceApiKey) {
      aiService.init(this.config.huggingFaceApiKey);
    }

    // Инициализируем менеджеры
    historyManager.init();
    settingsManager.init();
    bodyAnalysisManager.init();
    progressManager.init();

    logger.info('Services initialized');
  }



  /**
   * Показать ошибку
   */
  showError(message) {
    logger.error('User error:', message);
    // Здесь будет показ ошибки пользователю
    alert(`Ошибка: ${message}`);
  }

  /**
   * Показать успех
   */
  showSuccess(message) {
    logger.success('User success:', message);
    // Здесь будет показ успеха пользователю
    alert(`Успех: ${message}`);
  }

  /**
   * Получить конфигурацию
   */
  getConfig() {
    return this.config;
  }

  /**
   * Обновить конфигурацию
   */
  updateConfig(newConfig) {
    try {
      const validation = validator.validateConfig(newConfig);
      if (!validation.isValid) {
        logger.warn('Config validation failed:', validation.errors);
        return false;
      }

      this.config = { ...this.config, ...newConfig };
      storage.saveConfig(this.config);
      logger.success('Config updated successfully');
      return true;
    } catch (error) {
      logger.error('Failed to update config:', error);
      return false;
    }
  }
}

// Создаем глобальный экземпляр приложения
window.myFitnessApp = new MyFitnessApp();

// Инициализируем приложение когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
  window.myFitnessApp.init();
});

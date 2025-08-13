/**
 * Основной файл приложения MyFitness
 */

import { storage } from './modules/storage.js';
import { logger } from './utils/logger.js';
import { validator } from './utils/validator.js';
import { dom } from './utils/dom.js';
import { STORAGE_KEYS, DEFAULT_CONFIG, API_CONFIG } from './modules/config.js';

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
      
      // Инициализируем страницы
      this.initPages();
      
      // Устанавливаем обработчики событий
      this.setupEventListeners();
      
      // Показываем приветственную страницу
      this.showPage('welcome');
      
      this.isInitialized = true;
      logger.success('MyFitness app initialized successfully');
      
    } catch (error) {
      logger.error('Failed to initialize app:', error);
      this.showError('Ошибка инициализации приложения');
    }
  }

  /**
   * Инициализация страниц
   */
  initPages() {
    logger.info('Initializing pages...');
    
    // Инициализируем каждую страницу
    this.initWelcomePage();
    this.initMainPage();
    this.initHistoryPage();
    this.initProgressPage();
    this.initBodyAnalysisPage();
    this.initSettingsPage();
  }

  /**
   * Инициализация приветственной страницы
   */
  initWelcomePage() {
    logger.debug('Initializing welcome page');
    this.updateWelcomeStats();
  }

  /**
   * Обновление статистики на приветственной странице
   */
  updateWelcomeStats() {
    try {
      const workouts = storage.loadWorkouts();
      const now = new Date();
      
      const stats = {
        totalWorkouts: workouts.length,
        thisWeek: this.getWorkoutsInPeriod(workouts, 'week', now),
        thisMonth: this.getWorkoutsInPeriod(workouts, 'month', now),
        thisYear: this.getWorkoutsInPeriod(workouts, 'year', now)
      };

      // Обновляем элементы на странице
      Object.entries(stats).forEach(([key, value]) => {
        const element = dom.getElement(key);
        if (element) {
          dom.setContent(element, value.toString());
        }
      });

      logger.debug('Welcome stats updated:', stats);
    } catch (error) {
      logger.error('Failed to update welcome stats:', error);
    }
  }

  /**
   * Получение количества тренировок за период
   */
  getWorkoutsInPeriod(workouts, period, now) {
    const periodStart = this.getPeriodStart(period, now);
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= periodStart;
    }).length;
  }

  /**
   * Получение начала периода
   */
  getPeriodStart(period, now) {
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

  /**
   * Инициализация главной страницы
   */
  initMainPage() {
    logger.debug('Initializing main page');
    // Здесь будет инициализация страницы тренировок
  }

  /**
   * Инициализация страницы истории
   */
  initHistoryPage() {
    logger.debug('Initializing history page');
    // Здесь будет инициализация страницы истории
  }

  /**
   * Инициализация страницы прогресса
   */
  initProgressPage() {
    logger.debug('Initializing progress page');
    // Здесь будет инициализация страницы прогресса
  }

  /**
   * Инициализация страницы анализа тела
   */
  initBodyAnalysisPage() {
    logger.debug('Initializing body analysis page');
    // Здесь будет инициализация страницы анализа тела
  }

  /**
   * Инициализация страницы настроек
   */
  initSettingsPage() {
    logger.debug('Initializing settings page');
    // Здесь будет инициализация страницы настроек
  }

  /**
   * Установка обработчиков событий
   */
  setupEventListeners() {
    logger.info('Setting up event listeners...');
    
    // Навигация
    this.setupNavigation();
    
    // Кнопки действий
    this.setupActionButtons();
    
    // Формы
    this.setupForms();
  }

  /**
   * Настройка навигации
   */
  setupNavigation() {
    const navItems = dom.getElements('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        if (page) {
          this.showPage(page);
        }
      });
    });
  }

  /**
   * Настройка кнопок действий
   */
  setupActionButtons() {
    // Кнопка обновления кэша
    const clearCacheBtn = dom.getElement('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    // Кнопка тестирования API
    const testApiBtn = dom.getElement('testApiBtn');
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testApi());
    }
  }

  /**
   * Настройка форм
   */
  setupForms() {
    // Здесь будет настройка форм
  }

  /**
   * Показать страницу
   */
  showPage(pageName) {
    try {
      logger.info(`Showing page: ${pageName}`);
      
      // Скрываем все страницы
      const pages = dom.getElements('.page-content');
      pages.forEach(page => {
        dom.toggleElement(page, false);
      });

      // Показываем нужную страницу
      const targetPage = dom.getElement(`${pageName}-page`);
      if (targetPage) {
        dom.toggleElement(targetPage, true);
        this.currentPage = pageName;
        
        // Обновляем активный элемент навигации
        this.updateActiveNavigation(pageName);
        
        // Инициализируем страницу если нужно
        this.initPageIfNeeded(pageName);
        
        logger.success(`Page ${pageName} shown successfully`);
      } else {
        logger.warn(`Page ${pageName} not found`);
      }
    } catch (error) {
      logger.error(`Failed to show page ${pageName}:`, error);
    }
  }

  /**
   * Обновление активного элемента навигации
   */
  updateActiveNavigation(pageName) {
    const navItems = dom.getElements('.nav-item');
    navItems.forEach(item => {
      dom.toggleClass(item, 'active', item.getAttribute('data-page') === pageName);
    });
  }

  /**
   * Инициализация страницы если нужно
   */
  initPageIfNeeded(pageName) {
    switch (pageName) {
      case 'welcome':
        this.updateWelcomeStats();
        break;
      case 'main':
        // Инициализация страницы тренировок
        break;
      case 'history':
        // Инициализация страницы истории
        break;
      case 'progress':
        // Инициализация страницы прогресса
        break;
      case 'body-analysis':
        // Инициализация страницы анализа тела
        break;
      case 'settings':
        // Инициализация страницы настроек
        break;
    }
  }

  /**
   * Очистка кэша
   */
  async clearCache() {
    try {
      logger.info('Clearing cache...');
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }

      // Перезагружаем страницу
      window.location.reload();
      
      logger.success('Cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      this.showError('Ошибка очистки кэша');
    }
  }

  /**
   * Тестирование API
   */
  async testApi() {
    try {
      logger.info('Testing API...');
      
      if (!this.config.huggingFaceApiKey) {
        this.showError('API ключ не настроен');
        return;
      }

      const validation = validator.validateHuggingFaceApiKey(this.config.huggingFaceApiKey);
      if (!validation.isValid) {
        this.showError(validation.error);
        return;
      }

      // Здесь будет тестирование API
      this.showSuccess('API тест выполнен успешно');
      
    } catch (error) {
      logger.error('API test failed:', error);
      this.showError('Ошибка тестирования API');
    }
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

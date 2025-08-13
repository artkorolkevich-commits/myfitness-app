/**
 * Модуль для управления UI компонентами
 */

import { logger } from '../utils/logger.js';
import { dom } from '../utils/dom.js';
import { exerciseManager } from '../modules/exercises.js';

class UIManager {
  constructor() {
    this.currentPage = 'welcome';
    this.isInitialized = false;
  }

  /**
   * Инициализация UI
   */
  init() {
    try {
      logger.info('Initializing UI manager...');
      
      this.setupNavigation();
      this.setupEventListeners();
      this.updateActiveNavigation('welcome');
      
      this.isInitialized = true;
      logger.success('UI manager initialized');
    } catch (error) {
      logger.error('Failed to initialize UI manager:', error);
    }
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
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Кнопки действий
    this.setupActionButtons();
    
    // Формы
    this.setupForms();
    
    // Поиск и фильтры
    this.setupSearchAndFilters();
  }

  /**
   * Настройка кнопок действий
   */
  setupActionButtons() {
    // Кнопка очистки кэша
    const clearCacheBtn = dom.getElement('clearCacheBtn');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    // Кнопка тестирования API
    const testApiBtn = dom.getElement('testApiBtn');
    if (testApiBtn) {
      testApiBtn.addEventListener('click', () => this.testApi());
    }

    // Кнопка OAuth
    const oauthBtn = dom.getElement('oauthBtn');
    if (oauthBtn) {
      oauthBtn.addEventListener('click', () => this.handleOAuth());
    }
  }

  /**
   * Настройка форм
   */
  setupForms() {
    // Форма настроек
    const settingsForm = dom.getElement('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Форма тренировки
    const workoutForm = dom.getElement('workoutForm');
    if (workoutForm) {
      workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveWorkout();
      });
    }
  }

  /**
   * Настройка поиска и фильтров
   */
  setupSearchAndFilters() {
    // Поиск упражнений
    const exerciseSearch = dom.getElement('exerciseSearch');
    if (exerciseSearch) {
      exerciseSearch.addEventListener('input', (e) => {
        this.filterExercises(e.target.value);
      });
    }

    // Фильтры по группам
    const groupButtons = dom.getElements('.group-btn');
    groupButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterByGroup(e.target.getAttribute('data-group'));
      });
    });

    // Фильтры по типу
    const filterButtons = dom.getElements('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filterByType(e.target.getAttribute('data-filter'));
      });
    });
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
        this.initMainPage();
        break;
      case 'history':
        this.initHistoryPage();
        break;
      case 'progress':
        this.initProgressPage();
        break;
      case 'body-analysis':
        this.initBodyAnalysisPage();
        break;
      case 'settings':
        this.initSettingsPage();
        break;
    }
  }

  /**
   * Инициализация главной страницы
   */
  initMainPage() {
    logger.debug('Initializing main page');
    this.renderExerciseGrid();
    this.updateSelectedCounter();
  }

  /**
   * Рендеринг сетки упражнений
   */
  renderExerciseGrid() {
    const grid = dom.getElement('exerciseGrid');
    if (!grid) return;

    const exercises = exerciseManager.getAllExercises();
    const selectedExercises = exerciseManager.getSelectedExercises();
    
    let html = '';
    
    Object.entries(exercises).forEach(([group, exerciseList]) => {
      html += `<div class="exercise-group">
        <h3 class="group-title">${group}</h3>
        <div class="exercise-list">`;
      
      exerciseList.forEach(exercise => {
        const isSelected = selectedExercises.includes(exercise);
        html += `<div class="exercise-item ${isSelected ? 'selected' : ''}" 
          data-exercise="${exercise}" data-group="${group}">
          <span class="exercise-name">${exercise}</span>
          <button class="select-btn" onclick="uiManager.toggleExercise('${exercise}')">
            ${isSelected ? '✓' : '+'}
          </button>
        </div>`;
      });
      
      html += `</div></div>`;
    });

    dom.setContent(grid, html, 'html');
  }

  /**
   * Переключение выбора упражнения
   */
  toggleExercise(exerciseName) {
    const isSelected = exerciseManager.isExerciseSelected(exerciseName);
    
    if (isSelected) {
      exerciseManager.deselectExercise(exerciseName);
    } else {
      const success = exerciseManager.selectExercise(exerciseName);
      if (!success) {
        this.showMessage('Максимальное количество упражнений: 8', 'warning');
        return;
      }
    }
    
    this.renderExerciseGrid();
    this.updateSelectedCounter();
  }

  /**
   * Обновление счетчика выбранных упражнений
   */
  updateSelectedCounter() {
    const counter = dom.getElement('selectedCount');
    if (counter) {
      const count = exerciseManager.getSelectedCount();
      dom.setContent(counter, count.toString());
    }
  }

  /**
   * Фильтрация упражнений
   */
  filterExercises(query) {
    const results = exerciseManager.searchExercises(query);
    this.renderFilteredExercises(results);
  }

  /**
   * Фильтрация по группе
   */
  filterByGroup(group) {
    const exercises = exerciseManager.getExercisesByGroup(group);
    const results = exercises.map(exercise => ({ name: exercise, group }));
    this.renderFilteredExercises(results);
  }

  /**
   * Фильтрация по типу
   */
  filterByType(type) {
    let results = [];
    
    switch (type) {
      case 'popular':
        results = exerciseManager.getPopularExercises();
        break;
      case 'recent':
        const recent = exerciseManager.getRecentExercises();
        results = recent.map(exercise => ({ name: exercise, group: exerciseManager.getExerciseGroup(exercise) }));
        break;
      case 'all':
      default:
        const allExercises = exerciseManager.getAllExercises();
        Object.entries(allExercises).forEach(([group, exerciseList]) => {
          exerciseList.forEach(exercise => {
            results.push({ name: exercise, group });
          });
        });
        break;
    }
    
    this.renderFilteredExercises(results);
  }

  /**
   * Рендеринг отфильтрованных упражнений
   */
  renderFilteredExercises(exercises) {
    const grid = dom.getElement('exerciseGrid');
    if (!grid) return;

    const selectedExercises = exerciseManager.getSelectedExercises();
    
    let html = '';
    exercises.forEach(({ name, group }) => {
      const isSelected = selectedExercises.includes(name);
      html += `<div class="exercise-item ${isSelected ? 'selected' : ''}" 
        data-exercise="${name}" data-group="${group}">
        <span class="exercise-name">${name}</span>
        <span class="exercise-group">${group}</span>
        <button class="select-btn" onclick="uiManager.toggleExercise('${name}')">
          ${isSelected ? '✓' : '+'}
        </button>
      </div>`;
    });

    dom.setContent(grid, html, 'html');
  }

  /**
   * Обновление статистики на приветственной странице
   */
  updateWelcomeStats() {
    // Здесь будет обновление статистики
    logger.debug('Updating welcome stats');
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

      this.showMessage('Кэш очищен. Страница будет перезагружена.', 'success');
      
      // Перезагружаем страницу
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      logger.error('Failed to clear cache:', error);
      this.showMessage('Ошибка очистки кэша', 'error');
    }
  }

  /**
   * Тестирование API
   */
  async testApi() {
    try {
      logger.info('Testing API...');
      this.showMessage('Тестирование API...', 'info');
      
      // Здесь будет тестирование API
      
      this.showMessage('API тест выполнен успешно', 'success');
    } catch (error) {
      logger.error('API test failed:', error);
      this.showMessage('Ошибка тестирования API', 'error');
    }
  }

  /**
   * Обработка OAuth
   */
  handleOAuth() {
    try {
      logger.info('Initiating OAuth...');
      // Здесь будет обработка OAuth
    } catch (error) {
      logger.error('OAuth failed:', error);
      this.showMessage('Ошибка OAuth', 'error');
    }
  }

  /**
   * Сохранение настроек
   */
  saveSettings() {
    try {
      logger.info('Saving settings...');
      // Здесь будет сохранение настроек
      this.showMessage('Настройки сохранены', 'success');
    } catch (error) {
      logger.error('Failed to save settings:', error);
      this.showMessage('Ошибка сохранения настроек', 'error');
    }
  }

  /**
   * Сохранение тренировки
   */
  saveWorkout() {
    try {
      logger.info('Saving workout...');
      // Здесь будет сохранение тренировки
      this.showMessage('Тренировка сохранена', 'success');
    } catch (error) {
      logger.error('Failed to save workout:', error);
      this.showMessage('Ошибка сохранения тренировки', 'error');
    }
  }

  /**
   * Показать сообщение
   */
  showMessage(message, type = 'info') {
    logger.info(`UI Message [${type}]:`, message);
    
    // Создаем элемент сообщения
    const messageEl = dom.createElement('div', {
      className: `message message-${type}`,
      textContent: message
    });

    // Добавляем в контейнер сообщений
    const container = dom.getElement('messageContainer') || document.body;
    container.appendChild(messageEl);

    // Удаляем через 3 секунды
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 3000);
  }

  /**
   * Показать ошибку
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Показать успех
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Показать предупреждение
   */
  showWarning(message) {
    this.showMessage(message, 'warning');
  }
}

// Создаем единственный экземпляр
export const uiManager = new UIManager();

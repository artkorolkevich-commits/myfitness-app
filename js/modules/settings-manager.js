/**
 * Модуль для управления настройками приложения
 */

import { logger } from '../utils/logger.js';
import { storage } from './storage.js';
import { dom } from '../utils/dom.js';
import { yandexAPI } from './yandex-api.js';
import { aiService } from './ai-service.js';
import { validator } from '../utils/validator.js';

class SettingsManager {
  constructor() {
    this.config = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация менеджера настроек
   */
  init() {
    try {
      logger.info('Initializing settings manager...');
      
      this.config = storage.loadConfig();
      this.setupEventListeners();
      this.applyConfigToUI();
      this.updateAuthStatus();
      
      this.isInitialized = true;
      logger.success('Settings manager initialized');
    } catch (error) {
      logger.error('Failed to initialize settings manager:', error);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Форма настроек
    const settingsForm = dom.getElement('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Кнопки OAuth
    const oauthBtn = dom.getElement('oauthBtn');
    const logoutBtn = dom.getElement('logoutBtn');
    
    if (oauthBtn) {
      oauthBtn.addEventListener('click', () => this.loginWithYandex());
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logoutFromYandex());
    }

    // Кнопки экспорта/импорта
    const exportBtn = dom.getElement('exportBtn');
    const importBtn = dom.getElement('importBtn');
    const clearDataBtn = dom.getElement('clearDataBtn');
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }
    
    if (importBtn) {
      importBtn.addEventListener('click', () => this.importData());
    }
    
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearData());
    }

    // Кнопки тестирования API
    const testHuggingFaceBtn = dom.getElement('testHuggingFaceBtn');
    if (testHuggingFaceBtn) {
      testHuggingFaceBtn.addEventListener('click', () => this.testHuggingFaceConnection());
    }

    // Автосохранение полей
    this.setupAutoSave();
  }

  /**
   * Настройка автосохранения полей
   */
  setupAutoSave() {
    const autoSaveFields = [
      'yandexToken',
      'yandexPath',
      'autoSync',
      'syncInterval',
      'defaultCycle',
      'huggingFaceApiKey'
    ];

    autoSaveFields.forEach(fieldName => {
      const element = dom.getElement(fieldName);
      if (element) {
        element.addEventListener('change', () => this.autoSaveField(fieldName));
        element.addEventListener('blur', () => this.autoSaveField(fieldName));
      }
    });
  }

  /**
   * Автосохранение поля
   */
  autoSaveField(fieldName) {
    try {
      const element = dom.getElement(fieldName);
      if (!element) return;

      let value = element.value;
      
      // Обработка специальных типов полей
      if (element.type === 'checkbox') {
        value = element.checked;
      } else if (element.type === 'number') {
        value = parseFloat(value) || 0;
      }

      // Обновляем конфигурацию
      this.config[fieldName] = value;
      
      // Сохраняем в хранилище
      storage.saveConfig(this.config);
      
      logger.debug('Auto-saved field:', fieldName, value);
    } catch (error) {
      logger.error('Failed to auto-save field:', error);
    }
  }

  /**
   * Применение конфигурации к UI
   */
  applyConfigToUI() {
    try {
      Object.entries(this.config).forEach(([key, value]) => {
        const element = dom.getElement(key);
        if (!element) return;

        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      });

      logger.debug('Config applied to UI');
    } catch (error) {
      logger.error('Failed to apply config to UI:', error);
    }
  }

  /**
   * Сохранение настроек
   */
  saveSettings() {
    try {
      logger.info('Saving settings...');
      
      // Собираем данные из формы
      const formData = this.collectFormData();
      
      // Валидируем данные
      const validation = validator.validateConfig(formData);
      if (!validation.isValid) {
        this.showStatus(`Ошибка валидации: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      // Обновляем конфигурацию
      this.config = { ...this.config, ...formData };
      
      // Сохраняем в хранилище
      storage.saveConfig(this.config);
      
      // Инициализируем сервисы с новыми настройками
      this.initializeServices();
      
      this.showStatus('Настройки сохранены успешно', 'success');
      logger.success('Settings saved');
    } catch (error) {
      logger.error('Failed to save settings:', error);
      this.showStatus('Ошибка сохранения настроек', 'error');
    }
  }

  /**
   * Сбор данных из формы
   */
  collectFormData() {
    const formData = {};
    
    const fields = [
      'yandexToken',
      'yandexPath',
      'autoSync',
      'syncInterval',
      'defaultCycle',
      'huggingFaceApiKey'
    ];

    fields.forEach(fieldName => {
      const element = dom.getElement(fieldName);
      if (element) {
        let value = element.value;
        
        if (element.type === 'checkbox') {
          value = element.checked;
        } else if (element.type === 'number') {
          value = parseFloat(value) || 0;
        }
        
        formData[fieldName] = value;
      }
    });

    return formData;
  }

  /**
   * Инициализация сервисов
   */
  initializeServices() {
    try {
      // Инициализируем Yandex API
      if (this.config.yandexToken) {
        yandexAPI.init(this.config.yandexToken);
      }

      // Инициализируем AI сервис
      if (this.config.huggingFaceApiKey) {
        aiService.init(this.config.huggingFaceApiKey);
      }

      logger.debug('Services initialized with new config');
    } catch (error) {
      logger.error('Failed to initialize services:', error);
    }
  }

  /**
   * Обновление статуса авторизации
   */
  updateAuthStatus() {
    try {
      const authStatus = dom.getElement('authStatus');
      const oauthBtn = dom.getElement('oauthBtn');
      const logoutBtn = dom.getElement('logoutBtn');

      if (this.config.yandexToken) {
        if (authStatus) {
          dom.setContent(authStatus, 'Подключено к Яндекс.Диску');
          dom.toggleClass(authStatus, 'connected', true);
        }
        
        if (oauthBtn) dom.toggleElement(oauthBtn, false);
        if (logoutBtn) dom.toggleElement(logoutBtn, true);
      } else {
        if (authStatus) {
          dom.setContent(authStatus, 'Не подключено');
          dom.toggleClass(authStatus, 'connected', false);
        }
        
        if (oauthBtn) dom.toggleElement(oauthBtn, true);
        if (logoutBtn) dom.toggleElement(logoutBtn, false);
      }

      logger.debug('Auth status updated');
    } catch (error) {
      logger.error('Failed to update auth status:', error);
    }
  }

  /**
   * Вход через Яндекс
   */
  loginWithYandex() {
    try {
      logger.info('Initiating Yandex OAuth...');
      
      const oauthUrl = yandexAPI.getOAuthUrl();
      window.location.href = oauthUrl;
      
      logger.debug('Redirecting to OAuth URL');
    } catch (error) {
      logger.error('Failed to initiate OAuth:', error);
      this.showStatus('Ошибка входа через Яндекс', 'error');
    }
  }

  /**
   * Выход из Яндекс
   */
  logoutFromYandex() {
    try {
      logger.info('Logging out from Yandex...');
      
      // Очищаем токен
      this.config.yandexToken = '';
      storage.saveConfig(this.config);
      
      // Выходим из API
      yandexAPI.logout();
      
      // Обновляем UI
      this.applyConfigToUI();
      this.updateAuthStatus();
      
      this.showStatus('Выход выполнен успешно', 'success');
      logger.success('Logged out from Yandex');
    } catch (error) {
      logger.error('Failed to logout from Yandex:', error);
      this.showStatus('Ошибка выхода', 'error');
    }
  }

  /**
   * Экспорт данных
   */
  exportData() {
    try {
      logger.info('Exporting data...');
      
      const data = storage.exportData();
      if (!data) {
        this.showStatus('Ошибка экспорта данных', 'error');
        return;
      }

      // Создаем файл для скачивания
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `myfitness-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      this.showStatus('Данные экспортированы успешно', 'success');
      logger.success('Data exported');
    } catch (error) {
      logger.error('Failed to export data:', error);
      this.showStatus('Ошибка экспорта данных', 'error');
    }
  }

  /**
   * Импорт данных
   */
  importData() {
    try {
      logger.info('Importing data...');
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const success = storage.importData(event.target.result);
            
            if (success) {
              this.showStatus('Данные импортированы успешно', 'success');
              logger.success('Data imported');
            } else {
              this.showStatus('Ошибка импорта данных', 'error');
            }
          } catch (error) {
            logger.error('Failed to process imported data:', error);
            this.showStatus('Ошибка обработки файла', 'error');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      logger.error('Failed to import data:', error);
      this.showStatus('Ошибка импорта данных', 'error');
    }
  }

  /**
   * Очистка данных
   */
  clearData() {
    try {
      logger.info('Clearing data...');
      
      if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
        const success = storage.clearAll();
        
        if (success) {
          this.showStatus('Данные очищены успешно', 'success');
          logger.success('Data cleared');
        } else {
          this.showStatus('Ошибка очистки данных', 'error');
        }
      }
    } catch (error) {
      logger.error('Failed to clear data:', error);
      this.showStatus('Ошибка очистки данных', 'error');
    }
  }

  /**
   * Тестирование подключения к Hugging Face
   */
  async testHuggingFaceConnection() {
    try {
      logger.info('Testing Hugging Face connection...');
      
      if (!this.config.huggingFaceApiKey) {
        this.showStatus('API ключ не настроен', 'error');
        return;
      }

      const validation = validator.validateHuggingFaceApiKey(this.config.huggingFaceApiKey);
      if (!validation.isValid) {
        this.showStatus(validation.error, 'error');
        return;
      }

      this.showStatus('Тестирование подключения...', 'info');
      
      const result = await aiService.testHuggingFaceConnection();
      
      if (result.success) {
        this.showStatus(result.message, 'success');
      } else {
        this.showStatus(result.message, 'error');
      }
      
      logger.debug('Hugging Face test completed:', result);
    } catch (error) {
      logger.error('Failed to test Hugging Face connection:', error);
      this.showStatus('Ошибка тестирования подключения', 'error');
    }
  }

  /**
   * Показать статус
   */
  showStatus(message, type = 'info') {
    logger.info(`Settings Status [${type}]:`, message);
    
    // Создаем элемент статуса
    const statusEl = dom.createElement('div', {
      className: `status-message status-${type}`,
      textContent: message
    });

    // Добавляем в контейнер статусов
    const container = dom.getElement('statusContainer') || document.body;
    container.appendChild(statusEl);

    // Удаляем через 3 секунды
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.parentNode.removeChild(statusEl);
      }
    }, 3000);
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
      this.config = { ...this.config, ...newConfig };
      storage.saveConfig(this.config);
      this.applyConfigToUI();
      this.initializeServices();
      
      logger.success('Config updated');
      return true;
    } catch (error) {
      logger.error('Failed to update config:', error);
      return false;
    }
  }
}

// Создаем единственный экземпляр
export const settingsManager = new SettingsManager();

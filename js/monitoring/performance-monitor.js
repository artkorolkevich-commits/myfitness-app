/**
 * Система мониторинга производительности MyFitness App
 * 
 * @fileoverview Отслеживание производительности, ошибок и метрик
 * @version 1.0.0
 * @author MyFitness App Team
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      errors: [],
      userActions: [],
      memoryUsage: [],
      performanceMarks: {}
    };
    
    this.config = {
      enabled: true,
      sampleRate: 1.0, // 100% событий
      maxErrors: 100,
      maxMetrics: 1000,
      reportInterval: 60000, // 1 минута
      enableRealTime: true
    };
    
    this.observers = [];
    this.isInitialized = false;
  }

  /**
   * Инициализация мониторинга
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('📊 Инициализация системы мониторинга...');
    
    try {
      // Настройка наблюдателей производительности
      this.setupPerformanceObservers();
      
      // Настройка обработчиков ошибок
      this.setupErrorHandlers();
      
      // Настройка отслеживания API вызовов
      this.setupAPIMonitoring();
      
      // Настройка отслеживания действий пользователя
      this.setupUserActionTracking();
      
      // Настройка мониторинга памяти
      this.setupMemoryMonitoring();
      
      // Запуск периодической отчетности
      this.startPeriodicReporting();
      
      this.isInitialized = true;
      console.log('✅ Система мониторинга инициализирована');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации мониторинга:', error);
    }
  }

  /**
   * Настройка наблюдателей производительности
   */
  setupPerformanceObservers() {
    // Наблюдатель за производительностью страницы
    if ('PerformanceObserver' in window) {
      const performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceMetric(entry);
        }
      });
      
      performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    }
    
    // Отслеживание времени загрузки страницы
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.pageLoad = {
        timestamp: Date.now(),
        loadTime: loadTime,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      };
    });
  }

  /**
   * Настройка обработчиков ошибок
   */
  setupErrorHandlers() {
    // Глобальный обработчик ошибок
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        stack: event.error?.stack
      });
    });
    
    // Обработчик необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'unhandledrejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        timestamp: Date.now(),
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Настройка мониторинга API вызовов
   */
  setupAPIMonitoring() {
    // Перехват fetch запросов
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordAPICall({
          url: url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: Date.now(),
          success: response.ok
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordAPICall({
          url: url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
  }

  /**
   * Настройка отслеживания действий пользователя
   */
  setupUserActionTracking() {
    // Отслеживание кликов
    document.addEventListener('click', (event) => {
      this.recordUserAction({
        type: 'click',
        target: event.target.tagName,
        id: event.target.id,
        className: event.target.className,
        timestamp: Date.now()
      });
    });
    
    // Отслеживание навигации
    document.addEventListener('navigation', (event) => {
      this.recordUserAction({
        type: 'navigation',
        from: event.detail?.from,
        to: event.detail?.to,
        timestamp: Date.now()
      });
    });
    
    // Отслеживание форм
    document.addEventListener('submit', (event) => {
      this.recordUserAction({
        type: 'form_submit',
        formId: event.target.id,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Настройка мониторинга памяти
   */
  setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 30000); // Каждые 30 секунд
    }
  }

  /**
   * Запуск периодической отчетности
   */
  startPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, this.config.reportInterval);
  }

  /**
   * Запись метрики производительности
   */
  recordPerformanceMetric(entry) {
    if (!this.config.enabled) return;
    
    const metric = {
      name: entry.name,
      type: entry.entryType,
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    };
    
    this.metrics.performanceMarks[entry.name] = metric;
    
    // Ограничиваем количество метрик
    if (Object.keys(this.metrics.performanceMarks).length > this.config.maxMetrics) {
      const oldestKey = Object.keys(this.metrics.performanceMarks)[0];
      delete this.metrics.performanceMarks[oldestKey];
    }
  }

  /**
   * Запись ошибки
   */
  recordError(error) {
    if (!this.config.enabled) return;
    
    this.metrics.errors.push(error);
    
    // Ограничиваем количество ошибок
    if (this.metrics.errors.length > this.config.maxErrors) {
      this.metrics.errors.shift();
    }
    
    // Уведомляем наблюдателей
    this.notifyObservers('error', error);
  }

  /**
   * Запись API вызова
   */
  recordAPICall(apiCall) {
    if (!this.config.enabled) return;
    
    this.metrics.apiCalls.push(apiCall);
    
    // Ограничиваем количество записей
    if (this.metrics.apiCalls.length > this.config.maxMetrics) {
      this.metrics.apiCalls.shift();
    }
    
    // Уведомляем наблюдателей о медленных запросах
    if (apiCall.duration > 1000) { // Более 1 секунды
      this.notifyObservers('slow_api', apiCall);
    }
  }

  /**
   * Запись действия пользователя
   */
  recordUserAction(action) {
    if (!this.config.enabled) return;
    
    this.metrics.userActions.push(action);
    
    // Ограничиваем количество действий
    if (this.metrics.userActions.length > this.config.maxMetrics) {
      this.metrics.userActions.shift();
    }
  }

  /**
   * Запись использования памяти
   */
  recordMemoryUsage(memory) {
    if (!this.config.enabled) return;
    
    this.metrics.memoryUsage.push(memory);
    
    // Ограничиваем количество записей
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
    
    // Уведомляем о высоком использовании памяти
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      this.notifyObservers('high_memory', { ...memory, usagePercent });
    }
  }

  /**
   * Генерация отчета
   */
  generateReport() {
    const report = {
      timestamp: Date.now(),
      pageLoad: this.metrics.pageLoad,
      apiCalls: this.getAPICallStats(),
      errors: this.getErrorStats(),
      userActions: this.getUserActionStats(),
      memoryUsage: this.getMemoryStats(),
      performance: this.getPerformanceStats()
    };
    
    // Отправляем отчет
    this.sendReport(report);
    
    // Выводим в консоль в режиме разработки
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
      this.printReport(report);
    }
  }

  /**
   * Статистика API вызовов
   */
  getAPICallStats() {
    const calls = this.metrics.apiCalls;
    if (calls.length === 0) return {};
    
    const successful = calls.filter(call => call.success);
    const failed = calls.filter(call => !call.success);
    const durations = calls.map(call => call.duration);
    
    return {
      total: calls.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / calls.length) * 100,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations)
    };
  }

  /**
   * Статистика ошибок
   */
  getErrorStats() {
    const errors = this.metrics.errors;
    if (errors.length === 0) return {};
    
    const errorTypes = {};
    errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
    });
    
    return {
      total: errors.length,
      types: errorTypes,
      recent: errors.slice(-5) // Последние 5 ошибок
    };
  }

  /**
   * Статистика действий пользователя
   */
  getUserActionStats() {
    const actions = this.metrics.userActions;
    if (actions.length === 0) return {};
    
    const actionTypes = {};
    actions.forEach(action => {
      actionTypes[action.type] = (actionTypes[action.type] || 0) + 1;
    });
    
    return {
      total: actions.length,
      types: actionTypes,
      recent: actions.slice(-10) // Последние 10 действий
    };
  }

  /**
   * Статистика использования памяти
   */
  getMemoryStats() {
    const memory = this.metrics.memoryUsage;
    if (memory.length === 0) return {};
    
    const latest = memory[memory.length - 1];
    const usagePercent = (latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100;
    
    return {
      current: {
        used: latest.usedJSHeapSize,
        total: latest.totalJSHeapSize,
        limit: latest.jsHeapSizeLimit,
        usagePercent: usagePercent
      },
      trend: memory.slice(-5) // Последние 5 измерений
    };
  }

  /**
   * Статистика производительности
   */
  getPerformanceStats() {
    const marks = Object.values(this.metrics.performanceMarks);
    if (marks.length === 0) return {};
    
    const durations = marks.map(mark => mark.duration);
    
    return {
      totalMarks: marks.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      recentMarks: marks.slice(-10) // Последние 10 меток
    };
  }

  /**
   * Отправка отчета
   */
  sendReport(report) {
    // В реальном проекте здесь была бы отправка на сервер аналитики
    // Например, Google Analytics, Mixpanel, или собственный сервер
    
    if (this.config.enableRealTime) {
      // Отправляем в реальном времени
      this.sendToAnalytics(report);
    }
  }

  /**
   * Отправка в аналитику
   */
  sendToAnalytics(data) {
    try {
      // Пример отправки в Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metrics', {
          event_category: 'performance',
          event_label: 'app_metrics',
          value: data.apiCalls?.averageDuration || 0,
          custom_parameters: data
        });
      }
      
      // Пример отправки в собственную аналитику
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(error => {
        console.warn('Не удалось отправить аналитику:', error);
      });
      
    } catch (error) {
      console.warn('Ошибка отправки аналитики:', error);
    }
  }

  /**
   * Вывод отчета в консоль
   */
  printReport(report) {
    console.log('📊 Отчет производительности:');
    console.log('============================');
    console.log(`⏱️ Время загрузки: ${report.pageLoad?.loadTime?.toFixed(2)}ms`);
    console.log(`🌐 API вызовы: ${report.apiCalls?.total || 0} (${report.apiCalls?.successRate?.toFixed(1)}% успешных)`);
    console.log(`❌ Ошибки: ${report.errors?.total || 0}`);
    console.log(`👤 Действия: ${report.userActions?.total || 0}`);
    console.log(`💾 Память: ${report.memoryUsage?.current?.usagePercent?.toFixed(1)}%`);
    console.log('============================');
  }

  /**
   * Добавление наблюдателя
   */
  addObserver(callback) {
    this.observers.push(callback);
  }

  /**
   * Уведомление наблюдателей
   */
  notifyObservers(event, data) {
    this.observers.forEach(observer => {
      try {
        observer(event, data);
      } catch (error) {
        console.warn('Ошибка в наблюдателе:', error);
      }
    });
  }

  /**
   * Получение метрик
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Очистка метрик
   */
  clearMetrics() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      errors: [],
      userActions: [],
      memoryUsage: [],
      performanceMarks: {}
    };
  }

  /**
   * Вспомогательные методы
   */
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  /**
   * Установка метки производительности
   */
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Измерение времени между метками
   */
  measure(name, startMark, endMark) {
    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.recordPerformanceMetric(measure);
      } catch (error) {
        console.warn('Ошибка измерения производительности:', error);
      }
    }
  }
}

// Создаем экземпляр мониторинга
const performanceMonitor = new PerformanceMonitor();

// Экспортируем для использования в консоли
window.performanceMonitor = performanceMonitor;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    performanceMonitor.init();
  }, 1000);
});

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('📊 Система мониторинга производительности загружена');
      console.log('💡 Доступные команды:');
      console.log('   window.performanceMonitor.getMetrics() - получить метрики');
      console.log('   window.performanceMonitor.generateReport() - сгенерировать отчет');
      console.log('   window.performanceMonitor.clearMetrics() - очистить метрики');
    }, 9000);
  });
}

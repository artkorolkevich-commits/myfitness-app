/**
 * Модуль для централизованного логирования
 */

class Logger {
  constructor() {
    this.isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('github.io');
  }

  /**
   * Логирует информационное сообщение
   */
  info(message, data = null) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * Логирует предупреждение
   */
  warn(message, error = null) {
    console.warn(`[WARN] ${message}`, error || '');
  }

  /**
   * Логирует ошибку
   */
  error(message, error = null) {
    console.error(`[ERROR] ${message}`, error || '');
    
    // В продакшене можно отправлять ошибки в аналитику
    if (!this.isDevelopment) {
      this.sendErrorToAnalytics(message, error);
    }
  }

  /**
   * Логирует отладочную информацию
   */
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Логирует успешную операцию
   */
  success(message, data = null) {
    if (this.isDevelopment) {
      console.log(`[SUCCESS] ${message}`, data || '');
    }
  }

  /**
   * Логирует API запросы
   */
  api(method, url, data = null) {
    if (this.isDevelopment) {
      console.log(`[API] ${method} ${url}`, data || '');
    }
  }

  /**
   * Логирует операции с хранилищем
   */
  storage(operation, key, data = null) {
    if (this.isDevelopment) {
      console.log(`[STORAGE] ${operation} ${key}`, data || '');
    }
  }

  /**
   * Логирует пользовательские действия
   */
  user(action, details = null) {
    if (this.isDevelopment) {
      console.log(`[USER] ${action}`, details || '');
    }
  }

  /**
   * Отправляет ошибку в аналитику (заглушка)
   */
  sendErrorToAnalytics(message, error) {
    // Здесь можно подключить реальную аналитику
    // Например, Google Analytics, Sentry и т.д.
    console.warn('Error would be sent to analytics:', { message, error });
  }

  /**
   * Создает группу логов
   */
  group(label, callback) {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Логирует время выполнения
   */
  time(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * Завершает логирование времени
   */
  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Создаем единственный экземпляр
export const logger = new Logger();

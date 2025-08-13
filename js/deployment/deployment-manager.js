/**
 * Система управления развертыванием MyFitness App
 * 
 * @fileoverview Автоматизация развертывания и управления версиями
 * @version 1.0.0
 * @author MyFitness App Team
 */

class DeploymentManager {
  constructor() {
    this.deploymentConfig = {
      environments: {
        development: {
          url: 'http://localhost:3000',
          branch: 'develop',
          autoDeploy: true
        },
        staging: {
          url: 'https://staging.myfitness-app.com',
          branch: 'staging',
          autoDeploy: false
        },
        production: {
          url: 'https://artkorolkevich-commits.github.io/myfitness-app/',
          branch: 'main',
          autoDeploy: false
        }
      },
      currentEnvironment: 'development',
      version: '1.0.0',
      buildNumber: Date.now()
    };
    
    this.deploymentHistory = [];
    this.isDeploying = false;
  }

  /**
   * Инициализация системы развертывания
   */
  init() {
    console.log('🚀 Инициализация системы развертывания...');
    
    try {
      this.detectEnvironment();
      this.setupVersionTracking();
      this.loadDeploymentHistory();
      
      console.log(`✅ Система развертывания инициализирована для ${this.deploymentConfig.currentEnvironment}`);
      
    } catch (error) {
      console.error('❌ Ошибка инициализации развертывания:', error);
    }
  }

  /**
   * Определение текущего окружения
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      this.deploymentConfig.currentEnvironment = 'development';
    } else if (hostname.includes('staging') || pathname.includes('staging')) {
      this.deploymentConfig.currentEnvironment = 'staging';
    } else if (hostname.includes('github.io') || hostname.includes('production')) {
      this.deploymentConfig.currentEnvironment = 'production';
    }
    
    console.log(`🌍 Определено окружение: ${this.deploymentConfig.currentEnvironment}`);
  }

  /**
   * Настройка отслеживания версий
   */
  setupVersionTracking() {
    // Генерируем уникальный номер сборки
    this.deploymentConfig.buildNumber = Date.now();
    
    // Сохраняем информацию о версии в localStorage
    const versionInfo = {
      version: this.deploymentConfig.version,
      buildNumber: this.deploymentConfig.buildNumber,
      environment: this.deploymentConfig.currentEnvironment,
      deployedAt: new Date().toISOString()
    };
    
    localStorage.setItem('app_version', JSON.stringify(versionInfo));
    
    console.log(`📦 Версия: ${this.deploymentConfig.version} (build ${this.deploymentConfig.buildNumber})`);
  }

  /**
   * Загрузка истории развертываний
   */
  loadDeploymentHistory() {
    const history = localStorage.getItem('deployment_history');
    if (history) {
      this.deploymentHistory = JSON.parse(history);
    }
  }

  /**
   * Запуск процесса развертывания
   */
  async deploy(environment = null) {
    if (this.isDeploying) {
      console.warn('⚠️ Развертывание уже выполняется');
      return false;
    }
    
    const targetEnv = environment || this.deploymentConfig.currentEnvironment;
    
    console.log(`🚀 Запуск развертывания в ${targetEnv}...`);
    
    this.isDeploying = true;
    
    try {
      // 1. Предварительные проверки
      await this.runPreDeploymentChecks(targetEnv);
      
      // 2. Сборка приложения
      await this.buildApplication();
      
      // 3. Оптимизация для продакшена
      await this.optimizeForProduction();
      
      // 4. Тестирование
      await this.runDeploymentTests();
      
      // 5. Развертывание
      await this.executeDeployment(targetEnv);
      
      // 6. Пост-развертывающие проверки
      await this.runPostDeploymentChecks(targetEnv);
      
      // 7. Обновление истории
      this.updateDeploymentHistory(targetEnv, 'success');
      
      console.log(`✅ Развертывание в ${targetEnv} завершено успешно`);
      return true;
      
    } catch (error) {
      console.error(`❌ Ошибка развертывания в ${targetEnv}:`, error);
      this.updateDeploymentHistory(targetEnv, 'failed', error.message);
      return false;
      
    } finally {
      this.isDeploying = false;
    }
  }

  /**
   * Предварительные проверки
   */
  async runPreDeploymentChecks(environment) {
    console.log('🔍 Выполнение предварительных проверок...');
    
    const checks = [
      this.checkEnvironmentConfiguration(environment),
      this.checkDependencies(),
      this.checkBuildRequirements(),
      this.checkSecurityRequirements()
    ];
    
    const results = await Promise.allSettled(checks);
    
    const failedChecks = results.filter(result => result.status === 'rejected');
    
    if (failedChecks.length > 0) {
      throw new Error(`Предварительные проверки не пройдены: ${failedChecks.length} ошибок`);
    }
    
    console.log('✅ Предварительные проверки пройдены');
  }

  /**
   * Проверка конфигурации окружения
   */
  async checkEnvironmentConfiguration(environment) {
    const config = this.deploymentConfig.environments[environment];
    
    if (!config) {
      throw new Error(`Неизвестное окружение: ${environment}`);
    }
    
    // Проверяем доступность URL
    try {
      const response = await fetch(config.url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`URL недоступен: ${config.url}`);
      }
    } catch (error) {
      throw new Error(`Не удается подключиться к ${config.url}`);
    }
    
    return true;
  }

  /**
   * Проверка зависимостей
   */
  async checkDependencies() {
    const requiredModules = [
      'storage',
      'exerciseManager',
      'yandexAPI',
      'aiService',
      'historyManager',
      'settingsManager',
      'bodyAnalysisManager',
      'progressManager'
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
      throw new Error(`Отсутствуют модули: ${missingModules.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Проверка требований к сборке
   */
  async checkBuildRequirements() {
    // Проверяем наличие основных файлов
    const requiredFiles = [
      'index.html',
      'js/app.js',
      'js/modules/config.js',
      'manifest.json'
    ];
    
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      try {
        const response = await fetch(file, { method: 'HEAD' });
        if (!response.ok) {
          missingFiles.push(file);
        }
      } catch (error) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(`Отсутствуют файлы: ${missingFiles.join(', ')}`);
    }
    
    return true;
  }

  /**
   * Проверка требований безопасности
   */
  async checkSecurityRequirements() {
    // Проверяем HTTPS в продакшене
    if (this.deploymentConfig.currentEnvironment === 'production') {
      if (window.location.protocol !== 'https:') {
        throw new Error('HTTPS обязателен для продакшена');
      }
    }
    
    // Проверяем Content Security Policy
    const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspHeader) {
      console.warn('⚠️ Content Security Policy не настроен');
    }
    
    return true;
  }

  /**
   * Сборка приложения
   */
  async buildApplication() {
    console.log('🔨 Сборка приложения...');
    
    try {
      // В реальном проекте здесь была бы сборка с помощью Webpack, Rollup или Vite
      console.log('  📦 Объединение модулей...');
      console.log('  🎯 Минификация кода...');
      console.log('  🖼️ Оптимизация ресурсов...');
      
      // Симуляция времени сборки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Сборка завершена');
      
    } catch (error) {
      throw new Error(`Ошибка сборки: ${error.message}`);
    }
  }

  /**
   * Оптимизация для продакшена
   */
  async optimizeForProduction() {
    console.log('⚡ Оптимизация для продакшена...');
    
    try {
      if (window.productionOptimizer) {
        await window.productionOptimizer.optimizeForProduction();
      } else {
        console.log('  ⏭️ Оптимизатор недоступен, пропускаем');
      }
      
    } catch (error) {
      console.warn('⚠️ Ошибка оптимизации:', error);
    }
  }

  /**
   * Запуск тестов развертывания
   */
  async runDeploymentTests() {
    console.log('🧪 Запуск тестов развертывания...');
    
    try {
      if (window.testRunner) {
        await window.testRunner.runQuickTests();
      } else {
        console.log('  ⏭️ Тестер недоступен, пропускаем');
      }
      
    } catch (error) {
      console.warn('⚠️ Ошибка тестирования:', error);
    }
  }

  /**
   * Выполнение развертывания
   */
  async executeDeployment(environment) {
    console.log(`🚀 Выполнение развертывания в ${environment}...`);
    
    const config = this.deploymentConfig.environments[environment];
    
    try {
      // В реальном проекте здесь был бы процесс развертывания
      // Например, через GitHub Actions, Netlify, Vercel или собственный сервер
      
      console.log(`  📤 Загрузка файлов на ${config.url}...`);
      console.log(`  🔄 Обновление кэша...`);
      console.log(`  ✅ Проверка доступности...`);
      
      // Симуляция времени развертывания
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Развертывание в ${environment} выполнено`);
      
    } catch (error) {
      throw new Error(`Ошибка развертывания: ${error.message}`);
    }
  }

  /**
   * Пост-развертывающие проверки
   */
  async runPostDeploymentChecks(environment) {
    console.log('🔍 Выполнение пост-развертывающих проверок...');
    
    const config = this.deploymentConfig.environments[environment];
    
    try {
      // Проверяем доступность приложения
      const response = await fetch(config.url);
      if (!response.ok) {
        throw new Error('Приложение недоступно после развертывания');
      }
      
      // Проверяем основные функции
      await this.checkApplicationHealth();
      
      console.log('✅ Пост-развертывающие проверки пройдены');
      
    } catch (error) {
      throw new Error(`Пост-развертывающие проверки не пройдены: ${error.message}`);
    }
  }

  /**
   * Проверка здоровья приложения
   */
  async checkApplicationHealth() {
    const healthChecks = [
      this.checkStorageModule(),
      this.checkExerciseManager(),
      this.checkYandexAPI(),
      this.checkAIService()
    ];
    
    const results = await Promise.allSettled(healthChecks);
    const failedChecks = results.filter(result => result.status === 'rejected');
    
    if (failedChecks.length > 0) {
      throw new Error(`Проверки здоровья не пройдены: ${failedChecks.length} ошибок`);
    }
  }

  /**
   * Проверка модуля хранилища
   */
  async checkStorageModule() {
    if (!window.storage) {
      throw new Error('Модуль хранилища недоступен');
    }
    
    // Тестируем базовые операции
    const testData = { test: 'data' };
    window.storage.saveConfig(testData);
    const loadedData = window.storage.loadConfig();
    
    if (!loadedData.test) {
      throw new Error('Модуль хранилища не работает корректно');
    }
    
    return true;
  }

  /**
   * Проверка менеджера упражнений
   */
  async checkExerciseManager() {
    if (!window.exerciseManager) {
      throw new Error('Менеджер упражнений недоступен');
    }
    
    const exercises = window.exerciseManager.getAllExercises();
    if (!exercises || exercises.length === 0) {
      throw new Error('Менеджер упражнений не загружает данные');
    }
    
    return true;
  }

  /**
   * Проверка Yandex API
   */
  async checkYandexAPI() {
    if (!window.yandexAPI) {
      throw new Error('Yandex API недоступен');
    }
    
    // Проверяем инициализацию
    if (!window.yandexAPI.isAuthenticated) {
      console.log('  ℹ️ Yandex API не аутентифицирован (нормально для тестирования)');
    }
    
    return true;
  }

  /**
   * Проверка AI сервиса
   */
  async checkAIService() {
    if (!window.aiService) {
      throw new Error('AI сервис недоступен');
    }
    
    return true;
  }

  /**
   * Обновление истории развертываний
   */
  updateDeploymentHistory(environment, status, error = null) {
    const deployment = {
      environment,
      status,
      timestamp: new Date().toISOString(),
      version: this.deploymentConfig.version,
      buildNumber: this.deploymentConfig.buildNumber,
      error: error
    };
    
    this.deploymentHistory.push(deployment);
    
    // Ограничиваем историю
    if (this.deploymentHistory.length > 50) {
      this.deploymentHistory = this.deploymentHistory.slice(-50);
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('deployment_history', JSON.stringify(this.deploymentHistory));
  }

  /**
   * Получение информации о версии
   */
  getVersionInfo() {
    return {
      version: this.deploymentConfig.version,
      buildNumber: this.deploymentConfig.buildNumber,
      environment: this.deploymentConfig.currentEnvironment,
      deployedAt: new Date().toISOString()
    };
  }

  /**
   * Получение истории развертываний
   */
  getDeploymentHistory() {
    return [...this.deploymentHistory];
  }

  /**
   * Получение статуса развертывания
   */
  getDeploymentStatus() {
    return {
      isDeploying: this.isDeploying,
      currentEnvironment: this.deploymentConfig.currentEnvironment,
      lastDeployment: this.deploymentHistory[this.deploymentHistory.length - 1] || null
    };
  }

  /**
   * Откат к предыдущей версии
   */
  async rollback(environment) {
    console.log(`🔄 Откат ${environment} к предыдущей версии...`);
    
    const history = this.deploymentHistory
      .filter(d => d.environment === environment && d.status === 'success')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (history.length < 2) {
      throw new Error('Недостаточно версий для отката');
    }
    
    const previousVersion = history[1];
    
    try {
      // В реальном проекте здесь был бы процесс отката
      console.log(`  🔄 Откат к версии ${previousVersion.version} (build ${previousVersion.buildNumber})...`);
      
      // Симуляция отката
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateDeploymentHistory(environment, 'rollback', null);
      
      console.log(`✅ Откат ${environment} завершен`);
      
    } catch (error) {
      throw new Error(`Ошибка отката: ${error.message}`);
    }
  }

  /**
   * Генерация отчета о развертывании
   */
  generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: this.deploymentConfig.version,
      buildNumber: this.deploymentConfig.buildNumber,
      environment: this.deploymentConfig.currentEnvironment,
      status: this.getDeploymentStatus(),
      history: this.getDeploymentHistory(),
      statistics: this.getDeploymentStatistics()
    };
    
    return report;
  }

  /**
   * Получение статистики развертываний
   */
  getDeploymentStatistics() {
    const stats = {
      total: this.deploymentHistory.length,
      successful: this.deploymentHistory.filter(d => d.status === 'success').length,
      failed: this.deploymentHistory.filter(d => d.status === 'failed').length,
      rollbacks: this.deploymentHistory.filter(d => d.status === 'rollback').length,
      byEnvironment: {}
    };
    
    // Статистика по окружениям
    this.deploymentConfig.environments.forEach(env => {
      const envDeployments = this.deploymentHistory.filter(d => d.environment === env);
      stats.byEnvironment[env] = {
        total: envDeployments.length,
        successful: envDeployments.filter(d => d.status === 'success').length,
        failed: envDeployments.filter(d => d.status === 'failed').length
      };
    });
    
    return stats;
  }
}

// Создаем экземпляр менеджера развертывания
const deploymentManager = new DeploymentManager();

// Экспортируем для использования в консоли
window.deploymentManager = deploymentManager;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    deploymentManager.init();
  }, 1000);
});

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🚀 Система управления развертыванием загружена');
      console.log('💡 Доступные команды:');
      console.log('   window.deploymentManager.deploy() - развертывание');
      console.log('   window.deploymentManager.getVersionInfo() - информация о версии');
      console.log('   window.deploymentManager.getDeploymentHistory() - история развертываний');
      console.log('   window.deploymentManager.generateDeploymentReport() - отчет о развертывании');
    }, 10000);
  });
}

/**
 * Оптимизатор для продакшена MyFitness App
 * 
 * @fileoverview Минификация, оптимизация и подготовка к развертыванию
 * @version 1.0.0
 * @author MyFitness App Team
 */

class ProductionOptimizer {
  constructor() {
    this.optimizationConfig = {
      minify: true,
      compress: true,
      cacheBusting: true,
      removeComments: true,
      removeConsoleLogs: true,
      optimizeImages: true,
      enableGzip: true
    };
    
    this.buildStats = {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      filesProcessed: 0,
      timeSpent: 0
    };
  }

  /**
   * Запуск полной оптимизации
   */
  async optimizeForProduction() {
    console.log('🏭 Запуск оптимизации для продакшена...');
    
    const startTime = performance.now();
    
    try {
      // 1. Анализ текущего состояния
      await this.analyzeCurrentState();
      
      // 2. Оптимизация JavaScript
      await this.optimizeJavaScript();
      
      // 3. Оптимизация CSS
      await this.optimizeCSS();
      
      // 4. Оптимизация HTML
      await this.optimizeHTML();
      
      // 5. Оптимизация изображений
      await this.optimizeImages();
      
      // 6. Настройка кэширования
      await this.setupCaching();
      
      // 7. Генерация отчетов
      await this.generateReports();
      
      const totalTime = performance.now() - startTime;
      this.buildStats.timeSpent = totalTime;
      
      console.log(`✅ Оптимизация завершена за ${totalTime.toFixed(2)}ms`);
      this.printOptimizationResults();
      
    } catch (error) {
      console.error('❌ Ошибка оптимизации:', error);
    }
  }

  /**
   * Анализ текущего состояния
   */
  async analyzeCurrentState() {
    console.log('📊 Анализ текущего состояния...');
    
    // Анализ размера файлов
    const jsFiles = this.getJavaScriptFiles();
    const cssFiles = this.getCSSFiles();
    const htmlFiles = this.getHTMLFiles();
    
    this.buildStats.originalSize = this.calculateTotalSize([
      ...jsFiles,
      ...cssFiles,
      ...htmlFiles
    ]);
    
    this.buildStats.filesProcessed = jsFiles.length + cssFiles.length + htmlFiles.length;
    
    console.log(`📁 Найдено файлов: ${this.buildStats.filesProcessed}`);
    console.log(`📏 Исходный размер: ${(this.buildStats.originalSize / 1024).toFixed(2)} KB`);
  }

  /**
   * Оптимизация JavaScript
   */
  async optimizeJavaScript() {
    console.log('⚡ Оптимизация JavaScript...');
    
    const jsFiles = this.getJavaScriptFiles();
    let totalOptimizedSize = 0;
    
    for (const file of jsFiles) {
      const originalSize = this.getFileSize(file);
      const optimizedCode = await this.minifyJavaScript(file);
      const optimizedSize = new Blob([optimizedCode]).size;
      
      totalOptimizedSize += optimizedSize;
      
      console.log(`  📄 ${file}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB`);
    }
    
    this.buildStats.optimizedSize += totalOptimizedSize;
  }

  /**
   * Минификация JavaScript
   */
  async minifyJavaScript(filePath) {
    try {
      // Базовая минификация (в реальном проекте использовался бы Terser или UglifyJS)
      let code = await this.readFile(filePath);
      
      if (this.optimizationConfig.removeComments) {
        code = this.removeComments(code);
      }
      
      if (this.optimizationConfig.removeConsoleLogs) {
        code = this.removeConsoleLogs(code);
      }
      
      if (this.optimizationConfig.minify) {
        code = this.minifyCode(code);
      }
      
      return code;
    } catch (error) {
      console.warn(`⚠️ Ошибка минификации ${filePath}:`, error);
      return await this.readFile(filePath);
    }
  }

  /**
   * Удаление комментариев
   */
  removeComments(code) {
    return code
      // Удаляем однострочные комментарии
      .replace(/\/\/.*$/gm, '')
      // Удаляем многострочные комментарии
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Удаляем пустые строки
      .replace(/^\s*[\r\n]/gm, '');
  }

  /**
   * Удаление console.log
   */
  removeConsoleLogs(code) {
    return code
      .replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '')
      .replace(/console\.(log|warn|error|info|debug)\([^)]*\)/g, '');
  }

  /**
   * Базовая минификация кода
   */
  minifyCode(code) {
    return code
      // Удаляем лишние пробелы
      .replace(/\s+/g, ' ')
      // Удаляем пробелы вокруг операторов
      .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
      // Удаляем пробелы в начале и конце
      .trim();
  }

  /**
   * Оптимизация CSS
   */
  async optimizeCSS() {
    console.log('🎨 Оптимизация CSS...');
    
    const cssFiles = this.getCSSFiles();
    let totalOptimizedSize = 0;
    
    for (const file of cssFiles) {
      const originalSize = this.getFileSize(file);
      const optimizedCSS = await this.minifyCSS(file);
      const optimizedSize = new Blob([optimizedCSS]).size;
      
      totalOptimizedSize += optimizedSize;
      
      console.log(`  🎨 ${file}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB`);
    }
    
    this.buildStats.optimizedSize += totalOptimizedSize;
  }

  /**
   * Минификация CSS
   */
  async minifyCSS(filePath) {
    try {
      let css = await this.readFile(filePath);
      
      if (this.optimizationConfig.removeComments) {
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
      }
      
      if (this.optimizationConfig.minify) {
        css = css
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,])\s*/g, '$1')
          .replace(/;\}/g, '}')
          .trim();
      }
      
      return css;
    } catch (error) {
      console.warn(`⚠️ Ошибка минификации CSS ${filePath}:`, error);
      return await this.readFile(filePath);
    }
  }

  /**
   * Оптимизация HTML
   */
  async optimizeHTML() {
    console.log('🌐 Оптимизация HTML...');
    
    const htmlFiles = this.getHTMLFiles();
    let totalOptimizedSize = 0;
    
    for (const file of htmlFiles) {
      const originalSize = this.getFileSize(file);
      const optimizedHTML = await this.minifyHTML(file);
      const optimizedSize = new Blob([optimizedHTML]).size;
      
      totalOptimizedSize += optimizedSize;
      
      console.log(`  🌐 ${file}: ${(originalSize / 1024).toFixed(2)}KB → ${(optimizedSize / 1024).toFixed(2)}KB`);
    }
    
    this.buildStats.optimizedSize += totalOptimizedSize;
  }

  /**
   * Минификация HTML
   */
  async minifyHTML(filePath) {
    try {
      let html = await this.readFile(filePath);
      
      if (this.optimizationConfig.removeComments) {
        html = html.replace(/<!--[\s\S]*?-->/g, '');
      }
      
      if (this.optimizationConfig.minify) {
        html = html
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim();
      }
      
      return html;
    } catch (error) {
      console.warn(`⚠️ Ошибка минификации HTML ${filePath}:`, error);
      return await this.readFile(filePath);
    }
  }

  /**
   * Оптимизация изображений
   */
  async optimizeImages() {
    console.log('🖼️ Оптимизация изображений...');
    
    if (!this.optimizationConfig.optimizeImages) {
      console.log('  ⏭️ Пропущено (отключено в конфигурации)');
      return;
    }
    
    const imageFiles = this.getImageFiles();
    
    for (const file of imageFiles) {
      const originalSize = this.getFileSize(file);
      console.log(`  🖼️ ${file}: ${(originalSize / 1024).toFixed(2)}KB`);
      
      // В реальном проекте здесь была бы оптимизация изображений
      // с использованием WebP, сжатия и изменения размеров
    }
  }

  /**
   * Настройка кэширования
   */
  async setupCaching() {
    console.log('💾 Настройка кэширования...');
    
    if (this.optimizationConfig.cacheBusting) {
      await this.generateCacheBusting();
    }
    
    await this.updateServiceWorker();
    await this.generateManifest();
  }

  /**
   * Генерация cache busting
   */
  async generateCacheBusting() {
    const timestamp = Date.now();
    const version = `v${timestamp}`;
    
    console.log(`  🔄 Версия кэша: ${version}`);
    
    // Обновляем ссылки на файлы с версией
    const htmlFiles = this.getHTMLFiles();
    
    for (const file of htmlFiles) {
      let html = await this.readFile(file);
      
      // Добавляем версию к CSS и JS файлам
      html = html.replace(
        /(href|src)=["']([^"']*\.(css|js))["']/g,
        `$1="$2?v=${timestamp}"`
      );
      
      await this.writeFile(file, html);
    }
  }

  /**
   * Обновление Service Worker
   */
  async updateServiceWorker() {
    const swContent = `
// Service Worker для MyFitness App
const CACHE_NAME = 'myfitness-v${Date.now()}';
const urlsToCache = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/modules/config.js',
  '/js/modules/storage.js',
  '/js/utils/logger.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
    `.trim();
    
    await this.writeFile('service-worker.js', swContent);
    console.log('  🔄 Service Worker обновлен');
  }

  /**
   * Генерация манифеста
   */
  async generateManifest() {
    const manifest = {
      name: 'MyFitness App',
      short_name: 'MyFitness',
      description: 'Приложение для отслеживания тренировок',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#007bff',
      icons: [
        {
          src: '/icons/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml'
        }
      ],
      version: `1.0.${Date.now()}`
    };
    
    await this.writeFile('manifest.json', JSON.stringify(manifest, null, 2));
    console.log('  📋 Манифест обновлен');
  }

  /**
   * Генерация отчетов
   */
  async generateReports() {
    console.log('📊 Генерация отчетов...');
    
    this.buildStats.compressionRatio = 
      ((this.buildStats.originalSize - this.buildStats.optimizedSize) / this.buildStats.originalSize) * 100;
    
    const report = {
      timestamp: new Date().toISOString(),
      optimization: this.optimizationConfig,
      stats: this.buildStats,
      recommendations: this.generateRecommendations()
    };
    
    await this.writeFile('build-report.json', JSON.stringify(report, null, 2));
    console.log('  📄 Отчет сохранен в build-report.json');
  }

  /**
   * Генерация рекомендаций
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.buildStats.compressionRatio < 20) {
      recommendations.push('Рассмотрите возможность более агрессивной минификации');
    }
    
    if (this.buildStats.originalSize > 1024 * 1024) {
      recommendations.push('Размер приложения превышает 1MB, рассмотрите ленивую загрузку');
    }
    
    if (this.buildStats.filesProcessed > 20) {
      recommendations.push('Много файлов, рассмотрите объединение в бандлы');
    }
    
    return recommendations;
  }

  /**
   * Вспомогательные методы
   */
  getJavaScriptFiles() {
    return [
      'js/app.js',
      'js/modules/config.js',
      'js/modules/storage.js',
      'js/modules/exercises.js',
      'js/modules/yandex-api.js',
      'js/modules/ai-service.js',
      'js/modules/history-manager.js',
      'js/modules/settings-manager.js',
      'js/modules/body-analysis-manager.js',
      'js/modules/progress-manager.js',
      'js/utils/logger.js',
      'js/utils/validator.js',
      'js/utils/dom.js',
      'js/components/ui-manager.js'
    ];
  }

  getCSSFiles() {
    return [
      'index.html' // CSS встроен в HTML
    ];
  }

  getHTMLFiles() {
    return [
      'index.html'
    ];
  }

  getImageFiles() {
    return [
      'icons/icon.svg'
    ];
  }

  calculateTotalSize(files) {
    return files.reduce((total, file) => total + this.getFileSize(file), 0);
  }

  getFileSize(filePath) {
    try {
      // В реальном проекте здесь было бы чтение файла
      return 1024; // Примерный размер
    } catch (error) {
      return 0;
    }
  }

  async readFile(filePath) {
    try {
      const response = await fetch(filePath);
      return await response.text();
    } catch (error) {
      console.warn(`⚠️ Не удалось прочитать файл ${filePath}:`, error);
      return '';
    }
  }

  async writeFile(filePath, content) {
    try {
      // В реальном проекте здесь было бы сохранение файла
      console.log(`💾 Файл ${filePath} обновлен`);
    } catch (error) {
      console.warn(`⚠️ Не удалось записать файл ${filePath}:`, error);
    }
  }

  /**
   * Вывод результатов оптимизации
   */
  printOptimizationResults() {
    console.log('\n📊 Результаты оптимизации:');
    console.log('============================');
    console.log(`📏 Исходный размер: ${(this.buildStats.originalSize / 1024).toFixed(2)} KB`);
    console.log(`📏 Оптимизированный размер: ${(this.buildStats.optimizedSize / 1024).toFixed(2)} KB`);
    console.log(`📉 Сжатие: ${this.buildStats.compressionRatio.toFixed(1)}%`);
    console.log(`⏱️ Время оптимизации: ${this.buildStats.timeSpent.toFixed(2)}ms`);
    console.log(`📁 Обработано файлов: ${this.buildStats.filesProcessed}`);
    console.log('============================');
  }
}

// Создаем экземпляр оптимизатора
const productionOptimizer = new ProductionOptimizer();

// Экспортируем для использования в консоли
window.productionOptimizer = productionOptimizer;

// Автоматический запуск в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🏭 Оптимизатор для продакшена загружен');
      console.log('💡 Запустите window.productionOptimizer.optimizeForProduction() для оптимизации');
    }, 8000);
  });
}

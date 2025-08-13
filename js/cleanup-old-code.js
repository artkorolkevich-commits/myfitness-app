/**
 * Скрипт для очистки старого кода из index.html
 * Этот файл содержит список функций, которые нужно удалить из index.html
 * так как они уже перенесены в модули
 */

// Список функций, которые нужно удалить из index.html
const FUNCTIONS_TO_REMOVE = [
  // Функции навигации и страниц
  'showPage',
  'loadWelcomePage',
  'loadHistoryPage',
  'loadSettingsPage',
  'loadMainPage',
  'loadBodyAnalysisPage',
  'loadProgressPage',

  // Функции истории
  'initializeHistoryPage',
  'updateStats',
  'renderWorkouts',
  'applyFilters',
  'clearFilters',
  'showDatePicker',
  'hideDatePicker',
  'updateDateRangeDisplay',
  'renderCalendar',
  'handleDateClick',
  'applyDateRange',
  'clearDateRange',

  // Функции настроек
  'initializeSettingsPage',
  'loadConfig',
  'saveConfig',
  'applyConfigToUI',
  'showStatus',
  'updateAuthStatus',
  'loginWithYandex',
  'logoutFromYandex',
  'exportData',
  'importData',
  'clearData',
  'testAiConnectionInternal',
  'testHuggingFaceToken',

  // Функции упражнений
  'initializeExerciseSelection',
  'renderExerciseGrid',
  'getFilteredExercises',
  'isExerciseSelected',
  'setupExerciseEventListeners',
  'toggleExerciseSelection',
  'addToRecentExercises',
  'renderSelectedExercises',
  'removeSelectedExercise',
  'updateSelectedCounter',
  'addSetToExercise',
  'removeSet',

  // Функции тренировок
  'addSetToAll',
  'collectCurrentEntry',
  'handleSave',
  'createSetRow',
  'addSet',
  'renumberSets',
  'ensureInitialSetsMulti',

  // Функции Yandex API
  'getOAuthUrl',
  'handleOAuthCallback',
  'getUserInfo',
  'logout',
  'generateUUID',
  'getDeviceId',
  'getWorkouts',
  'setWorkouts',
  'syncWorkoutsToYandex',
  'mergeWorkouts',
  'startAutoSyncTimer',

  // Функции анализа тела
  'setupPhotoUpload',
  'handlePhotoSelect',
  'handlePhotoFile',
  'showPhotoPreview',
  'retakePhoto',
  'analyzeBody',
  'analyzeBodyWithAI',
  'analyzeWithHuggingFace',
  'processAIResult',
  'simulateBodyAnalysis',
  'showAnalysisResults',
  'showAnalysisStatus',
  'saveAnalysis',
  'savePhotoToYandex',
  'saveAnalysisToYandex',
  'saveAnalysisToLocal',
  'loadAnalysisHistory',
  'updateProgressCharts',
  'updateChartStats',
  'calculateMonthlyChange',
  'createFatProgressChart',

  // Функции прогресса
  'populateExerciseSelect',
  'setupProgressEventListeners',
  'updateProgressDisplay',
  'getExerciseData',
  'updateProgressChart',
  'prepareChartData',

  // Функции утилит
  'getWeekNumber',
  'clearCacheAndReload',

  // IIFE функции
  'removeRearDeltSection',
  'ensureShouldersOption',
  'attachCustomExerciseHandler',
  'createExerciseBlock',
  'transformGroupsToMultiExercise',
  'initialPull'
];

// Список глобальных переменных, которые нужно удалить
const VARIABLES_TO_REMOVE = [
  'appConfig',
  'currentPage',
  'selectedExercises',
  'recentExercises',
  'currentFilters',
  'isCalendarVisible',
  'currentPhoto',
  'currentAnalysis',
  'progressChart',
  'currentExerciseData'
];

// Список обработчиков событий, которые нужно удалить
const EVENT_LISTENERS_TO_REMOVE = [
  'DOMContentLoaded',
  'click',
  'change',
  'submit',
  'input'
];

/**
 * Функция для проверки, какие функции еще остались в index.html
 */
function checkRemainingFunctions() {
  console.log('=== Проверка оставшихся функций в index.html ===');
  
  const scriptContent = document.querySelector('script:not([src])')?.textContent || '';
  
  FUNCTIONS_TO_REMOVE.forEach(funcName => {
    if (scriptContent.includes(`function ${funcName}(`)) {
      console.warn(`⚠️ Функция ${funcName} еще не удалена`);
    } else {
      console.log(`✅ Функция ${funcName} удалена или не найдена`);
    }
  });
  
  console.log('=== Конец проверки ===');
}

/**
 * Функция для проверки размера файла index.html
 */
function checkFileSize() {
  const htmlContent = document.documentElement.outerHTML;
  const sizeInKB = Math.round(htmlContent.length / 1024);
  
  console.log(`📊 Размер index.html: ${sizeInKB} KB`);
  
  if (sizeInKB > 100) {
    console.warn('⚠️ Файл index.html все еще большой, нужно больше очистки');
  } else {
    console.log('✅ Файл index.html имеет приемлемый размер');
  }
}

/**
 * Функция для подсчета строк кода в index.html
 */
function countCodeLines() {
  const scriptContent = document.querySelector('script:not([src])')?.textContent || '';
  const lines = scriptContent.split('\n').filter(line => line.trim().length > 0);
  
  console.log(`📊 Строк кода в index.html: ${lines.length}`);
  
  if (lines.length > 500) {
    console.warn('⚠️ Много строк кода в index.html, нужно больше очистки');
  } else {
    console.log('✅ Количество строк кода приемлемое');
  }
}

/**
 * Функция для анализа использования модулей
 */
function analyzeModuleUsage() {
  console.log('=== Анализ использования модулей ===');
  
  const modules = [
    'storage',
    'exerciseManager',
    'yandexAPI',
    'aiService',
    'uiManager',
    'historyManager',
    'settingsManager',
    'bodyAnalysisManager',
    'progressManager'
  ];
  
  modules.forEach(module => {
    if (window[module]) {
      console.log(`✅ Модуль ${module} доступен`);
    } else {
      console.warn(`⚠️ Модуль ${module} не найден`);
    }
  });
  
  console.log('=== Конец анализа ===');
}

// Экспортируем функции для использования в консоли
window.cleanupUtils = {
  checkRemainingFunctions,
  checkFileSize,
  countCodeLines,
  analyzeModuleUsage,
  FUNCTIONS_TO_REMOVE,
  VARIABLES_TO_REMOVE
};

// Автоматический запуск проверки в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      console.log('🧹 Запуск проверки очистки кода...');
      checkRemainingFunctions();
      checkFileSize();
      countCodeLines();
      analyzeModuleUsage();
    }, 2000);
  });
}

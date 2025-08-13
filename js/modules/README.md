# 📚 Документация модулей MyFitness App

## 🏗️ Архитектура приложения

MyFitness App построен на модульной архитектуре с четким разделением ответственности. Каждый модуль отвечает за определенную область функциональности.

## 📁 Структура модулей

```
js/
├── app.js                    # Основной файл приложения
├── modules/                  # Основные модули
│   ├── config.js            # Конфигурация приложения
│   ├── storage.js           # Управление данными
│   ├── exercises.js         # Управление упражнениями
│   ├── yandex-api.js        # Yandex.Disk API
│   ├── ai-service.js        # AI сервисы
│   ├── history-manager.js   # История тренировок
│   ├── settings-manager.js  # Настройки приложения
│   ├── body-analysis-manager.js # Анализ тела
│   └── progress-manager.js  # Прогресс тренировок
├── utils/                   # Утилиты
│   ├── logger.js            # Логирование
│   ├── validator.js         # Валидация данных
│   └── dom.js              # DOM утилиты
├── components/              # Компоненты UI
│   └── ui-manager.js        # Управление интерфейсом
├── test-modules.js          # Система тестирования
└── cleanup-old-code.js      # Утилиты очистки
```

## 🔧 Основные модули

### 1. **config.js** - Конфигурация приложения

**Назначение:** Централизованное хранение всех настроек и конфигураций приложения.

**Основные экспорты:**
- `STORAGE_KEYS` - Ключи для localStorage
- `API_CONFIG` - Настройки API (Yandex, Hugging Face)
- `DEFAULT_CONFIG` - Настройки по умолчанию
- `EXERCISE_GROUPS` - Группы упражнений
- `BODY_ANALYSIS_PROMPTS` - Промпты для AI анализа

**Пример использования:**
```javascript
import { API_CONFIG, DEFAULT_CONFIG } from './config.js';

// Использование конфигурации
const yandexUrl = API_CONFIG.YANDEX_OAUTH_URL;
const defaultSettings = DEFAULT_CONFIG;
```

### 2. **storage.js** - Управление данными

**Назначение:** Абстракция для работы с localStorage и управления данными приложения.

**Основные методы:**
- `loadConfig()` / `saveConfig()` - Конфигурация
- `loadWorkouts()` / `saveWorkouts()` - Тренировки
- `addWorkout()` - Добавление тренировки
- `loadBodyAnalyses()` / `saveBodyAnalyses()` - Анализы тела
- `exportData()` / `importData()` - Экспорт/импорт данных

**Пример использования:**
```javascript
import { storage } from './storage.js';

// Загрузка данных
const workouts = storage.loadWorkouts();
const config = storage.loadConfig();

// Сохранение данных
storage.addWorkout(newWorkout);
storage.saveConfig(updatedConfig);
```

### 3. **exercises.js** - Управление упражнениями

**Назначение:** Управление списком упражнений, их группами и выбором.

**Основные методы:**
- `getAllExercises()` - Все упражнения
- `getExercisesByGroup(group)` - Упражнения по группе
- `searchExercises(query)` - Поиск упражнений
- `selectExercise()` / `deselectExercise()` - Выбор упражнений
- `getSelectedExercises()` - Выбранные упражнения

**Пример использования:**
```javascript
import { exerciseManager } from './exercises.js';

// Получение упражнений
const chestExercises = exerciseManager.getExercisesByGroup('Грудь');
const searchResults = exerciseManager.searchExercises('жим');

// Выбор упражнений
exerciseManager.selectExercise('Жим лежа');
const selected = exerciseManager.getSelectedExercises();
```

### 4. **yandex-api.js** - Yandex.Disk API

**Назначение:** Интеграция с Yandex.Disk для синхронизации данных.

**Основные методы:**
- `init(token)` - Инициализация с токеном
- `getOAuthUrl()` - URL для OAuth авторизации
- `uploadFile(path, data, mimeType)` - Загрузка файлов
- `downloadFile(path)` - Скачивание файлов
- `syncData()` - Синхронизация данных
- `mergeData()` - Слияние данных

**Пример использования:**
```javascript
import { yandexAPI } from './yandex-api.js';

// Инициализация
yandexAPI.init(accessToken);

// Синхронизация
await yandexAPI.syncData();

// Загрузка файла
await yandexAPI.uploadFile('/MyFitness/workouts.json', data);
```

### 5. **ai-service.js** - AI сервисы

**Назначение:** Интеграция с AI сервисами для анализа тела.

**Основные методы:**
- `init(apiKey)` - Инициализация с API ключом
- `analyzeBodyWithAI(photo)` - AI анализ фото
- `testHuggingFaceConnection()` - Тест подключения
- `processAIResult(result)` - Обработка результатов

**Пример использования:**
```javascript
import { aiService } from './ai-service.js';

// Инициализация
aiService.init(huggingFaceApiKey);

// Анализ фото
const analysis = await aiService.analyzeBodyWithAI(photoData);
```

### 6. **history-manager.js** - История тренировок

**Назначение:** Управление отображением истории тренировок и фильтрацией.

**Основные методы:**
- `init()` - Инициализация
- `loadHistoryData()` - Загрузка данных истории
- `renderWorkouts(workouts)` - Рендеринг тренировок
- `filterWorkouts()` - Фильтрация
- `showDatePicker()` / `hideDatePicker()` - Календарь

**Пример использования:**
```javascript
import { historyManager } from './history-manager.js';

// Инициализация
historyManager.init();

// Загрузка и отображение
const workouts = historyManager.loadHistoryData();
historyManager.renderWorkouts(workouts);
```

### 7. **settings-manager.js** - Настройки приложения

**Назначение:** Управление настройками приложения и сервисов.

**Основные методы:**
- `init()` - Инициализация
- `saveSettings()` - Сохранение настроек
- `loginWithYandex()` / `logoutFromYandex()` - OAuth
- `exportData()` / `importData()` - Экспорт/импорт
- `testHuggingFaceConnection()` - Тест AI

**Пример использования:**
```javascript
import { settingsManager } from './settings-manager.js';

// Инициализация
settingsManager.init();

// Сохранение настроек
settingsManager.saveSettings(newSettings);

// OAuth авторизация
settingsManager.loginWithYandex();
```

### 8. **body-analysis-manager.js** - Анализ тела

**Назначение:** Управление анализом тела с помощью фото и AI.

**Основные методы:**
- `init()` - Инициализация
- `handlePhotoFile(file)` - Обработка фото
- `analyzeBody()` - Анализ тела
- `saveAnalysis()` - Сохранение результатов
- `updateProgressCharts()` - Обновление графиков

**Пример использования:**
```javascript
import { bodyAnalysisManager } from './body-analysis-manager.js';

// Инициализация
bodyAnalysisManager.init();

// Анализ фото
bodyAnalysisManager.handlePhotoFile(photoFile);
await bodyAnalysisManager.analyzeBody();
```

### 9. **progress-manager.js** - Прогресс тренировок

**Назначение:** Управление отображением прогресса по упражнениям.

**Основные методы:**
- `init()` - Инициализация
- `populateExerciseSelect()` - Заполнение списка упражнений
- `updateProgressDisplay()` - Обновление отображения
- `updateProgressChart(data, chartType)` - Обновление графиков
- `getExerciseData(exerciseName, period)` - Получение данных

**Пример использования:**
```javascript
import { progressManager } from './progress-manager.js';

// Инициализация
progressManager.init();

// Обновление прогресса
progressManager.updateProgressDisplay();
```

## 🛠️ Утилиты

### 1. **logger.js** - Логирование

**Назначение:** Централизованное логирование с уровнями и форматированием.

**Основные методы:**
- `info(message, data)` - Информационные сообщения
- `warn(message, error)` - Предупреждения
- `error(message, error)` - Ошибки
- `debug(message, data)` - Отладочная информация
- `success(message, data)` - Успешные операции

**Пример использования:**
```javascript
import { logger } from './utils/logger.js';

logger.info('Приложение запущено');
logger.error('Ошибка загрузки данных', error);
```

### 2. **validator.js** - Валидация данных

**Назначение:** Валидация различных типов данных.

**Основные методы:**
- `validateWorkout(workout)` - Валидация тренировки
- `validateExercise(exercise)` - Валидация упражнения
- `validateImageFile(file)` - Валидация изображения
- `validateHuggingFaceApiKey(apiKey)` - Валидация API ключа

**Пример использования:**
```javascript
import { validator } from './utils/validator.js';

const validation = validator.validateWorkout(workoutData);
if (!validation.isValid) {
  console.error('Ошибки валидации:', validation.errors);
}
```

### 3. **dom.js** - DOM утилиты

**Назначение:** Безопасная работа с DOM элементами.

**Основные методы:**
- `getElement(id)` - Получение элемента по ID
- `getElements(selector)` - Получение элементов по селектору
- `setContent(element, content, type)` - Установка содержимого
- `createElement(tag, attributes, content)` - Создание элемента
- `toggleElement(element, show)` - Показать/скрыть элемент

**Пример использования:**
```javascript
import { dom } from './utils/dom.js';

const element = dom.getElement('myElement');
dom.setContent(element, 'Новый текст');
dom.toggleElement(element, true);
```

## 🧪 Тестирование

### **test-modules.js** - Система тестирования

**Назначение:** Автоматическое тестирование модулей.

**Основные возможности:**
- Тестирование всех модулей
- Проверка основных функций
- Валидация данных
- Тестирование API интеграций

**Запуск тестов:**
```javascript
// В консоли браузера
window.moduleTester.runAllTests();
```

## 🧹 Очистка кода

### **cleanup-old-code.js** - Утилиты очистки

**Назначение:** Помощь в очистке старого кода из index.html.

**Основные функции:**
- `checkRemainingFunctions()` - Проверка оставшихся функций
- `checkFileSize()` - Проверка размера файла
- `countCodeLines()` - Подсчет строк кода
- `analyzeModuleUsage()` - Анализ использования модулей

**Запуск проверки:**
```javascript
// В консоли браузера
window.cleanupUtils.checkRemainingFunctions();
```

## 🔄 Жизненный цикл модуля

### 1. **Инициализация**
```javascript
// В app.js
import { moduleName } from './modules/module-name.js';

// В initServices()
moduleName.init();
```

### 2. **Использование**
```javascript
// Вызов методов модуля
moduleName.someMethod(params);
```

### 3. **Очистка**
```javascript
// При необходимости
moduleName.cleanup();
```

## 📋 Лучшие практики

### 1. **Импорты**
```javascript
// ✅ Правильно - именованные импорты
import { storage, logger } from './modules/storage.js';

// ❌ Неправильно - импорт всего модуля
import * as storage from './modules/storage.js';
```

### 2. **Обработка ошибок**
```javascript
try {
  const result = await moduleName.someAsyncMethod();
  logger.success('Операция выполнена', result);
} catch (error) {
  logger.error('Ошибка операции', error);
}
```

### 3. **Валидация данных**
```javascript
const validation = validator.validateData(data);
if (!validation.isValid) {
  logger.warn('Данные не прошли валидацию', validation.errors);
  return;
}
```

### 4. **Логирование**
```javascript
logger.info('Начало операции');
// ... код операции ...
logger.success('Операция завершена');
```

## 🚀 Расширение функциональности

### Добавление нового модуля:

1. **Создать файл** `js/modules/new-module.js`
2. **Определить класс** с методами
3. **Экспортировать** экземпляр
4. **Импортировать** в `app.js`
5. **Инициализировать** в `initServices()`

### Пример нового модуля:
```javascript
// js/modules/new-module.js
import { logger } from '../utils/logger.js';

class NewModule {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    logger.info('Initializing new module...');
    this.isInitialized = true;
    logger.success('New module initialized');
  }

  someMethod() {
    // Логика модуля
  }
}

export const newModule = new NewModule();
```

## 📞 Поддержка

При возникновении проблем с модулями:

1. **Проверьте консоль** браузера на ошибки
2. **Запустите тесты** модулей
3. **Проверьте логи** приложения
4. **Убедитесь** в правильности импортов

---

**Версия документации:** 1.0  
**Последнее обновление:** 2025-01-15  
**Автор:** MyFitness App Team

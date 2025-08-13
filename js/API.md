# 🔌 API Документация MyFitness App

## 📋 Обзор

API MyFitness App предоставляет полный набор методов для работы с тренировками, упражнениями, анализом тела и синхронизацией данных.

## 🏗️ Архитектура API

Все модули следуют единому паттерну:
- **Инициализация**: `init()` метод
- **Основные операции**: CRUD операции
- **Валидация**: Встроенная валидация данных
- **Логирование**: Автоматическое логирование операций
- **Обработка ошибок**: Try-catch блоки с детальными сообщениями

## 📦 Модули API

### 1. **Storage API** (`storage.js`)

#### Инициализация
```javascript
import { storage } from './modules/storage.js';
```

#### Методы

##### `loadConfig()`
Загружает конфигурацию приложения из localStorage.

**Возвращает:** `Object` - Конфигурация приложения

**Пример:**
```javascript
const config = storage.loadConfig();
console.log(config.yandexToken);
```

##### `saveConfig(config)`
Сохраняет конфигурацию приложения в localStorage.

**Параметры:**
- `config` (Object) - Конфигурация для сохранения

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
const newConfig = { yandexToken: 'token123', autoSync: true };
storage.saveConfig(newConfig);
```

##### `loadWorkouts()`
Загружает все тренировки из localStorage.

**Возвращает:** `Array` - Массив тренировок

**Пример:**
```javascript
const workouts = storage.loadWorkouts();
console.log(`Загружено ${workouts.length} тренировок`);
```

##### `saveWorkouts(workouts)`
Сохраняет массив тренировок в localStorage.

**Параметры:**
- `workouts` (Array) - Массив тренировок

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
const workouts = [workout1, workout2, workout3];
storage.saveWorkouts(workouts);
```

##### `addWorkout(workout)`
Добавляет новую тренировку к существующим.

**Параметры:**
- `workout` (Object) - Объект тренировки

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
const newWorkout = {
  id: 'workout-123',
  date: new Date().toISOString(),
  exercises: [...]
};
storage.addWorkout(newWorkout);
```

##### `exportData()`
Экспортирует все данные приложения в JSON.

**Возвращает:** `Object` - Объект с данными для экспорта

**Пример:**
```javascript
const exportData = storage.exportData();
const jsonString = JSON.stringify(exportData);
```

##### `importData(jsonData)`
Импортирует данные из JSON.

**Параметры:**
- `jsonData` (Object) - Данные для импорта

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
const importedData = JSON.parse(jsonString);
storage.importData(importedData);
```

### 2. **Exercise Manager API** (`exercises.js`)

#### Инициализация
```javascript
import { exerciseManager } from './modules/exercises.js';
```

#### Методы

##### `getAllExercises()`
Возвращает все доступные упражнения.

**Возвращает:** `Array` - Массив всех упражнений

**Пример:**
```javascript
const allExercises = exerciseManager.getAllExercises();
console.log(`Всего упражнений: ${allExercises.length}`);
```

##### `getExercisesByGroup(group)`
Возвращает упражнения определенной группы.

**Параметры:**
- `group` (string) - Название группы мышц

**Возвращает:** `Array` - Массив упражнений группы

**Пример:**
```javascript
const chestExercises = exerciseManager.getExercisesByGroup('Грудь');
console.log('Упражнения для груди:', chestExercises);
```

##### `searchExercises(query)`
Поиск упражнений по названию.

**Параметры:**
- `query` (string) - Поисковый запрос

**Возвращает:** `Array` - Массив найденных упражнений

**Пример:**
```javascript
const results = exerciseManager.searchExercises('жим');
console.log('Найденные упражнения:', results);
```

##### `selectExercise(exerciseName)`
Выбирает упражнение для тренировки.

**Параметры:**
- `exerciseName` (string) - Название упражнения

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
exerciseManager.selectExercise('Жим лежа');
```

##### `deselectExercise(exerciseName)`
Отменяет выбор упражнения.

**Параметры:**
- `exerciseName` (string) - Название упражнения

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
exerciseManager.deselectExercise('Жим лежа');
```

##### `getSelectedExercises()`
Возвращает выбранные упражнения.

**Возвращает:** `Array` - Массив выбранных упражнений

**Пример:**
```javascript
const selected = exerciseManager.getSelectedExercises();
console.log('Выбранные упражнения:', selected);
```

##### `getSelectedCount()`
Возвращает количество выбранных упражнений.

**Возвращает:** `number` - Количество выбранных упражнений

**Пример:**
```javascript
const count = exerciseManager.getSelectedCount();
console.log(`Выбрано упражнений: ${count}`);
```

### 3. **Yandex API** (`yandex-api.js`)

#### Инициализация
```javascript
import { yandexAPI } from './modules/yandex-api.js';
```

#### Методы

##### `init(token)`
Инициализирует API с токеном доступа.

**Параметры:**
- `token` (string) - OAuth токен Yandex

**Возвращает:** `void`

**Пример:**
```javascript
yandexAPI.init('your-yandex-token');
```

##### `getOAuthUrl()`
Возвращает URL для OAuth авторизации.

**Возвращает:** `string` - URL для авторизации

**Пример:**
```javascript
const authUrl = yandexAPI.getOAuthUrl();
window.open(authUrl, '_blank');
```

##### `handleOAuthCallback()`
Обрабатывает callback от OAuth авторизации.

**Возвращает:** `Promise<string>` - Токен доступа

**Пример:**
```javascript
const token = await yandexAPI.handleOAuthCallback();
yandexAPI.init(token);
```

##### `getUserInfo()`
Получает информацию о пользователе.

**Возвращает:** `Promise<Object>` - Информация о пользователе

**Пример:**
```javascript
const userInfo = await yandexAPI.getUserInfo();
console.log('Пользователь:', userInfo.display_name);
```

##### `uploadFile(path, data, mimeType)`
Загружает файл в Yandex.Disk.

**Параметры:**
- `path` (string) - Путь к файлу на диске
- `data` (Blob|string) - Данные файла
- `mimeType` (string) - MIME тип файла

**Возвращает:** `Promise<Object>` - Результат загрузки

**Пример:**
```javascript
const fileData = JSON.stringify(workouts);
await yandexAPI.uploadFile('/MyFitness/workouts.json', fileData, 'application/json');
```

##### `downloadFile(path)`
Скачивает файл с Yandex.Disk.

**Параметры:**
- `path` (string) - Путь к файлу на диске

**Возвращает:** `Promise<Object>` - Данные файла

**Пример:**
```javascript
const fileData = await yandexAPI.downloadFile('/MyFitness/workouts.json');
const workouts = JSON.parse(fileData);
```

##### `syncData()`
Синхронизирует данные с Yandex.Disk.

**Возвращает:** `Promise<Object>` - Результат синхронизации

**Пример:**
```javascript
const syncResult = await yandexAPI.syncData();
console.log('Синхронизация завершена:', syncResult);
```

### 4. **AI Service API** (`ai-service.js`)

#### Инициализация
```javascript
import { aiService } from './modules/ai-service.js';
```

#### Методы

##### `init(apiKey)`
Инициализирует AI сервис с API ключом.

**Параметры:**
- `apiKey` (string) - API ключ Hugging Face

**Возвращает:** `void`

**Пример:**
```javascript
aiService.init('your-huggingface-api-key');
```

##### `testHuggingFaceConnection()`
Тестирует подключение к Hugging Face API.

**Возвращает:** `Promise<Object>` - Результат теста

**Пример:**
```javascript
const testResult = await aiService.testHuggingFaceConnection();
console.log('Тест подключения:', testResult);
```

##### `analyzeBodyWithAI(photo)`
Анализирует фото тела с помощью AI.

**Параметры:**
- `photo` (string) - Base64 изображение

**Возвращает:** `Promise<Object>` - Результат анализа

**Пример:**
```javascript
const analysis = await aiService.analyzeBodyWithAI(photoData);
console.log('Процент жира:', analysis.bodyFatPercentage);
```

### 5. **History Manager API** (`history-manager.js`)

#### Инициализация
```javascript
import { historyManager } from './modules/history-manager.js';
```

#### Методы

##### `init()`
Инициализирует менеджер истории.

**Возвращает:** `void`

**Пример:**
```javascript
historyManager.init();
```

##### `loadHistoryData()`
Загружает данные истории тренировок.

**Возвращает:** `Object` - Данные истории

**Пример:**
```javascript
const historyData = historyManager.loadHistoryData();
console.log('История загружена:', historyData);
```

##### `renderWorkouts(workouts)`
Рендерит список тренировок.

**Параметры:**
- `workouts` (Array) - Массив тренировок

**Возвращает:** `void`

**Пример:**
```javascript
historyManager.renderWorkouts(workouts);
```

##### `filterWorkouts()`
Применяет фильтры к тренировкам.

**Возвращает:** `Array` - Отфильтрованные тренировки

**Пример:**
```javascript
const filtered = historyManager.filterWorkouts();
```

### 6. **Settings Manager API** (`settings-manager.js`)

#### Инициализация
```javascript
import { settingsManager } from './modules/settings-manager.js';
```

#### Методы

##### `init()`
Инициализирует менеджер настроек.

**Возвращает:** `void`

**Пример:**
```javascript
settingsManager.init();
```

##### `saveSettings(settings)`
Сохраняет настройки приложения.

**Параметры:**
- `settings` (Object) - Настройки для сохранения

**Возвращает:** `boolean` - Успешность операции

**Пример:**
```javascript
const settings = { theme: 'dark', autoSync: true };
settingsManager.saveSettings(settings);
```

##### `loginWithYandex()`
Выполняет вход через Yandex OAuth.

**Возвращает:** `Promise<void>`

**Пример:**
```javascript
await settingsManager.loginWithYandex();
```

##### `logoutFromYandex()`
Выполняет выход из Yandex.

**Возвращает:** `void`

**Пример:**
```javascript
settingsManager.logoutFromYandex();
```

### 7. **Body Analysis Manager API** (`body-analysis-manager.js`)

#### Инициализация
```javascript
import { bodyAnalysisManager } from './modules/body-analysis-manager.js';
```

#### Методы

##### `init()`
Инициализирует менеджер анализа тела.

**Возвращает:** `void`

**Пример:**
```javascript
bodyAnalysisManager.init();
```

##### `handlePhotoFile(file)`
Обрабатывает загруженное фото.

**Параметры:**
- `file` (File) - Файл изображения

**Возвращает:** `void`

**Пример:**
```javascript
const fileInput = document.getElementById('photoInput');
bodyAnalysisManager.handlePhotoFile(fileInput.files[0]);
```

##### `analyzeBody()`
Выполняет анализ тела.

**Возвращает:** `Promise<Object>` - Результат анализа

**Пример:**
```javascript
const analysis = await bodyAnalysisManager.analyzeBody();
console.log('Анализ завершен:', analysis);
```

##### `saveAnalysis()`
Сохраняет результаты анализа.

**Возвращает:** `Promise<void>`

**Пример:**
```javascript
await bodyAnalysisManager.saveAnalysis();
```

### 8. **Progress Manager API** (`progress-manager.js`)

#### Инициализация
```javascript
import { progressManager } from './modules/progress-manager.js';
```

#### Методы

##### `init()`
Инициализирует менеджер прогресса.

**Возвращает:** `void`

**Пример:**
```javascript
progressManager.init();
```

##### `populateExerciseSelect()`
Заполняет список упражнений для выбора.

**Возвращает:** `void`

**Пример:**
```javascript
progressManager.populateExerciseSelect();
```

##### `updateProgressDisplay()`
Обновляет отображение прогресса.

**Возвращает:** `void`

**Пример:**
```javascript
progressManager.updateProgressDisplay();
```

##### `getExerciseData(exerciseName, period)`
Получает данные упражнения за период.

**Параметры:**
- `exerciseName` (string) - Название упражнения
- `period` (string) - Период ('week', 'month', 'quarter', 'year', 'all')

**Возвращает:** `Array` - Данные упражнения

**Пример:**
```javascript
const data = progressManager.getExerciseData('Жим лежа', 'month');
console.log('Данные за месяц:', data);
```

## 🛠️ Утилиты API

### 1. **Logger API** (`logger.js`)

#### Инициализация
```javascript
import { logger } from './utils/logger.js';
```

#### Методы

##### `info(message, data)`
Логирует информационное сообщение.

**Параметры:**
- `message` (string) - Сообщение
- `data` (any) - Дополнительные данные

**Пример:**
```javascript
logger.info('Приложение запущено', { version: '1.0.0' });
```

##### `success(message, data)`
Логирует успешную операцию.

**Параметры:**
- `message` (string) - Сообщение
- `data` (any) - Дополнительные данные

**Пример:**
```javascript
logger.success('Тренировка сохранена', { workoutId: '123' });
```

##### `warn(message, error)`
Логирует предупреждение.

**Параметры:**
- `message` (string) - Сообщение
- `error` (Error) - Ошибка

**Пример:**
```javascript
logger.warn('Медленное соединение', error);
```

##### `error(message, error)`
Логирует ошибку.

**Параметры:**
- `message` (string) - Сообщение
- `error` (Error) - Ошибка

**Пример:**
```javascript
logger.error('Ошибка загрузки данных', error);
```

### 2. **Validator API** (`validator.js`)

#### Инициализация
```javascript
import { validator } from './utils/validator.js';
```

#### Методы

##### `validateWorkout(workout)`
Валидирует объект тренировки.

**Параметры:**
- `workout` (Object) - Объект тренировки

**Возвращает:** `Object` - Результат валидации

**Пример:**
```javascript
const validation = validator.validateWorkout(workoutData);
if (!validation.isValid) {
  console.error('Ошибки валидации:', validation.errors);
}
```

##### `validateExercise(exercise)`
Валидирует объект упражнения.

**Параметры:**
- `exercise` (Object) - Объект упражнения

**Возвращает:** `Object` - Результат валидации

**Пример:**
```javascript
const validation = validator.validateExercise(exerciseData);
```

##### `validateImageFile(file)`
Валидирует файл изображения.

**Параметры:**
- `file` (File) - Файл изображения

**Возвращает:** `Object` - Результат валидации

**Пример:**
```javascript
const validation = validator.validateImageFile(file);
if (!validation.isValid) {
  alert(validation.error);
}
```

### 3. **DOM API** (`dom.js`)

#### Инициализация
```javascript
import { dom } from './utils/dom.js';
```

#### Методы

##### `getElement(id)`
Получает элемент по ID.

**Параметры:**
- `id` (string) - ID элемента

**Возвращает:** `HTMLElement|null` - Элемент или null

**Пример:**
```javascript
const element = dom.getElement('myElement');
if (element) {
  dom.setContent(element, 'Новый текст');
}
```

##### `getElements(selector)`
Получает элементы по селектору.

**Параметры:**
- `selector` (string) - CSS селектор

**Возвращает:** `NodeList` - Список элементов

**Пример:**
```javascript
const buttons = dom.getElements('.btn');
buttons.forEach(btn => btn.addEventListener('click', handler));
```

##### `setContent(element, content, type)`
Устанавливает содержимое элемента.

**Параметры:**
- `element` (HTMLElement) - Элемент
- `content` (string) - Содержимое
- `type` (string) - Тип содержимого ('text', 'html')

**Возвращает:** `void`

**Пример:**
```javascript
dom.setContent(element, 'Новый текст', 'text');
dom.setContent(element, '<strong>HTML</strong>', 'html');
```

##### `createElement(tag, attributes, content)`
Создает новый элемент.

**Параметры:**
- `tag` (string) - HTML тег
- `attributes` (Object) - Атрибуты элемента
- `content` (string) - Содержимое элемента

**Возвращает:** `HTMLElement` - Созданный элемент

**Пример:**
```javascript
const button = dom.createElement('button', {
  className: 'btn btn-primary',
  id: 'saveBtn'
}, 'Сохранить');
```

## 🔄 Обработка ошибок

Все API методы используют единый подход к обработке ошибок:

```javascript
try {
  const result = await someApiMethod();
  logger.success('Операция выполнена', result);
} catch (error) {
  logger.error('Ошибка операции', error);
  // Показать пользователю сообщение об ошибке
}
```

## 📊 Типы данных

### Workout Object
```javascript
{
  id: string,           // Уникальный ID тренировки
  date: string,         // Дата в ISO формате
  exercises: [          // Массив упражнений
    {
      exercise: string, // Название упражнения
      sets: [           // Массив подходов
        {
          weight: number, // Вес в кг
          reps: number    // Количество повторений
        }
      ]
    }
  ]
}
```

### Exercise Object
```javascript
{
  name: string,         // Название упражнения
  group: string,        // Группа мышц
  description: string   // Описание упражнения
}
```

### Config Object
```javascript
{
  yandexToken: string,      // Токен Yandex.Disk
  yandexPath: string,       // Путь к файлам на диске
  autoSync: boolean,        // Автосинхронизация
  syncInterval: number,     // Интервал синхронизации (мин)
  theme: string,           // Тема приложения
  huggingFaceApiKey: string // API ключ Hugging Face
}
```

## 🚀 Быстрый старт

```javascript
// 1. Импорт модулей
import { storage } from './modules/storage.js';
import { exerciseManager } from './modules/exercises.js';
import { logger } from './utils/logger.js';

// 2. Инициализация
logger.info('Запуск приложения');

// 3. Загрузка данных
const workouts = storage.loadWorkouts();
const exercises = exerciseManager.getAllExercises();

// 4. Создание тренировки
const newWorkout = {
  id: `workout-${Date.now()}`,
  date: new Date().toISOString(),
  exercises: [
    {
      exercise: 'Жим лежа',
      sets: [{ weight: 80, reps: 8 }]
    }
  ]
};

// 5. Сохранение
storage.addWorkout(newWorkout);
logger.success('Тренировка создана');
```

---

**Версия API:** 1.0.0  
**Последнее обновление:** 2025-01-15  
**Автор:** MyFitness App Team

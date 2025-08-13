/**
 * Конфигурация приложения MyFitness
 * Централизованное хранение всех настроек и конфигураций
 * 
 * @module config
 * @version 1.0.0
 * @author MyFitness App Team
 * @description Основной конфигурационный файл приложения, содержащий все настройки,
 * API ключи, константы и параметры по умолчанию
 */

/**
 * Ключи для localStorage
 * @type {Object.<string, string>}
 * @description Ключи для хранения данных в localStorage браузера
 */
export const STORAGE_KEYS = {
  CONFIG: 'myfitness_config',
  WORKOUTS: 'workouts',
  RECENT_EXERCISES: 'recentExercises',
  BODY_ANALYSES: 'bodyAnalyses',
  DEVICE_ID: 'device_id'
};

/**
 * API конфигурация
 * @type {Object.<string, string>}
 * @description Настройки для внешних API (Yandex.Disk, Hugging Face)
 */
export const API_CONFIG = {
  YANDEX_OAUTH_URL: 'https://oauth.yandex.ru/authorize',
  YANDEX_DISK_API: 'https://cloud-api.yandex.net/v1/disk',
  HUGGING_FACE_BASE_URL: 'https://api-inference.huggingface.co/models/',
  CLIENT_ID: '07ca787a8f60406eab80bce2c2cf80c4',
  AI_MODEL: 'microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224'
};

/**
 * Настройки по умолчанию
 * @type {Object}
 * @description Конфигурация приложения по умолчанию
 */
export const DEFAULT_CONFIG = {
  yandexToken: '',
  yandexPath: '/MyFitness/workouts.json',
  autoSync: true,
  syncInterval: 15,
  defaultCycle: 1,
  theme: 'dark',
  userInfo: null,
  huggingFaceApiKey: '',
  aiModel: 'microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224'
};

// Промпты для AI анализа
export const BODY_ANALYSIS_PROMPTS = [
  'body fat percentage estimation',
  'body composition analysis',
  'fitness level assessment',
  'muscle mass evaluation',
  'overall body health'
];

// Группы упражнений
export const EXERCISE_GROUPS = [
  { id: 'chest', name: 'Грудь' },
  { id: 'back', name: 'Спина' },
  { id: 'legs', name: 'Ноги' },
  { id: 'shoulders', name: 'Плечи' },
  { id: 'biceps', name: 'Бицепс' },
  { id: 'triceps', name: 'Трицепс' }
];

// Максимальное количество упражнений в тренировке
export const MAX_EXERCISES_PER_WORKOUT = 8;

// Настройки кэша
export const CACHE_CONFIG = {
  NAME: 'myfitness-v5',
  VERSION: '5.0.0'
};

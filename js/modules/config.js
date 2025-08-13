/**
 * Конфигурация приложения MyFitness
 */

// Ключи для localStorage
export const STORAGE_KEYS = {
  CONFIG: 'myfitness_config',
  WORKOUTS: 'workouts',
  RECENT_EXERCISES: 'recentExercises',
  BODY_ANALYSES: 'bodyAnalyses',
  DEVICE_ID: 'device_id'
};

// API конфигурация
export const API_CONFIG = {
  YANDEX_OAUTH_URL: 'https://oauth.yandex.ru/authorize',
  YANDEX_DISK_API: 'https://cloud-api.yandex.net/v1/disk',
  HUGGING_FACE_BASE_URL: 'https://api-inference.huggingface.co/models/',
  CLIENT_ID: '07ca787a8f60406eab80bce2c2cf80c4',
  AI_MODEL: 'microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224'
};

// Настройки по умолчанию
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

/**
 * Модуль для работы с Yandex.Disk API
 */

import { logger } from '../utils/logger.js';
import { API_CONFIG } from './config.js';

class YandexAPI {
  constructor() {
    this.token = null;
    this.userInfo = null;
    this.isAuthenticated = false;
  }

  /**
   * Инициализация с токеном
   */
  init(token) {
    this.token = token;
    this.isAuthenticated = !!token;
    logger.info('YandexAPI initialized with token');
  }

  /**
   * Получить URL для OAuth авторизации
   */
  getOAuthUrl() {
    const params = new URLSearchParams({
      response_type: 'token',
      client_id: API_CONFIG.CLIENT_ID,
      redirect_uri: window.location.origin + window.location.pathname
    });

    return `${API_CONFIG.YANDEX_OAUTH_URL}?${params.toString()}`;
  }

  /**
   * Обработка OAuth callback
   */
  handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      this.token = accessToken;
      this.isAuthenticated = true;
      
      // Очищаем URL от токена
      window.history.replaceState({}, document.title, window.location.pathname);
      
      logger.success('OAuth authentication successful');
      return { success: true, token: accessToken };
    }

    return { success: false, error: 'No access token found' };
  }

  /**
   * Получить информацию о пользователе
   */
  async getUserInfo() {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.api('GET', 'Yandex user info');
      
      const response = await fetch('https://login.yandex.ru/info', {
        headers: {
          'Authorization': `OAuth ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userInfo = await response.json();
      this.userInfo = userInfo;
      
      logger.success('User info retrieved:', userInfo);
      return userInfo;
    } catch (error) {
      logger.error('Failed to get user info:', error);
      throw error;
    }
  }

  /**
   * Получить информацию о диске
   */
  async getDiskInfo() {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.api('GET', 'Yandex disk info');
      
      const response = await fetch(`${API_CONFIG.YANDEX_DISK_API}/resources`, {
        headers: {
          'Authorization': `OAuth ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const diskInfo = await response.json();
      logger.success('Disk info retrieved');
      return diskInfo;
    } catch (error) {
      logger.error('Failed to get disk info:', error);
      throw error;
    }
  }

  /**
   * Создать папку
   */
  async createFolder(path) {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.api('PUT', `Create folder: ${path}`);
      
      const response = await fetch(`${API_CONFIG.YANDEX_DISK_API}/resources?path=${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `OAuth ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: path
        })
      });

      if (response.status === 409) {
        // Папка уже существует
        logger.info('Folder already exists:', path);
        return { success: true, exists: true };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.success('Folder created:', path);
      return { success: true, exists: false };
    } catch (error) {
      logger.error('Failed to create folder:', error);
      throw error;
    }
  }

  /**
   * Загрузить файл
   */
  async uploadFile(path, data, contentType = 'application/json') {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.api('PUT', `Upload file: ${path}`);
      
      // Сначала получаем URL для загрузки
      const uploadUrlResponse = await fetch(`${API_CONFIG.YANDEX_DISK_API}/resources/upload?path=${encodeURIComponent(path)}&overwrite=true`, {
        headers: {
          'Authorization': `OAuth ${this.token}`
        }
      });

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: HTTP ${uploadUrlResponse.status}`);
      }

      const uploadInfo = await uploadUrlResponse.json();
      
      if (!uploadInfo.href) {
        throw new Error('No upload URL received');
      }

      // Загружаем файл
      const uploadResponse = await fetch(uploadInfo.href, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType
        },
        body: data
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: HTTP ${uploadResponse.status}`);
      }

      logger.success('File uploaded successfully:', path);
      return { success: true };
    } catch (error) {
      logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Скачать файл
   */
  async downloadFile(path) {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.api('GET', `Download file: ${path}`);
      
      const response = await fetch(`${API_CONFIG.YANDEX_DISK_API}/resources/download?path=${encodeURIComponent(path)}`, {
        headers: {
          'Authorization': `OAuth ${this.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn('File not found:', path);
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const downloadInfo = await response.json();
      
      if (!downloadInfo.href) {
        throw new Error('No download URL received');
      }

      // Скачиваем файл
      const fileResponse = await fetch(downloadInfo.href);
      
      if (!fileResponse.ok) {
        throw new Error(`File download failed: HTTP ${fileResponse.status}`);
      }

      const fileData = await fileResponse.json();
      logger.success('File downloaded successfully:', path);
      return fileData;
    } catch (error) {
      logger.error('Failed to download file:', error);
      throw error;
    }
  }

  /**
   * Синхронизировать данные
   */
  async syncData(localData, remotePath) {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.info('Starting data synchronization...');
      
      // Создаем папку если нужно
      const folderPath = remotePath.substring(0, remotePath.lastIndexOf('/'));
      await this.createFolder(folderPath);

      // Загружаем данные на диск
      const jsonData = JSON.stringify(localData, null, 2);
      await this.uploadFile(remotePath, jsonData);

      logger.success('Data synchronized successfully');
      return { success: true };
    } catch (error) {
      logger.error('Data synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Загрузить данные с диска
   */
  async loadData(remotePath) {
    if (!this.token) {
      throw new Error('No token provided');
    }

    try {
      logger.info('Loading data from disk...');
      
      const data = await this.downloadFile(remotePath);
      
      if (!data) {
        logger.info('No remote data found, starting fresh');
        return null;
      }

      logger.success('Data loaded from disk successfully');
      return data;
    } catch (error) {
      logger.error('Failed to load data from disk:', error);
      throw error;
    }
  }

  /**
   * Объединить данные (локальные + удаленные)
   */
  mergeData(localData, remoteData) {
    try {
      logger.info('Merging local and remote data...');
      
      if (!remoteData) {
        logger.info('No remote data, using local data');
        return localData;
      }

      if (!localData) {
        logger.info('No local data, using remote data');
        return remoteData;
      }

      // Объединяем тренировки
      const mergedWorkouts = this.mergeWorkouts(localData.workouts || [], remoteData.workouts || []);
      
      // Объединяем недавние упражнения
      const mergedRecentExercises = this.mergeRecentExercises(
        localData.recentExercises || [], 
        remoteData.recentExercises || []
      );

      // Объединяем анализы тела
      const mergedBodyAnalyses = this.mergeBodyAnalyses(
        localData.bodyAnalyses || [], 
        remoteData.bodyAnalyses || []
      );

      const mergedData = {
        workouts: mergedWorkouts,
        recentExercises: mergedRecentExercises,
        bodyAnalyses: mergedBodyAnalyses
      };

      logger.success('Data merged successfully');
      return mergedData;
    } catch (error) {
      logger.error('Failed to merge data:', error);
      throw error;
    }
  }

  /**
   * Объединить тренировки
   */
  mergeWorkouts(localWorkouts, remoteWorkouts) {
    const workoutMap = new Map();

    // Добавляем локальные тренировки
    localWorkouts.forEach(workout => {
      workoutMap.set(workout.id, workout);
    });

    // Объединяем с удаленными тренировками
    remoteWorkouts.forEach(workout => {
      const existing = workoutMap.get(workout.id);
      
      if (!existing) {
        // Новая тренировка
        workoutMap.set(workout.id, workout);
      } else {
        // Объединяем по времени обновления
        const existingDate = new Date(existing.updatedAt || existing.date);
        const remoteDate = new Date(workout.updatedAt || workout.date);
        
        if (remoteDate > existingDate) {
          workoutMap.set(workout.id, workout);
        }
      }
    });

    return Array.from(workoutMap.values()).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }

  /**
   * Объединить недавние упражнения
   */
  mergeRecentExercises(localRecent, remoteRecent) {
    const exerciseSet = new Set();
    
    // Добавляем все упражнения
    [...localRecent, ...remoteRecent].forEach(exercise => {
      exerciseSet.add(exercise);
    });

    return Array.from(exerciseSet).slice(0, 10);
  }

  /**
   * Объединить анализы тела
   */
  mergeBodyAnalyses(localAnalyses, remoteAnalyses) {
    const analysisMap = new Map();

    // Добавляем локальные анализы
    localAnalyses.forEach(analysis => {
      analysisMap.set(analysis.id, analysis);
    });

    // Объединяем с удаленными анализами
    remoteAnalyses.forEach(analysis => {
      const existing = analysisMap.get(analysis.id);
      
      if (!existing) {
        analysisMap.set(analysis.id, analysis);
      } else {
        // Объединяем по времени
        const existingDate = new Date(existing.timestamp);
        const remoteDate = new Date(analysis.timestamp);
        
        if (remoteDate > existingDate) {
          analysisMap.set(analysis.id, analysis);
        }
      }
    });

    return Array.from(analysisMap.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /**
   * Проверить подключение
   */
  async testConnection() {
    try {
      await this.getUserInfo();
      return { success: true, message: 'Подключение успешно' };
    } catch (error) {
      return { 
        success: false, 
        message: `Ошибка подключения: ${error.message}` 
      };
    }
  }

  /**
   * Выйти из аккаунта
   */
  logout() {
    this.token = null;
    this.userInfo = null;
    this.isAuthenticated = false;
    logger.info('Logged out from Yandex');
  }
}

// Создаем единственный экземпляр
export const yandexAPI = new YandexAPI();

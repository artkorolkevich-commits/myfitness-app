/**
 * Модуль для работы с localStorage
 */

import { STORAGE_KEYS, DEFAULT_CONFIG } from './config.js';

class StorageManager {
  constructor() {
    this.config = null;
    this.workouts = null;
    this.recentExercises = null;
    this.bodyAnalyses = null;
  }

  /**
   * Загружает конфигурацию из localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } else {
        this.config = { ...DEFAULT_CONFIG };
      }
      return this.config;
    } catch (error) {
      console.warn('Failed to load config:', error);
      this.config = { ...DEFAULT_CONFIG };
      return this.config;
    }
  }

  /**
   * Сохраняет конфигурацию в localStorage
   */
  saveConfig(config) {
    try {
      this.config = { ...this.config, ...config };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
      return true;
    } catch (error) {
      console.warn('Failed to save config:', error);
      return false;
    }
  }

  /**
   * Загружает тренировки из localStorage
   */
  loadWorkouts() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      this.workouts = saved ? JSON.parse(saved) : [];
      return this.workouts;
    } catch (error) {
      console.warn('Failed to load workouts:', error);
      this.workouts = [];
      return this.workouts;
    }
  }

  /**
   * Сохраняет тренировки в localStorage
   */
  saveWorkouts(workouts) {
    try {
      this.workouts = workouts;
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
      return true;
    } catch (error) {
      console.warn('Failed to save workouts:', error);
      return false;
    }
  }

  /**
   * Добавляет новую тренировку
   */
  addWorkout(workout) {
    const workouts = this.loadWorkouts();
    workouts.push({
      ...workout,
      id: this.generateUUID(),
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deviceId: this.getDeviceId()
    });
    return this.saveWorkouts(workouts);
  }

  /**
   * Загружает недавние упражнения
   */
  loadRecentExercises() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_EXERCISES);
      this.recentExercises = saved ? JSON.parse(saved) : [];
      return this.recentExercises;
    } catch (error) {
      console.warn('Failed to load recent exercises:', error);
      this.recentExercises = [];
      return this.recentExercises;
    }
  }

  /**
   * Сохраняет недавние упражнения
   */
  saveRecentExercises(exercises) {
    try {
      this.recentExercises = exercises;
      localStorage.setItem(STORAGE_KEYS.RECENT_EXERCISES, JSON.stringify(exercises));
      return true;
    } catch (error) {
      console.warn('Failed to save recent exercises:', error);
      return false;
    }
  }

  /**
   * Добавляет упражнение в недавние
   */
  addRecentExercise(exerciseName) {
    const recent = this.loadRecentExercises();
    const updated = [exerciseName, ...recent.filter(e => e !== exerciseName)].slice(0, 10);
    return this.saveRecentExercises(updated);
  }

  /**
   * Загружает анализы тела
   */
  loadBodyAnalyses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BODY_ANALYSES);
      this.bodyAnalyses = saved ? JSON.parse(saved) : [];
      return this.bodyAnalyses;
    } catch (error) {
      console.warn('Failed to load body analyses:', error);
      this.bodyAnalyses = [];
      return this.bodyAnalyses;
    }
  }

  /**
   * Сохраняет анализы тела
   */
  saveBodyAnalyses(analyses) {
    try {
      this.bodyAnalyses = analyses;
      localStorage.setItem(STORAGE_KEYS.BODY_ANALYSES, JSON.stringify(analyses));
      return true;
    } catch (error) {
      console.warn('Failed to save body analyses:', error);
      return false;
    }
  }

  /**
   * Добавляет новый анализ тела
   */
  addBodyAnalysis(analysis) {
    const analyses = this.loadBodyAnalyses();
    analyses.push({
      ...analysis,
      id: this.generateUUID(),
      timestamp: new Date().toISOString()
    });
    return this.saveBodyAnalyses(analyses);
  }

  /**
   * Получает или создает ID устройства
   */
  getDeviceId() {
    let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!id) {
      id = this.generateUUID();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
    }
    return id;
  }

  /**
   * Генерирует UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Очищает все данные
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
      localStorage.removeItem(STORAGE_KEYS.RECENT_EXERCISES);
      localStorage.removeItem(STORAGE_KEYS.BODY_ANALYSES);
      this.workouts = [];
      this.recentExercises = [];
      this.bodyAnalyses = [];
      return true;
    } catch (error) {
      console.warn('Failed to clear data:', error);
      return false;
    }
  }

  /**
   * Экспортирует данные
   */
  exportData() {
    try {
      const data = {
        workouts: this.loadWorkouts(),
        recentExercises: this.loadRecentExercises(),
        bodyAnalyses: this.loadBodyAnalyses(),
        exportDate: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.warn('Failed to export data:', error);
      return null;
    }
  }

  /**
   * Импортирует данные
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.workouts) this.saveWorkouts(data.workouts);
      if (data.recentExercises) this.saveRecentExercises(data.recentExercises);
      if (data.bodyAnalyses) this.saveBodyAnalyses(data.bodyAnalyses);
      return true;
    } catch (error) {
      console.warn('Failed to import data:', error);
      return false;
    }
  }
}

// Создаем единственный экземпляр
export const storage = new StorageManager();

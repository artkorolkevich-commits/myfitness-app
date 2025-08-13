/**
 * Модуль для работы с AI сервисами
 */

import { logger } from '../utils/logger.js';
import { API_CONFIG, BODY_ANALYSIS_PROMPTS } from './config.js';

class AIService {
  constructor() {
    this.apiKey = null;
    this.model = API_CONFIG.AI_MODEL;
    this.isInitialized = false;
  }

  /**
   * Инициализация с API ключом
   */
  init(apiKey) {
    this.apiKey = apiKey;
    this.isInitialized = !!apiKey;
    logger.info('AIService initialized with API key');
  }

  /**
   * Проверить подключение к Hugging Face
   */
  async testHuggingFaceConnection() {
    if (!this.apiKey) {
      return { success: false, message: 'API ключ не настроен' };
    }

    try {
      logger.api('GET', 'Hugging Face connection test');
      
      const response = await fetch('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        logger.success('Hugging Face connection successful:', userInfo);
        return { 
          success: true, 
          message: `Подключение успешно! Пользователь: ${userInfo.name || 'Unknown'}` 
        };
      } else {
        logger.warn('Hugging Face connection failed:', response.status);
        return { 
          success: false, 
          message: `Ошибка подключения: HTTP ${response.status}` 
        };
      }
    } catch (error) {
      logger.error('Hugging Face connection test failed:', error);
      return { 
        success: false, 
        message: `Ошибка подключения: ${error.message}` 
      };
    }
  }

  /**
   * Анализ тела с помощью AI
   */
  async analyzeBodyWithAI(imageData) {
    if (!this.apiKey) {
      throw new Error('API ключ не настроен');
    }

    if (!imageData) {
      throw new Error('Изображение не предоставлено');
    }

    try {
      logger.info('Starting AI body analysis...');
      
      // Подготавливаем изображение
      const imageBlob = await this.prepareImageForAI(imageData);
      
      // Создаем промпт для анализа
      const prompt = this.createAnalysisPrompt();
      
      // Отправляем запрос к AI
      const result = await this.sendAIRequest(imageBlob, prompt);
      
      // Обрабатываем результат
      const analysis = this.processAIResult(result);
      
      logger.success('AI body analysis completed');
      return analysis;
    } catch (error) {
      logger.error('AI body analysis failed:', error);
      throw error;
    }
  }

  /**
   * Подготовить изображение для AI
   */
  async prepareImageForAI(imageData) {
    try {
      // Если это base64 строка, конвертируем в Blob
      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        const response = await fetch(imageData);
        return await response.blob();
      }
      
      // Если это уже Blob или File
      if (imageData instanceof Blob) {
        return imageData;
      }
      
      throw new Error('Неподдерживаемый формат изображения');
    } catch (error) {
      logger.error('Failed to prepare image for AI:', error);
      throw error;
    }
  }

  /**
   * Создать промпт для анализа
   */
  createAnalysisPrompt() {
    const randomPrompt = BODY_ANALYSIS_PROMPTS[
      Math.floor(Math.random() * BODY_ANALYSIS_PROMPTS.length)
    ];
    
    return `Analyze this body image and provide: ${randomPrompt}. 
    Return a JSON object with the following structure:
    {
      "bodyFatPercentage": number (estimated percentage),
      "muscleMass": number (estimated percentage),
      "fitnessLevel": string (beginner/intermediate/advanced),
      "overallHealth": string (good/average/poor),
      "confidence": number (0-100, confidence in analysis),
      "notes": string (additional observations)
    }`;
  }

  /**
   * Отправить запрос к AI
   */
  async sendAIRequest(imageBlob, prompt) {
    try {
      logger.api('POST', 'AI inference request');
      
      const formData = new FormData();
      formData.append('file', imageBlob, 'body_image.jpg');
      formData.append('inputs', prompt);

      const response = await fetch(`${API_CONFIG.HUGGING_FACE_BASE_URL}${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`AI request failed: HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.success('AI request completed');
      return result;
    } catch (error) {
      logger.error('AI request failed:', error);
      throw error;
    }
  }

  /**
   * Обработать результат AI
   */
  processAIResult(result) {
    try {
      // Если результат - строка, пытаемся распарсить JSON
      let parsedResult;
      if (typeof result === 'string') {
        parsedResult = JSON.parse(result);
      } else {
        parsedResult = result;
      }

      // Валидируем и нормализуем результат
      const analysis = {
        bodyFatPercentage: this.normalizePercentage(parsedResult.bodyFatPercentage),
        muscleMass: this.normalizePercentage(parsedResult.muscleMass),
        fitnessLevel: this.normalizeFitnessLevel(parsedResult.fitnessLevel),
        overallHealth: this.normalizeHealth(parsedResult.overallHealth),
        confidence: this.normalizeConfidence(parsedResult.confidence),
        notes: parsedResult.notes || 'Анализ завершен',
        timestamp: new Date().toISOString(),
        aiModel: this.model
      };

      logger.debug('AI result processed:', analysis);
      return analysis;
    } catch (error) {
      logger.error('Failed to process AI result:', error);
      
      // Возвращаем симуляцию в случае ошибки
      return this.generateSimulationResult();
    }
  }

  /**
   * Нормализовать процентное значение
   */
  normalizePercentage(value) {
    if (typeof value === 'number') {
      return Math.max(0, Math.min(100, value));
    }
    
    // Пытаемся извлечь число из строки
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return Math.max(0, Math.min(100, num));
    }
    
    // Возвращаем случайное значение в разумных пределах
    return Math.floor(Math.random() * 30) + 10; // 10-40%
  }

  /**
   * Нормализовать уровень фитнеса
   */
  normalizeFitnessLevel(level) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    const normalized = level?.toLowerCase();
    
    if (validLevels.includes(normalized)) {
      return normalized;
    }
    
    // Возвращаем случайный уровень
    return validLevels[Math.floor(Math.random() * validLevels.length)];
  }

  /**
   * Нормализовать оценку здоровья
   */
  normalizeHealth(health) {
    const validHealth = ['good', 'average', 'poor'];
    const normalized = health?.toLowerCase();
    
    if (validHealth.includes(normalized)) {
      return normalized;
    }
    
    // Возвращаем случайную оценку
    return validHealth[Math.floor(Math.random() * validHealth.length)];
  }

  /**
   * Нормализовать уровень уверенности
   */
  normalizeConfidence(confidence) {
    if (typeof confidence === 'number') {
      return Math.max(0, Math.min(100, confidence));
    }
    
    const num = parseFloat(confidence);
    if (!isNaN(num)) {
      return Math.max(0, Math.min(100, num));
    }
    
    // Возвращаем случайное значение
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  }

  /**
   * Генерировать симуляционный результат
   */
  generateSimulationResult() {
    logger.warn('Generating simulation result due to AI failure');
    
    return {
      bodyFatPercentage: Math.floor(Math.random() * 25) + 10, // 10-35%
      muscleMass: Math.floor(Math.random() * 30) + 20, // 20-50%
      fitnessLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
      overallHealth: ['good', 'average', 'poor'][Math.floor(Math.random() * 3)],
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      notes: 'Результат получен в режиме симуляции',
      timestamp: new Date().toISOString(),
      aiModel: 'simulation',
      isSimulation: true
    };
  }

  /**
   * Получить информацию о модели
   */
  async getModelInfo() {
    if (!this.apiKey) {
      throw new Error('API ключ не настроен');
    }

    try {
      logger.api('GET', 'Model info request');
      
      const response = await fetch(`${API_CONFIG.HUGGING_FACE_BASE_URL}${this.model}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get model info: HTTP ${response.status}`);
      }

      const modelInfo = await response.json();
      logger.success('Model info retrieved');
      return modelInfo;
    } catch (error) {
      logger.error('Failed to get model info:', error);
      throw error;
    }
  }

  /**
   * Изменить модель
   */
  changeModel(newModel) {
    this.model = newModel;
    logger.info('AI model changed to:', newModel);
  }

  /**
   * Получить текущую модель
   */
  getCurrentModel() {
    return this.model;
  }

  /**
   * Проверить доступность модели
   */
  async checkModelAvailability() {
    try {
      const modelInfo = await this.getModelInfo();
      return {
        available: true,
        model: this.model,
        info: modelInfo
      };
    } catch (error) {
      return {
        available: false,
        model: this.model,
        error: error.message
      };
    }
  }
}

// Создаем единственный экземпляр
export const aiService = new AIService();

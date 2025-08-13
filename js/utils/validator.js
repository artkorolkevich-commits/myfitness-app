/**
 * Модуль для валидации данных
 */

import { logger } from './logger.js';

class Validator {
  /**
   * Валидирует тренировку
   */
  validateWorkout(workout) {
    const errors = [];

    if (!workout) {
      errors.push('Тренировка не может быть пустой');
      return { isValid: false, errors };
    }

    if (!workout.exercises || !Array.isArray(workout.exercises)) {
      errors.push('Тренировка должна содержать массив упражнений');
    }

    if (workout.exercises && workout.exercises.length === 0) {
      errors.push('Тренировка должна содержать хотя бы одно упражнение');
    }

    if (workout.exercises && workout.exercises.length > 8) {
      errors.push('Максимальное количество упражнений в тренировке: 8');
    }

    if (workout.exercises) {
      workout.exercises.forEach((exercise, index) => {
        const exerciseErrors = this.validateExercise(exercise);
        if (exerciseErrors.length > 0) {
          errors.push(`Упражнение ${index + 1}: ${exerciseErrors.join(', ')}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидирует упражнение
   */
  validateExercise(exercise) {
    const errors = [];

    if (!exercise) {
      errors.push('Упражнение не может быть пустым');
      return errors;
    }

    if (!exercise.exercise || typeof exercise.exercise !== 'string') {
      errors.push('Название упражнения обязательно');
    }

    if (!exercise.sets || !Array.isArray(exercise.sets)) {
      errors.push('Упражнение должно содержать массив подходов');
    }

    if (exercise.sets && exercise.sets.length === 0) {
      errors.push('Упражнение должно содержать хотя бы один подход');
    }

    if (exercise.sets) {
      exercise.sets.forEach((set, index) => {
        const setErrors = this.validateSet(set);
        if (setErrors.length > 0) {
          errors.push(`Подход ${index + 1}: ${setErrors.join(', ')}`);
        }
      });
    }

    return errors;
  }

  /**
   * Валидирует подход
   */
  validateSet(set) {
    const errors = [];

    if (!set) {
      errors.push('Подход не может быть пустым');
      return errors;
    }

    if (typeof set.weight !== 'number' || set.weight < 0) {
      errors.push('Вес должен быть положительным числом');
    }

    if (typeof set.reps !== 'number' || set.reps < 0) {
      errors.push('Количество повторений должно быть положительным числом');
    }

    if (set.weight > 1000) {
      errors.push('Вес не может превышать 1000 кг');
    }

    if (set.reps > 100) {
      errors.push('Количество повторений не может превышать 100');
    }

    return errors;
  }

  /**
   * Валидирует конфигурацию
   */
  validateConfig(config) {
    const errors = [];

    if (!config) {
      errors.push('Конфигурация не может быть пустой');
      return { isValid: false, errors };
    }

    if (typeof config.autoSync !== 'boolean') {
      errors.push('autoSync должен быть булевым значением');
    }

    if (typeof config.syncInterval !== 'number' || config.syncInterval < 1) {
      errors.push('syncInterval должен быть положительным числом');
    }

    if (typeof config.defaultCycle !== 'number' || config.defaultCycle < 1) {
      errors.push('defaultCycle должен быть положительным числом');
    }

    if (config.yandexPath && typeof config.yandexPath !== 'string') {
      errors.push('yandexPath должен быть строкой');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидирует API ключ Hugging Face
   */
  validateHuggingFaceApiKey(apiKey) {
    if (!apiKey) {
      return { isValid: false, error: 'API ключ не может быть пустым' };
    }

    if (typeof apiKey !== 'string') {
      return { isValid: false, error: 'API ключ должен быть строкой' };
    }

    if (!apiKey.startsWith('hf_')) {
      return { isValid: false, error: 'API ключ должен начинаться с "hf_"' };
    }

    if (apiKey.length < 30) {
      return { isValid: false, error: 'API ключ слишком короткий' };
    }

    if (apiKey.includes(' ')) {
      return { isValid: false, error: 'API ключ не должен содержать пробелы' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует дату
   */
  validateDate(date) {
    if (!date) {
      return { isValid: false, error: 'Дата не может быть пустой' };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Неверный формат даты' };
    }

    const now = new Date();
    if (dateObj > now) {
      return { isValid: false, error: 'Дата не может быть в будущем' };
    }

    return { isValid: true, date: dateObj };
  }

  /**
   * Валидирует email
   */
  validateEmail(email) {
    if (!email) {
      return { isValid: false, error: 'Email не может быть пустым' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Неверный формат email' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует файл изображения
   */
  validateImageFile(file) {
    if (!file) {
      return { isValid: false, error: 'Файл не выбран' };
    }

    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Файл должен быть изображением' };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'Размер файла не должен превышать 10MB' };
    }

    return { isValid: true };
  }

  /**
   * Валидирует UUID
   */
  validateUUID(uuid) {
    if (!uuid) {
      return { isValid: false, error: 'UUID не может быть пустым' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return { isValid: false, error: 'Неверный формат UUID' };
    }

    return { isValid: true };
  }

  /**
   * Логирует ошибки валидации
   */
  logValidationErrors(context, errors) {
    if (errors && errors.length > 0) {
      logger.warn(`Validation errors in ${context}:`, errors);
    }
  }
}

// Создаем единственный экземпляр
export const validator = new Validator();

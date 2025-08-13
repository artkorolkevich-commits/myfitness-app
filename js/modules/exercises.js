/**
 * Модуль для управления упражнениями
 */

import { logger } from '../utils/logger.js';

// База данных упражнений
export const EXERCISES_DATA = {
  'Грудь': [
    'Жим лежа',
    'Жим гантелей лежа',
    'Разведение гантелей лежа',
    'Сведение рук в тренажере бабочка',
    'Отжимания от пола'
  ],
  'Спина': [
    'Подтягивания',
    'Тяга верхнего блока',
    'Тяга штанги к поясу',
    'Тяга гантели одной рукой',
    'Тяга штанги в наклоне'
  ],
  'Ноги': [
    'Приседания со штангой',
    'Жим ногами',
    'Разгибания ног',
    'Сгибания ног',
    'Румынская тяга',
    'Становая тяга',
    'Болгарские сплит-приседания'
  ],
  'Плечи': [
    'Жим гантелей стоя',
    'Разведение рук в стороны стоя(гантели)',
    'Жим над головой(гантели)'
  ],
  'Бицепс': [
    'Подъем штанги на бицепс',
    'Подъем гантелей на бицепс',
    'Молотки'
  ],
  'Трицепс': [
    'Разгибания на блоке',
    'Отжимания от скамьи'
  ],
  'Задние дельты': [
    'Разведение гантелей в наклоне',
    'Тяга к лицу на блоке'
  ]
};

class ExerciseManager {
  constructor() {
    this.selectedExercises = new Set();
    this.recentExercises = [];
    this.popularExercises = [];
  }

  /**
   * Получить все упражнения
   */
  getAllExercises() {
    return EXERCISES_DATA;
  }

  /**
   * Получить упражнения по группе
   */
  getExercisesByGroup(group) {
    return EXERCISES_DATA[group] || [];
  }

  /**
   * Получить все группы упражнений
   */
  getExerciseGroups() {
    return Object.keys(EXERCISES_DATA);
  }

  /**
   * Поиск упражнений
   */
  searchExercises(query, group = null) {
    const searchTerm = query.toLowerCase().trim();
    const results = [];

    Object.entries(EXERCISES_DATA).forEach(([groupName, exercises]) => {
      if (group && group !== groupName) return;

      exercises.forEach(exercise => {
        if (exercise.toLowerCase().includes(searchTerm)) {
          results.push({
            name: exercise,
            group: groupName
          });
        }
      });
    });

    return results;
  }

  /**
   * Получить популярные упражнения
   */
  getPopularExercises() {
    // Здесь можно добавить логику определения популярности
    // Пока возвращаем первые 3 упражнения из каждой группы
    const popular = [];
    Object.entries(EXERCISES_DATA).forEach(([group, exercises]) => {
      popular.push(...exercises.slice(0, 3).map(exercise => ({
        name: exercise,
        group
      })));
    });
    return popular;
  }

  /**
   * Добавить упражнение в недавние
   */
  addToRecent(exerciseName) {
    this.recentExercises = [
      exerciseName,
      ...this.recentExercises.filter(e => e !== exerciseName)
    ].slice(0, 10);
    
    logger.debug('Added to recent exercises:', exerciseName);
  }

  /**
   * Получить недавние упражнения
   */
  getRecentExercises() {
    return this.recentExercises;
  }

  /**
   * Выбрать упражнение
   */
  selectExercise(exerciseName) {
    if (this.selectedExercises.size >= 8) {
      logger.warn('Maximum exercises selected (8)');
      return false;
    }

    this.selectedExercises.add(exerciseName);
    this.addToRecent(exerciseName);
    
    logger.debug('Exercise selected:', exerciseName);
    return true;
  }

  /**
   * Отменить выбор упражнения
   */
  deselectExercise(exerciseName) {
    this.selectedExercises.delete(exerciseName);
    logger.debug('Exercise deselected:', exerciseName);
  }

  /**
   * Получить выбранные упражнения
   */
  getSelectedExercises() {
    return Array.from(this.selectedExercises);
  }

  /**
   * Проверить, выбрано ли упражнение
   */
  isExerciseSelected(exerciseName) {
    return this.selectedExercises.has(exerciseName);
  }

  /**
   * Получить количество выбранных упражнений
   */
  getSelectedCount() {
    return this.selectedExercises.size;
  }

  /**
   * Очистить выбранные упражнения
   */
  clearSelected() {
    this.selectedExercises.clear();
    logger.debug('Selected exercises cleared');
  }

  /**
   * Создать упражнение для тренировки
   */
  createWorkoutExercise(exerciseName) {
    return {
      exercise: exerciseName,
      sets: [{
        weight: 0,
        reps: 0
      }]
    };
  }

  /**
   * Валидировать упражнение
   */
  validateExercise(exercise) {
    const errors = [];

    if (!exercise.exercise || typeof exercise.exercise !== 'string') {
      errors.push('Название упражнения обязательно');
    }

    if (!exercise.sets || !Array.isArray(exercise.sets)) {
      errors.push('Упражнение должно содержать массив подходов');
    }

    if (exercise.sets && exercise.sets.length === 0) {
      errors.push('Упражнение должно содержать хотя бы один подход');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Добавить подход к упражнению
   */
  addSet(exercise) {
    if (!exercise.sets) {
      exercise.sets = [];
    }
    
    exercise.sets.push({
      weight: 0,
      reps: 0
    });

    logger.debug('Set added to exercise:', exercise.exercise);
  }

  /**
   * Удалить подход из упражнения
   */
  removeSet(exercise, setIndex) {
    if (exercise.sets && exercise.sets.length > 1) {
      exercise.sets.splice(setIndex, 1);
      logger.debug('Set removed from exercise:', exercise.exercise);
      return true;
    }
    return false;
  }

  /**
   * Добавить подход ко всем упражнениям
   */
  addSetToAll(exercises) {
    exercises.forEach(exercise => {
      this.addSet(exercise);
    });
    logger.debug('Set added to all exercises');
  }

  /**
   * Получить статистику упражнения
   */
  getExerciseStats(exercise) {
    if (!exercise.sets || exercise.sets.length === 0) {
      return {
        totalWeight: 0,
        totalReps: 0,
        totalVolume: 0,
        maxWeight: 0,
        minWeight: 0,
        avgWeight: 0,
        avgReps: 0
      };
    }

    const weights = exercise.sets.map(set => set.weight || 0);
    const reps = exercise.sets.map(set => set.reps || 0);
    const volumes = exercise.sets.map(set => (set.weight || 0) * (set.reps || 0));

    return {
      totalWeight: weights.reduce((sum, weight) => sum + weight, 0),
      totalReps: reps.reduce((sum, rep) => sum + rep, 0),
      totalVolume: volumes.reduce((sum, volume) => sum + volume, 0),
      maxWeight: Math.max(...weights),
      minWeight: Math.min(...weights),
      avgWeight: weights.reduce((sum, weight) => sum + weight, 0) / weights.length,
      avgReps: reps.reduce((sum, rep) => sum + rep, 0) / reps.length
    };
  }

  /**
   * Форматировать название упражнения
   */
  formatExerciseName(name) {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Получить группу упражнения
   */
  getExerciseGroup(exerciseName) {
    for (const [group, exercises] of Object.entries(EXERCISES_DATA)) {
      if (exercises.includes(exerciseName)) {
        return group;
      }
    }
    return null;
  }
}

// Создаем единственный экземпляр
export const exerciseManager = new ExerciseManager();

/**
 * Модуль для управления прогрессом тренировок
 */

import { logger } from '../utils/logger.js';
import { storage } from './storage.js';
import { dom } from '../utils/dom.js';

class ProgressManager {
  constructor() {
    this.currentExercise = null;
    this.currentPeriod = 'month';
    this.currentChartType = 'volume';
    this.progressChart = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация менеджера прогресса
   */
  init() {
    try {
      logger.info('Initializing progress manager...');
      
      this.setupEventListeners();
      this.populateExerciseSelect();
      this.updateProgressDisplay();
      
      this.isInitialized = true;
      logger.success('Progress manager initialized');
    } catch (error) {
      logger.error('Failed to initialize progress manager:', error);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Выбор упражнения
    const exerciseSelect = dom.getElement('exerciseSelect');
    if (exerciseSelect) {
      exerciseSelect.addEventListener('change', (e) => {
        this.currentExercise = e.target.value;
        this.updateProgressDisplay();
      });
    }

    // Выбор периода
    const periodSelect = dom.getElement('periodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.currentPeriod = e.target.value;
        this.updateProgressDisplay();
      });
    }

    // Кнопки типа графика
    const chartTypeButtons = dom.getElements('.chart-type-btn');
    chartTypeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentChartType = e.target.getAttribute('data-chart-type');
        this.updateChartTypeButtons();
        this.updateProgressDisplay();
      });
    });
  }

  /**
   * Заполнение списка упражнений
   */
  populateExerciseSelect() {
    try {
      const exerciseSelect = dom.getElement('exerciseSelect');
      if (!exerciseSelect) return;

      const workouts = storage.loadWorkouts();
      const exercises = new Set();

      // Собираем все уникальные упражнения
      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          exercises.add(exercise.exercise);
        });
      });

      // Сортируем упражнения
      const sortedExercises = Array.from(exercises).sort();

      // Очищаем и заполняем select
      exerciseSelect.innerHTML = '<option value="">Выберите упражнение</option>';
      
      sortedExercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise;
        option.textContent = exercise;
        exerciseSelect.appendChild(option);
      });

      logger.debug('Exercise select populated:', sortedExercises.length, 'exercises');
    } catch (error) {
      logger.error('Failed to populate exercise select:', error);
    }
  }

  /**
   * Обновление отображения прогресса
   */
  updateProgressDisplay() {
    try {
      if (!this.currentExercise) {
        this.clearProgressDisplay();
        return;
      }

      const data = this.getExerciseData(this.currentExercise, this.currentPeriod);
      
      if (data.length === 0) {
        this.showNoDataMessage();
        return;
      }

      this.updateProgressChart(data, this.currentChartType);
      this.updateProgressStats(data);
      this.updateProgressTable(data);
      
      logger.debug('Progress display updated');
    } catch (error) {
      logger.error('Failed to update progress display:', error);
    }
  }

  /**
   * Получение данных упражнения
   */
  getExerciseData(exerciseName, period) {
    try {
      const workouts = storage.loadWorkouts();
      const now = new Date();
      const periodStart = this.getPeriodStart(period, now);

      // Фильтруем тренировки по периоду
      const filteredWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= periodStart;
      });

      // Собираем данные упражнения
      const exerciseData = [];

      filteredWorkouts.forEach(workout => {
        const exercise = workout.exercises.find(ex => ex.exercise === exerciseName);
        if (exercise && exercise.sets) {
          const workoutDate = new Date(workout.date);
          
          // Рассчитываем статистику для тренировки
          const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
          const minWeight = Math.min(...exercise.sets.map(set => set.weight || 0));
          const totalVolume = exercise.sets.reduce((sum, set) => 
            sum + ((set.weight || 0) * (set.reps || 0)), 0
          );
          const totalWeight = exercise.sets.reduce((sum, set) => sum + (set.weight || 0), 0);
          const totalReps = exercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0);

          exerciseData.push({
            date: workoutDate,
            maxWeight,
            minWeight,
            totalVolume,
            totalWeight,
            totalReps,
            setsCount: exercise.sets.length
          });
        }
      });

      // Сортируем по дате
      exerciseData.sort((a, b) => a.date - b.date);

      logger.debug('Exercise data prepared:', exerciseData.length, 'entries');
      return exerciseData;
    } catch (error) {
      logger.error('Failed to get exercise data:', error);
      return [];
    }
  }

  /**
   * Получение начала периода
   */
  getPeriodStart(period, now) {
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      case 'all':
        return new Date(0);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /**
   * Обновление графика прогресса
   */
  updateProgressChart(data, chartType) {
    try {
      const canvas = dom.getElement('progressChart');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Уничтожаем предыдущий график если есть
      if (this.progressChart) {
        this.progressChart.destroy();
      }

      const chartData = this.prepareChartData(data, chartType);
      
      this.progressChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'dd.MM'
                }
              }
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: this.getChartTypeTitle(chartType)
            }
          }
        }
      });
      
      logger.debug('Progress chart updated');
    } catch (error) {
      logger.error('Failed to update progress chart:', error);
    }
  }

  /**
   * Подготовка данных для графика
   */
  prepareChartData(data, chartType) {
    try {
      let datasets = [];
      
      switch (chartType) {
        case 'volume':
          datasets.push({
            label: 'Общий объем (кг × повторения)',
            data: data.map(d => ({
              x: d.date,
              y: d.totalVolume
            })),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1
          });
          break;
          
        case 'max-weight':
          datasets.push({
            label: 'Максимальный вес (кг)',
            data: data.map(d => ({
              x: d.date,
              y: d.maxWeight
            })),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1
          });
          break;
          
        case 'range':
          datasets.push({
            label: 'Максимальный вес (кг)',
            data: data.map(d => ({
              x: d.date,
              y: d.maxWeight
            })),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1
          });
          
          datasets.push({
            label: 'Минимальный вес (кг)',
            data: data.map(d => ({
              x: d.date,
              y: d.minWeight
            })),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            tension: 0.1
          });
          break;
      }
      
      return { datasets };
    } catch (error) {
      logger.error('Failed to prepare chart data:', error);
      return { datasets: [] };
    }
  }

  /**
   * Получение заголовка типа графика
   */
  getChartTypeTitle(chartType) {
    switch (chartType) {
      case 'volume':
        return 'Общий объем нагрузки';
      case 'max-weight':
        return 'Максимальный вес';
      case 'range':
        return 'Диапазон весов';
      default:
        return 'Прогресс';
    }
  }

  /**
   * Обновление статистики прогресса
   */
  updateProgressStats(data) {
    try {
      if (data.length === 0) return;

      const first = data[0];
      const last = data[data.length - 1];
      
      const stats = {
        startWeight: first.maxWeight,
        currentMax: last.maxWeight,
        growth: last.maxWeight - first.maxWeight,
        avgVolume: data.reduce((sum, d) => sum + d.totalVolume, 0) / data.length,
        workoutCount: data.length
      };

      // Обновляем элементы статистики
      Object.entries(stats).forEach(([key, value]) => {
        const element = dom.getElement(key);
        if (element) {
          if (key === 'growth') {
            const sign = value >= 0 ? '+' : '';
            dom.setContent(element, `${sign}${value.toFixed(1)} кг`);
          } else if (key === 'avgVolume') {
            dom.setContent(element, `${value.toFixed(0)} кг`);
          } else {
            dom.setContent(element, value.toString());
          }
        }
      });
      
      logger.debug('Progress stats updated');
    } catch (error) {
      logger.error('Failed to update progress stats:', error);
    }
  }

  /**
   * Обновление таблицы данных
   */
  updateProgressTable(data) {
    try {
      const tableContainer = dom.getElement('progressTable');
      if (!tableContainer) return;

      if (data.length === 0) {
        dom.setContent(tableContainer, '<p>Нет данных для отображения</p>');
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Макс. вес</th>
              <th>Мин. вес</th>
              <th>Объем</th>
              <th>Подходы</th>
            </tr>
          </thead>
          <tbody>
      `;

      data.forEach(item => {
        const dateStr = item.date.toLocaleDateString('ru-RU');
        html += `
          <tr>
            <td>${dateStr}</td>
            <td>${item.maxWeight} кг</td>
            <td>${item.minWeight} кг</td>
            <td>${item.totalVolume} кг</td>
            <td>${item.setsCount}</td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      dom.setContent(tableContainer, html, 'html');
      
      logger.debug('Progress table updated');
    } catch (error) {
      logger.error('Failed to update progress table:', error);
    }
  }

  /**
   * Обновление кнопок типа графика
   */
  updateChartTypeButtons() {
    try {
      const buttons = dom.getElements('.chart-type-btn');
      buttons.forEach(btn => {
        const chartType = btn.getAttribute('data-chart-type');
        if (chartType === this.currentChartType) {
          dom.toggleClass(btn, 'active', true);
        } else {
          dom.toggleClass(btn, 'active', false);
        }
      });
      
      logger.debug('Chart type buttons updated');
    } catch (error) {
      logger.error('Failed to update chart type buttons:', error);
    }
  }

  /**
   * Очистка отображения прогресса
   */
  clearProgressDisplay() {
    try {
      // Очищаем график
      if (this.progressChart) {
        this.progressChart.destroy();
        this.progressChart = null;
      }

      // Очищаем статистику
      const statElements = ['startWeight', 'currentMax', 'growth', 'avgVolume', 'workoutCount'];
      statElements.forEach(id => {
        const element = dom.getElement(id);
        if (element) {
          dom.setContent(element, '-');
        }
      });

      // Очищаем таблицу
      const tableContainer = dom.getElement('progressTable');
      if (tableContainer) {
        dom.setContent(tableContainer, '<p>Выберите упражнение для просмотра прогресса</p>');
      }
      
      logger.debug('Progress display cleared');
    } catch (error) {
      logger.error('Failed to clear progress display:', error);
    }
  }

  /**
   * Показать сообщение об отсутствии данных
   */
  showNoDataMessage() {
    try {
      const message = `Нет данных для упражнения "${this.currentExercise}" за выбранный период`;
      
      // Очищаем график
      if (this.progressChart) {
        this.progressChart.destroy();
        this.progressChart = null;
      }

      // Показываем сообщение
      const tableContainer = dom.getElement('progressTable');
      if (tableContainer) {
        dom.setContent(tableContainer, `<p>${message}</p>`);
      }
      
      logger.debug('No data message shown');
    } catch (error) {
      logger.error('Failed to show no data message:', error);
    }
  }

  /**
   * Получить текущее упражнение
   */
  getCurrentExercise() {
    return this.currentExercise;
  }

  /**
   * Получить текущий период
   */
  getCurrentPeriod() {
    return this.currentPeriod;
  }

  /**
   * Получить текущий тип графика
   */
  getCurrentChartType() {
    return this.currentChartType;
  }
}

// Создаем единственный экземпляр
export const progressManager = new ProgressManager();

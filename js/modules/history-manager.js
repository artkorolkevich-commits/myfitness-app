/**
 * Модуль для управления историей тренировок
 */

import { logger } from '../utils/logger.js';
import { storage } from './storage.js';
import { dom } from '../utils/dom.js';

class HistoryManager {
  constructor() {
    this.currentFilters = {
      dateRange: null,
      exerciseFilter: '',
      period: 'all'
    };
    this.isCalendarVisible = false;
  }

  /**
   * Инициализация страницы истории
   */
  init() {
    try {
      logger.info('Initializing history manager...');
      
      this.setupEventListeners();
      this.loadHistoryData();
      this.renderHistory();
      
      logger.success('History manager initialized');
    } catch (error) {
      logger.error('Failed to initialize history manager:', error);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Фильтры
    const applyFiltersBtn = dom.getElement('applyFilters');
    const clearFiltersBtn = dom.getElement('clearFilters');
    const dateRangeBtn = dom.getElement('dateRangeBtn');

    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => this.applyFilters());
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    }

    if (dateRangeBtn) {
      dateRangeBtn.addEventListener('click', () => this.toggleDatePicker());
    }

    // Календарь
    const calendarContainer = dom.getElement('calendarContainer');
    if (calendarContainer) {
      calendarContainer.addEventListener('click', (e) => this.handleDateClick(e));
    }
  }

  /**
   * Загрузка данных истории
   */
  loadHistoryData() {
    try {
      const workouts = storage.loadWorkouts();
      this.updateStats(workouts);
      this.renderWorkouts(workouts);
      
      logger.debug('History data loaded:', workouts.length, 'workouts');
    } catch (error) {
      logger.error('Failed to load history data:', error);
    }
  }

  /**
   * Обновление статистики
   */
  updateStats(workouts) {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats = {
        totalWorkouts: workouts.length,
        thisMonth: workouts.filter(w => {
          const date = new Date(w.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length,
        totalSets: workouts.reduce((sum, w) => 
          sum + w.exercises.reduce((exSum, ex) => exSum + (ex.sets?.length || 0), 0), 0
        ),
        avgWeight: this.calculateAverageWeight(workouts)
      };

      // Обновляем элементы на странице
      Object.entries(stats).forEach(([key, value]) => {
        const element = dom.getElement(key);
        if (element) {
          if (key === 'avgWeight') {
            dom.setContent(element, `${value.toFixed(1)} кг`);
          } else {
            dom.setContent(element, value.toString());
          }
        }
      });

      logger.debug('Stats updated:', stats);
    } catch (error) {
      logger.error('Failed to update stats:', error);
    }
  }

  /**
   * Расчет среднего веса
   */
  calculateAverageWeight(workouts) {
    try {
      let totalWeight = 0;
      let totalSets = 0;

      workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            if (set.weight > 0) {
              totalWeight += set.weight;
              totalSets++;
            }
          });
        });
      });

      return totalSets > 0 ? totalWeight / totalSets : 0;
    } catch (error) {
      logger.error('Failed to calculate average weight:', error);
      return 0;
    }
  }

  /**
   * Рендеринг тренировок
   */
  renderWorkouts(workouts) {
    try {
      const container = dom.getElement('workoutsContainer');
      if (!container) return;

      // Фильтруем тренировки
      const filteredWorkouts = this.filterWorkouts(workouts);
      
      // Показываем только последние 4 тренировки
      const recentWorkouts = filteredWorkouts.slice(0, 4);

      let html = '';
      
      recentWorkouts.forEach((workout, index) => {
        const workoutDate = new Date(workout.date);
        const dateStr = workoutDate.toLocaleDateString('ru-RU');
        
        html += `<div class="workout-block">
          <div class="workout-header">
            <span class="workout-date">${dateStr}</span>
          </div>
          <div class="workout-exercises">`;
        
        workout.exercises.forEach(exercise => {
          html += `<div class="exercise-block">
            <div class="exercise-name"><strong>${exercise.exercise}</strong></div>
            <div class="exercise-sets">`;
          
          exercise.sets.forEach(set => {
            html += `<span class="set-info">${set.weight}кг(${set.reps})</span>`;
          });
          
          html += `</div></div>`;
        });
        
        html += `</div></div>`;
      });

      if (recentWorkouts.length === 0) {
        html = '<div class="no-workouts">Нет тренировок для отображения</div>';
      }

      dom.setContent(container, html, 'html');
      
      logger.debug('Workouts rendered:', recentWorkouts.length);
    } catch (error) {
      logger.error('Failed to render workouts:', error);
    }
  }

  /**
   * Фильтрация тренировок
   */
  filterWorkouts(workouts) {
    try {
      let filtered = [...workouts];

      // Фильтр по периоду
      if (this.currentFilters.period !== 'all') {
        const now = new Date();
        const periodStart = this.getPeriodStart(this.currentFilters.period, now);
        filtered = filtered.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= periodStart;
        });
      }

      // Фильтр по диапазону дат
      if (this.currentFilters.dateRange) {
        const { startDate, endDate } = this.currentFilters.dateRange;
        filtered = filtered.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= startDate && workoutDate <= endDate;
        });
      }

      // Фильтр по упражнению
      if (this.currentFilters.exerciseFilter) {
        const filter = this.currentFilters.exerciseFilter.toLowerCase();
        filtered = filtered.filter(workout => 
          workout.exercises.some(exercise => 
            exercise.exercise.toLowerCase().includes(filter)
          )
        );
      }

      // Сортируем по дате (новые сначала)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      return filtered;
    } catch (error) {
      logger.error('Failed to filter workouts:', error);
      return workouts;
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
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  }

  /**
   * Применение фильтров
   */
  applyFilters() {
    try {
      logger.info('Applying filters...');
      
      // Получаем значения фильтров
      const periodSelect = dom.getElement('periodSelect');
      const exerciseFilter = dom.getElement('exerciseFilter');
      
      if (periodSelect) {
        this.currentFilters.period = periodSelect.value;
      }
      
      if (exerciseFilter) {
        this.currentFilters.exerciseFilter = exerciseFilter.value;
      }

      // Перерисовываем историю
      this.loadHistoryData();
      
      // Скрываем календарь если открыт
      this.hideDatePicker();
      
      logger.success('Filters applied');
    } catch (error) {
      logger.error('Failed to apply filters:', error);
    }
  }

  /**
   * Очистка фильтров
   */
  clearFilters() {
    try {
      logger.info('Clearing filters...');
      
      this.currentFilters = {
        dateRange: null,
        exerciseFilter: '',
        period: 'all'
      };

      // Сбрасываем UI элементы
      const periodSelect = dom.getElement('periodSelect');
      const exerciseFilter = dom.getElement('exerciseFilter');
      
      if (periodSelect) {
        periodSelect.value = 'all';
      }
      
      if (exerciseFilter) {
        exerciseFilter.value = '';
      }

      // Очищаем отображение диапазона дат
      this.updateDateRangeDisplay();
      
      // Перерисовываем историю
      this.loadHistoryData();
      
      logger.success('Filters cleared');
    } catch (error) {
      logger.error('Failed to clear filters:', error);
    }
  }

  /**
   * Переключение календаря
   */
  toggleDatePicker() {
    if (this.isCalendarVisible) {
      this.hideDatePicker();
    } else {
      this.showDatePicker();
    }
  }

  /**
   * Показать календарь
   */
  showDatePicker() {
    try {
      const calendarContainer = dom.getElement('calendarContainer');
      if (calendarContainer) {
        dom.toggleElement(calendarContainer, true);
        this.isCalendarVisible = true;
        this.renderCalendar();
        logger.debug('Date picker shown');
      }
    } catch (error) {
      logger.error('Failed to show date picker:', error);
    }
  }

  /**
   * Скрыть календарь
   */
  hideDatePicker() {
    try {
      const calendarContainer = dom.getElement('calendarContainer');
      if (calendarContainer) {
        dom.toggleElement(calendarContainer, false);
        this.isCalendarVisible = false;
        logger.debug('Date picker hidden');
      }
    } catch (error) {
      logger.error('Failed to hide date picker:', error);
    }
  }

  /**
   * Обновление отображения диапазона дат
   */
  updateDateRangeDisplay() {
    try {
      const dateRangeDisplay = dom.getElement('dateRangeDisplay');
      if (!dateRangeDisplay) return;

      if (this.currentFilters.dateRange) {
        const { startDate, endDate } = this.currentFilters.dateRange;
        const startStr = startDate.toLocaleDateString('ru-RU');
        const endStr = endDate.toLocaleDateString('ru-RU');
        dom.setContent(dateRangeDisplay, `${startStr} - ${endStr}`);
      } else {
        dom.setContent(dateRangeDisplay, 'Выберите период');
      }
    } catch (error) {
      logger.error('Failed to update date range display:', error);
    }
  }

  /**
   * Рендеринг календаря
   */
  renderCalendar() {
    try {
      const calendarContainer = dom.getElement('calendarContainer');
      if (!calendarContainer) return;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let html = '<div class="calendar-header">';
      html += `<button class="calendar-nav" onclick="historyManager.previousMonth()">‹</button>`;
      html += `<span class="calendar-title">${this.getMonthName(currentMonth)} ${currentYear}</span>`;
      html += `<button class="calendar-nav" onclick="historyManager.nextMonth()">›</button>`;
      html += '</div>';

      html += '<div class="calendar-grid">';
      html += '<div class="calendar-weekdays">';
      ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
        html += `<div class="weekday">${day}</div>`;
      });
      html += '</div>';

      html += '<div class="calendar-days">';
      
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = date.toDateString() === now.toDateString();
        const isSelected = this.isDateInRange(date);
        
        let className = 'calendar-day';
        if (!isCurrentMonth) className += ' other-month';
        if (isToday) className += ' today';
        if (isSelected) className += ' selected';
        
        html += `<div class="${className}" data-date="${date.toISOString()}" onclick="historyManager.handleDateClick(event)">
          ${date.getDate()}
        </div>`;
      }
      
      html += '</div></div>';

      dom.setContent(calendarContainer, html, 'html');
      
      logger.debug('Calendar rendered');
    } catch (error) {
      logger.error('Failed to render calendar:', error);
    }
  }

  /**
   * Получение названия месяца
   */
  getMonthName(month) {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month];
  }

  /**
   * Проверка, находится ли дата в выбранном диапазоне
   */
  isDateInRange(date) {
    if (!this.currentFilters.dateRange) return false;
    
    const { startDate, endDate } = this.currentFilters.dateRange;
    return date >= startDate && date <= endDate;
  }

  /**
   * Обработка клика по дате
   */
  handleDateClick(event) {
    try {
      const dayElement = event.target.closest('.calendar-day');
      if (!dayElement) return;

      const dateString = dayElement.getAttribute('data-date');
      if (!dateString) return;

      const clickedDate = new Date(dateString);
      
      if (!this.currentFilters.dateRange) {
        // Начинаем новый диапазон
        this.currentFilters.dateRange = {
          startDate: clickedDate,
          endDate: clickedDate
        };
      } else {
        // Завершаем диапазон
        const { startDate } = this.currentFilters.dateRange;
        
        if (clickedDate < startDate) {
          this.currentFilters.dateRange = {
            startDate: clickedDate,
            endDate: startDate
          };
        } else {
          this.currentFilters.dateRange = {
            startDate: startDate,
            endDate: clickedDate
          };
        }
      }

      this.updateDateRangeDisplay();
      this.renderCalendar();
      
      logger.debug('Date clicked:', clickedDate);
    } catch (error) {
      logger.error('Failed to handle date click:', error);
    }
  }

  /**
   * Предыдущий месяц
   */
  previousMonth() {
    // Здесь будет логика перехода к предыдущему месяцу
    logger.debug('Previous month requested');
  }

  /**
   * Следующий месяц
   */
  nextMonth() {
    // Здесь будет логика перехода к следующему месяцу
    logger.debug('Next month requested');
  }

  /**
   * Рендеринг истории
   */
  renderHistory() {
    this.loadHistoryData();
  }
}

// Создаем единственный экземпляр
export const historyManager = new HistoryManager();

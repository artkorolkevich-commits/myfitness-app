/**
 * Модуль для управления анализом тела
 */

import { logger } from '../utils/logger.js';
import { storage } from './storage.js';
import { dom } from '../utils/dom.js';
import { aiService } from './ai-service.js';
import { yandexAPI } from './yandex-api.js';
import { validator } from '../utils/validator.js';

class BodyAnalysisManager {
  constructor() {
    this.currentPhoto = null;
    this.currentAnalysis = null;
    this.isInitialized = false;
  }

  /**
   * Инициализация менеджера анализа тела
   */
  init() {
    try {
      logger.info('Initializing body analysis manager...');
      
      this.setupEventListeners();
      this.loadAnalysisHistory();
      this.updateProgressCharts();
      
      this.isInitialized = true;
      logger.success('Body analysis manager initialized');
    } catch (error) {
      logger.error('Failed to initialize body analysis manager:', error);
    }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Загрузка фото
    const photoInput = dom.getElement('photoInput');
    const cameraBtn = dom.getElement('cameraBtn');
    const retakeBtn = dom.getElement('retakeBtn');
    
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoSelect(e));
    }
    
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => this.openCamera());
    }
    
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => this.retakePhoto());
    }

    // Анализ
    const analyzeBtn = dom.getElement('analyzeBtn');
    const saveBtn = dom.getElement('saveAnalysisBtn');
    
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.analyzeBody());
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAnalysis());
    }
  }

  /**
   * Обработка выбора фото
   */
  handlePhotoSelect(event) {
    try {
      const file = event.target.files[0];
      if (file) {
        this.handlePhotoFile(file);
      }
    } catch (error) {
      logger.error('Failed to handle photo select:', error);
      this.showAnalysisStatus('Ошибка выбора фото', 'error');
    }
  }

  /**
   * Обработка файла фото
   */
  handlePhotoFile(file) {
    try {
      // Валидируем файл
      const validation = validator.validateImageFile(file);
      if (!validation.isValid) {
        this.showAnalysisStatus(validation.error, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentPhoto = e.target.result;
        this.showPhotoPreview(this.currentPhoto);
        this.showAnalysisStatus('Фото загружено успешно', 'success');
      };
      
      reader.readAsDataURL(file);
      
      logger.debug('Photo file processed');
    } catch (error) {
      logger.error('Failed to handle photo file:', error);
      this.showAnalysisStatus('Ошибка обработки фото', 'error');
    }
  }

  /**
   * Открытие камеры
   */
  openCamera() {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handlePhotoFile(file);
        }
      };
      
      input.click();
      
      logger.debug('Camera opened');
    } catch (error) {
      logger.error('Failed to open camera:', error);
      this.showAnalysisStatus('Ошибка открытия камеры', 'error');
    }
  }

  /**
   * Показать предварительный просмотр фото
   */
  showPhotoPreview(dataUrl) {
    try {
      const preview = dom.getElement('photoPreview');
      if (preview) {
        preview.src = dataUrl;
        dom.toggleElement(preview, true);
      }

      const analyzeBtn = dom.getElement('analyzeBtn');
      if (analyzeBtn) {
        dom.toggleElement(analyzeBtn, true);
      }
      
      logger.debug('Photo preview shown');
    } catch (error) {
      logger.error('Failed to show photo preview:', error);
    }
  }

  /**
   * Переснять фото
   */
  retakePhoto() {
    try {
      this.currentPhoto = null;
      this.currentAnalysis = null;
      
      const preview = dom.getElement('photoPreview');
      if (preview) {
        preview.src = '';
        dom.toggleElement(preview, false);
      }

      const analyzeBtn = dom.getElement('analyzeBtn');
      if (analyzeBtn) {
        dom.toggleElement(analyzeBtn, false);
      }

      const resultsContainer = dom.getElement('analysisResults');
      if (resultsContainer) {
        dom.toggleElement(resultsContainer, false);
      }
      
      logger.debug('Photo retaken');
    } catch (error) {
      logger.error('Failed to retake photo:', error);
    }
  }

  /**
   * Анализ тела
   */
  async analyzeBody() {
    try {
      if (!this.currentPhoto) {
        this.showAnalysisStatus('Сначала загрузите фото', 'warning');
        return;
      }

      this.showAnalysisStatus('Начинаем анализ...', 'info');
      
      // Пытаемся использовать AI
      try {
        this.currentAnalysis = await this.analyzeBodyWithAI(this.currentPhoto);
      } catch (error) {
        logger.warn('AI analysis failed, using simulation:', error);
        this.currentAnalysis = await this.simulateBodyAnalysis(this.currentPhoto);
      }

      this.showAnalysisResults(this.currentAnalysis);
      this.showAnalysisStatus('Анализ завершен', 'success');
      
      logger.success('Body analysis completed');
    } catch (error) {
      logger.error('Failed to analyze body:', error);
      this.showAnalysisStatus('Ошибка анализа', 'error');
    }
  }

  /**
   * Анализ тела с помощью AI
   */
  async analyzeBodyWithAI(photo) {
    try {
      logger.info('Starting AI body analysis...');
      
      const analysis = await aiService.analyzeBodyWithAI(photo);
      
      logger.success('AI analysis completed');
      return analysis;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Симуляция анализа тела
   */
  async simulateBodyAnalysis(photo) {
    try {
      logger.info('Starting simulated body analysis...');
      
      // Имитируем задержку обработки
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = {
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
      
      logger.success('Simulated analysis completed');
      return analysis;
    } catch (error) {
      logger.error('Simulated analysis failed:', error);
      throw error;
    }
  }

  /**
   * Показать результаты анализа
   */
  showAnalysisResults(analysis) {
    try {
      const resultsContainer = dom.getElement('analysisResults');
      if (!resultsContainer) return;

      const fitnessLevelText = {
        'beginner': 'Начинающий',
        'intermediate': 'Средний',
        'advanced': 'Продвинутый'
      };

      const healthText = {
        'good': 'Хорошее',
        'average': 'Среднее',
        'poor': 'Плохое'
      };

      let html = `
        <div class="analysis-result">
          <h3>Результаты анализа</h3>
          <div class="result-grid">
            <div class="result-item">
              <span class="result-label">Процент жира:</span>
              <span class="result-value">${analysis.bodyFatPercentage}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">Мышечная масса:</span>
              <span class="result-value">${analysis.muscleMass}%</span>
            </div>
            <div class="result-item">
              <span class="result-label">Уровень фитнеса:</span>
              <span class="result-value">${fitnessLevelText[analysis.fitnessLevel] || analysis.fitnessLevel}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Общее здоровье:</span>
              <span class="result-value">${healthText[analysis.overallHealth] || analysis.overallHealth}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Уверенность:</span>
              <span class="result-value">${analysis.confidence}%</span>
            </div>
          </div>
          <div class="analysis-notes">
            <p><strong>Примечания:</strong> ${analysis.notes}</p>
          </div>
        </div>
      `;

      dom.setContent(resultsContainer, html, 'html');
      dom.toggleElement(resultsContainer, true);

      // Показываем кнопку сохранения
      const saveBtn = dom.getElement('saveAnalysisBtn');
      if (saveBtn) {
        dom.toggleElement(saveBtn, true);
      }
      
      logger.debug('Analysis results shown');
    } catch (error) {
      logger.error('Failed to show analysis results:', error);
    }
  }

  /**
   * Сохранение анализа
   */
  async saveAnalysis() {
    try {
      if (!this.currentAnalysis) {
        this.showAnalysisStatus('Нет данных для сохранения', 'warning');
        return;
      }

      this.showAnalysisStatus('Сохранение анализа...', 'info');
      
      // Сохраняем локально
      this.saveAnalysisToLocal(this.currentAnalysis);
      
      // Сохраняем фото в Yandex.Disk если подключен
      if (this.currentPhoto && yandexAPI.isAuthenticated) {
        try {
          await this.savePhotoToYandex(this.currentPhoto);
          await this.saveAnalysisToYandex(this.currentAnalysis);
        } catch (error) {
          logger.warn('Failed to save to Yandex.Disk:', error);
        }
      }

      this.showAnalysisStatus('Анализ сохранен успешно', 'success');
      
      // Обновляем историю и графики
      this.loadAnalysisHistory();
      this.updateProgressCharts();
      
      logger.success('Analysis saved');
    } catch (error) {
      logger.error('Failed to save analysis:', error);
      this.showAnalysisStatus('Ошибка сохранения', 'error');
    }
  }

  /**
   * Сохранение фото в Yandex.Disk
   */
  async savePhotoToYandex(photo) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const photoPath = `/MyFitness/photos/body_photo_${timestamp}.jpg`;
      
      // Конвертируем base64 в Blob
      const response = await fetch(photo);
      const blob = await response.blob();
      
      await yandexAPI.uploadFile(photoPath, blob, 'image/jpeg');
      
      logger.success('Photo saved to Yandex.Disk');
    } catch (error) {
      logger.error('Failed to save photo to Yandex.Disk:', error);
      throw error;
    }
  }

  /**
   * Сохранение анализа в Yandex.Disk
   */
  async saveAnalysisToYandex(analysis) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const analysisPath = `/MyFitness/analyses/body_analysis_${timestamp}.json`;
      
      const analysisData = JSON.stringify(analysis, null, 2);
      await yandexAPI.uploadFile(analysisPath, analysisData, 'application/json');
      
      logger.success('Analysis saved to Yandex.Disk');
    } catch (error) {
      logger.error('Failed to save analysis to Yandex.Disk:', error);
      throw error;
    }
  }

  /**
   * Сохранение анализа локально
   */
  saveAnalysisToLocal(analysis) {
    try {
      storage.addBodyAnalysis(analysis);
      logger.debug('Analysis saved locally');
    } catch (error) {
      logger.error('Failed to save analysis locally:', error);
      throw error;
    }
  }

  /**
   * Загрузка истории анализов
   */
  loadAnalysisHistory() {
    try {
      const analyses = storage.loadBodyAnalyses();
      this.renderAnalysisHistory(analyses);
      
      logger.debug('Analysis history loaded:', analyses.length);
    } catch (error) {
      logger.error('Failed to load analysis history:', error);
    }
  }

  /**
   * Рендеринг истории анализов
   */
  renderAnalysisHistory(analyses) {
    try {
      const historyContainer = dom.getElement('analysisHistory');
      if (!historyContainer) return;

      if (analyses.length === 0) {
        dom.setContent(historyContainer, '<p>История анализов пуста</p>');
        return;
      }

      let html = '<div class="analysis-history">';
      html += '<h3>История анализов</h3>';
      
      analyses.slice(0, 5).forEach(analysis => {
        const date = new Date(analysis.timestamp).toLocaleDateString('ru-RU');
        html += `
          <div class="history-item">
            <div class="history-date">${date}</div>
            <div class="history-data">
              <span>Жир: ${analysis.bodyFatPercentage}%</span>
              <span>Мышцы: ${analysis.muscleMass}%</span>
              <span>Уровень: ${analysis.fitnessLevel}</span>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      dom.setContent(historyContainer, html, 'html');
      
      logger.debug('Analysis history rendered');
    } catch (error) {
      logger.error('Failed to render analysis history:', error);
    }
  }

  /**
   * Обновление графиков прогресса
   */
  updateProgressCharts() {
    try {
      const analyses = storage.loadBodyAnalyses();
      if (analyses.length === 0) return;

      const chartData = this.prepareChartData(analyses);
      this.createFatProgressChart(chartData);
      this.updateChartStats(chartData);
      
      logger.debug('Progress charts updated');
    } catch (error) {
      logger.error('Failed to update progress charts:', error);
    }
  }

  /**
   * Подготовка данных для графиков
   */
  prepareChartData(analyses) {
    try {
      return analyses
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(analysis => ({
          date: new Date(analysis.timestamp),
          bodyFat: analysis.bodyFatPercentage,
          muscleMass: analysis.muscleMass,
          fitnessLevel: analysis.fitnessLevel
        }));
    } catch (error) {
      logger.error('Failed to prepare chart data:', error);
      return [];
    }
  }

  /**
   * Создание графика прогресса жира
   */
  createFatProgressChart(chartData) {
    try {
      const canvas = dom.getElement('fatProgressChart');
      if (!canvas || chartData.length === 0) return;

      const ctx = canvas.getContext('2d');
      
      // Уничтожаем предыдущий график если есть
      if (window.fatProgressChart) {
        window.fatProgressChart.destroy();
      }

      window.fatProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.map(d => d.date.toLocaleDateString('ru-RU')),
          datasets: [{
            label: 'Процент жира (%)',
            data: chartData.map(d => d.bodyFat),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 50
            }
          }
        }
      });
      
      logger.debug('Fat progress chart created');
    } catch (error) {
      logger.error('Failed to create fat progress chart:', error);
    }
  }

  /**
   * Обновление статистики графиков
   */
  updateChartStats(chartData) {
    try {
      if (chartData.length === 0) return;

      const latest = chartData[chartData.length - 1];
      const first = chartData[0];
      
      const stats = {
        currentFat: latest.bodyFat,
        fatChange: latest.bodyFat - first.bodyFat,
        monthlyChange: this.calculateMonthlyChange(chartData)
      };

      // Обновляем элементы статистики
      Object.entries(stats).forEach(([key, value]) => {
        const element = dom.getElement(key);
        if (element) {
          if (typeof value === 'number') {
            dom.setContent(element, `${value > 0 ? '+' : ''}${value.toFixed(1)}%`);
          } else {
            dom.setContent(element, value.toString());
          }
        }
      });
      
      logger.debug('Chart stats updated');
    } catch (error) {
      logger.error('Failed to update chart stats:', error);
    }
  }

  /**
   * Расчет месячного изменения
   */
  calculateMonthlyChange(chartData) {
    try {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const recentData = chartData.filter(d => d.date >= monthAgo);
      if (recentData.length < 2) return 0;
      
      const first = recentData[0];
      const last = recentData[recentData.length - 1];
      
      return last.bodyFat - first.bodyFat;
    } catch (error) {
      logger.error('Failed to calculate monthly change:', error);
      return 0;
    }
  }

  /**
   * Показать статус анализа
   */
  showAnalysisStatus(message, type = 'info') {
    logger.info(`Body Analysis Status [${type}]:`, message);
    
    // Создаем элемент статуса
    const statusEl = dom.createElement('div', {
      className: `analysis-status analysis-status-${type}`,
      textContent: message
    });

    // Добавляем в контейнер статусов
    const container = dom.getElement('analysisStatusContainer') || document.body;
    container.appendChild(statusEl);

    // Удаляем через 3 секунды
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.parentNode.removeChild(statusEl);
      }
    }, 3000);
  }
}

// Создаем единственный экземпляр
export const bodyAnalysisManager = new BodyAnalysisManager();

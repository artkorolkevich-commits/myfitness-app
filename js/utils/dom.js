/**
 * Модуль для безопасной работы с DOM
 */

import { logger } from './logger.js';

class DOMUtils {
  /**
   * Безопасно устанавливает содержимое элемента
   */
  setContent(element, content, type = 'text') {
    if (!element) {
      logger.warn('DOMUtils.setContent: element is null');
      return false;
    }

    try {
      switch (type) {
        case 'text':
          element.textContent = content;
          break;
        case 'html':
          // Для HTML используем безопасный метод
          this.setInnerHTML(element, content);
          break;
        case 'append':
          element.appendChild(content);
          break;
        default:
          element.textContent = content;
      }
      return true;
    } catch (error) {
      logger.error('DOMUtils.setContent failed:', error);
      return false;
    }
  }

  /**
   * Безопасно устанавливает HTML содержимое
   */
  setInnerHTML(element, html) {
    if (!element) return false;

    try {
      // Простая проверка на потенциально опасные теги
      const dangerousTags = ['script', 'iframe', 'object', 'embed'];
      const hasDangerousTags = dangerousTags.some(tag => 
        html.toLowerCase().includes(`<${tag}`)
      );

      if (hasDangerousTags) {
        logger.warn('DOMUtils.setInnerHTML: potentially dangerous HTML detected');
        element.textContent = html; // Fallback to text
        return false;
      }

      element.innerHTML = html;
      return true;
    } catch (error) {
      logger.error('DOMUtils.setInnerHTML failed:', error);
      element.textContent = html; // Fallback to text
      return false;
    }
  }

  /**
   * Создает элемент с атрибутами
   */
  createElement(tag, attributes = {}, content = null) {
    try {
      const element = document.createElement(tag);
      
      // Устанавливаем атрибуты
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'textContent') {
          element.textContent = value;
        } else if (key === 'innerHTML') {
          this.setInnerHTML(element, value);
        } else {
          element.setAttribute(key, value);
        }
      });

      // Устанавливаем содержимое
      if (content) {
        if (typeof content === 'string') {
          element.textContent = content;
        } else if (content instanceof Node) {
          element.appendChild(content);
        } else if (Array.isArray(content)) {
          content.forEach(item => {
            if (item instanceof Node) {
              element.appendChild(item);
            } else {
              element.textContent += item;
            }
          });
        }
      }

      return element;
    } catch (error) {
      logger.error('DOMUtils.createElement failed:', error);
      return null;
    }
  }

  /**
   * Создает таблицу из данных
   */
  createTable(headers, data, options = {}) {
    try {
      const table = this.createElement('table', options.tableAttributes || {});
      const thead = this.createElement('thead');
      const tbody = this.createElement('tbody');

      // Создаем заголовки
      const headerRow = this.createElement('tr');
      headers.forEach(header => {
        const th = this.createElement('th', {}, header);
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      // Создаем строки данных
      data.forEach(rowData => {
        const row = this.createElement('tr');
        headers.forEach(header => {
          const cellContent = rowData[header] || '';
          const td = this.createElement('td', {}, cellContent);
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      return table;
    } catch (error) {
      logger.error('DOMUtils.createTable failed:', error);
      return null;
    }
  }

  /**
   * Создает список из массива
   */
  createList(items, type = 'ul', options = {}) {
    try {
      const list = this.createElement(type, options.listAttributes || {});
      
      items.forEach(item => {
        const li = this.createElement('li', options.itemAttributes || {});
        
        if (typeof item === 'string') {
          li.textContent = item;
        } else if (item instanceof Node) {
          li.appendChild(item);
        } else if (typeof item === 'object') {
          // Если item - объект с text и attributes
          if (item.text) {
            li.textContent = item.text;
          }
          if (item.attributes) {
            Object.entries(item.attributes).forEach(([key, value]) => {
              li.setAttribute(key, value);
            });
          }
        }
        
        list.appendChild(li);
      });

      return list;
    } catch (error) {
      logger.error('DOMUtils.createList failed:', error);
      return null;
    }
  }

  /**
   * Создает форму из конфигурации
   */
  createForm(fields, options = {}) {
    try {
      const form = this.createElement('form', options.formAttributes || {});
      
      fields.forEach(field => {
        const fieldContainer = this.createElement('div', { className: 'form-group' });
        
        if (field.label) {
          const label = this.createElement('label', { for: field.name }, field.label);
          fieldContainer.appendChild(label);
        }

        const input = this.createElement(field.type || 'input', {
          id: field.name,
          name: field.name,
          type: field.inputType || 'text',
          placeholder: field.placeholder || '',
          required: field.required || false,
          ...field.attributes
        });

        fieldContainer.appendChild(input);
        form.appendChild(fieldContainer);
      });

      return form;
    } catch (error) {
      logger.error('DOMUtils.createForm failed:', error);
      return null;
    }
  }

  /**
   * Очищает содержимое элемента
   */
  clearElement(element) {
    if (!element) return false;

    try {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      return true;
    } catch (error) {
      logger.error('DOMUtils.clearElement failed:', error);
      return false;
    }
  }

  /**
   * Показывает/скрывает элемент
   */
  toggleElement(element, show = true) {
    if (!element) return false;

    try {
      element.style.display = show ? '' : 'none';
      return true;
    } catch (error) {
      logger.error('DOMUtils.toggleElement failed:', error);
      return false;
    }
  }

  /**
   * Добавляет/удаляет классы
   */
  toggleClass(element, className, add = true) {
    if (!element) return false;

    try {
      if (add) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
      return true;
    } catch (error) {
      logger.error('DOMUtils.toggleClass failed:', error);
      return false;
    }
  }

  /**
   * Безопасно получает элемент по ID
   */
  getElement(id) {
    try {
      const element = document.getElementById(id);
      if (!element) {
        logger.warn(`DOMUtils.getElement: element with id "${id}" not found`);
      }
      return element;
    } catch (error) {
      logger.error('DOMUtils.getElement failed:', error);
      return null;
    }
  }

  /**
   * Безопасно получает элементы по селектору
   */
  getElements(selector) {
    try {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements);
    } catch (error) {
      logger.error('DOMUtils.getElements failed:', error);
      return [];
    }
  }
}

// Создаем единственный экземпляр
export const dom = new DOMUtils();

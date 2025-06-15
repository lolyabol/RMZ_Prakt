import { format } from 'date-fns';

export const hbsHelpers = (hbs) => {
  hbs.registerHelper('formatDate', (date) => {
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm');
    } catch {
      return '';
    }
  });

  hbs.registerHelper('truncate', (str, len) => {
    if (!str) return '';
    if (str.length > len) {
      return str.substring(0, len) + '...';
    }
    return str;
  });

  hbs.registerHelper('eq', function (a, b, options) {
    if (typeof options.fn !== 'function') {
      return a === b;
    }
    return a === b ? options.fn(this) : (typeof options.inverse === 'function' ? options.inverse(this) : '');
  });
  

  hbs.registerHelper('gt', (a, b) => a > b);
  hbs.registerHelper('lt', (a, b) => a < b);
  hbs.registerHelper('add', (a, b) => a + b);
  hbs.registerHelper('subtract', (a, b) => a - b);

  hbs.registerHelper('json', (context) => JSON.stringify(context));

  hbs.registerHelper('formatFileSize', (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  });

  hbs.registerHelper('length', (obj) => {
    if (!obj) return 0;
    return Object.keys(obj).length;
  });

  hbs.registerHelper('keys', (obj) => {
    return obj ? Object.keys(obj) : [];
  });

  hbs.registerHelper('currentYear', () => {
    return new Date().getFullYear();
  });

  hbs.registerHelper('paginationRange', function (currentPage, totalPages, maxVisible = 5) {
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (end - start < maxVisible - 1) {
      if (start === 1) {
        end = Math.min(start + maxVisible - 1, totalPages);
      } else if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
    }

    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  });

  hbs.registerHelper('formatDate', function(date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return ''; // Return empty string if invalid date
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parsedDate);
  });
  

  hbs.registerHelper('encodeURIComponent', function (str) {
    return encodeURIComponent(str);
  });
  hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  hbs.registerHelper('queryString', function (params) {
    const searchParams = new URLSearchParams(params || {});
    return searchParams.toString();
  });
  
};

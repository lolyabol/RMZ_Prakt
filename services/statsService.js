import { format, parseISO } from 'date-fns';

export default class StatsService {
  getStats(data) {
    if (data.length === 0) return {};
    
    const userStats = this._calculateStats(data, 'user');
    const printerStats = this._calculateStats(data, 'printer');
    const clientStats = this._calculateStats(data, 'client');
    
    const totalPages = data.reduce((sum, item) => sum + (item.pages * item.copies), 0);
    const totalJobs = data.length;
    const duplexUsage = data.filter(item => item.duplex).length;
    const grayscaleUsage = data.filter(item => item.grayscale).length;
    
    return {
      userStats,
      printerStats,
      clientStats,
      totalPages,
      totalJobs,
      duplexUsage,
      grayscaleUsage,
      dateRange: this._getDateRange(data)
    };
  }

  _calculateStats(data, field) {
    return data.reduce((acc, item) => {
      const key = item[field];
      if (!acc[key]) {
        acc[key] = { pages: 0, jobs: 0 };
      }
      acc[key].pages += item.pages * item.copies;
      acc[key].jobs += 1;
      return acc;
    }, {});
  }

_getDateRange(data) {
  const dates = data
    .map(item => item.time)
    .filter(date => date instanceof Date && !isNaN(date)); 

  if (dates.length === 0) {
    return { start: null, end: null };
  }

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    start: format(minDate, 'yyyy-MM-dd'),
    end: format(maxDate, 'yyyy-MM-dd')
  };
}


  filterData(data, filters) {
    return data.filter(item => {
      const itemDate = item.time;
      const start = filters.startDate ? parseISO(filters.startDate) : new Date(0);
      const end = filters.endDate ? parseISO(filters.endDate) : new Date();
      
      return itemDate >= start && itemDate <= end &&
             (!filters.user || item.user === filters.user) &&
             (!filters.printer || item.printer === filters.printer) &&
             (!filters.client || item.client === filters.client);
    });
  }

  getUniqueValues(data, field) {
    return [...new Set(data.map(item => item[field]))].filter(Boolean);
  }
}
import StatsService from '../services/statsService.js';

export default class AnalyticsController {
  constructor() {
    this.statsService = new StatsService();
  }

  async showAnalytics(req, res) {
    try {
      const { period = 'week', printer = 'all' } = req.query;
      
      const printData = await this.getPrintData(period, printer);
      
      const stats = this.statsService.getStats(printData);
      const charts = this.prepareChartData(stats);
      
      res.render('analyticsView', {
        title: 'Аналитика печати',
        period,
        printer,
        stats,
        charts
      });
    } catch (error) {
      res.status(500).render('error', { error: 'Ошибка генерации аналитики' });
    }
  }

  prepareChartData(stats) {
    return {
      byUser: {
        labels: Object.keys(stats.userStats),
        data: Object.values(stats.userStats).map(u => u.pages)
      },
      byPrinter: {
        labels: Object.keys(stats.printerStats),
        data: Object.values(stats.printerStats).map(p => p.pages)
      },
      timeline: this.generateTimelineData(stats)
    };
  }

  async getPrintData(period, printer) {
    return []; 
  }
}
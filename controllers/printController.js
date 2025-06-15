export default class PrintController {
    constructor(reportParserService, statsService) {
      this.reportParser = reportParserService;
      this.statsService = statsService;
    }
  
    async dashboard(req, res) {
      const printData = this.reportParser.getPrintRecords();
      const filters = req.query;
      
      const filteredData = this.statsService.filterData(printData, filters);
      const stats = this.statsService.getStats(filteredData);
      
      res.render('dashboard', {
        title: 'Print Dashboard',
        stats,
        filteredData,
        filters,
        printers: this.statsService.getUniqueValues(printData, 'printer'),
        users: this.statsService.getUniqueValues(printData, 'user'),
        clients: this.statsService.getUniqueValues(printData, 'client')
      });
    }
  }
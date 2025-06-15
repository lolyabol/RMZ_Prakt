import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class HomeController {
  constructor(reportParserService, statsService) {
    this.reportParser = reportParserService;
    this.statsService = statsService;
    this.reportsDir = path.join(__dirname, '../reports');
  }

  async index(req, res) {
    try {
      const printData = this.reportParser.getPrintRecords();
      const stats = this.statsService.getStats(printData);
      const reportFiles = this._getReportFiles();

      res.render('index', {
        title: 'Print Analytics',
        stats,
        recent: printData.slice(-10).reverse(),
        printers: this.statsService.getUniqueValues(printData, 'printer'),
        users: this.statsService.getUniqueValues(printData, 'user'),
        clients: this.statsService.getUniqueValues(printData, 'client'),
        reportFiles
      });
    } catch (error) {
      console.error('Error in index:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async uploadReport(req, res) {
    try {
      if (!req.file) {
        return res.status(400).render('error', { error: 'Файл не был загружен или не тот формат' });
      }

      await this.reportParser.parseReports();

      res.redirect('/');
    } catch (err) {
      console.error('Error in uploadReport:', err);
      res.status(500).render('error', { error: 'Ошибка при загрузке файла' });
    }
  }

  _getReportFiles() {
    try {
      return fs.readdirSync(this.reportsDir, { withFileTypes: true })
        .filter(file => file.isFile() && /\.(csv|xlsx|xlsm)$/i.test(file.name))
        .map(file => {
          const fullPath = path.join(this.reportsDir, file.name);
          const stats = fs.statSync(fullPath);
          return {
            name: file.name,
            path: `/reports/${encodeURIComponent(file.name)}`,
            uploadDate: stats.mtime
          };
        });
    } catch (err) {
      console.error('Error reading reports directory:', err);
      return [];
    }
  }
}

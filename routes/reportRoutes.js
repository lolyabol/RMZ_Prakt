import express from 'express';
import ReportController from '../controllers/ReportController.js';

export default function reportRoutes(reportParserService) {
  const router = express.Router();
  const controller = new ReportController(reportParserService);

  router.get('/', controller.listReports);
  router.get('/entries/all', controller.listAllEntries);
  router.get('/entries/filter', controller.filteredEntries);
  router.get('/search-suggestions', controller.searchSuggestions);
  router.get('/debug', controller.debugInfo);

  return router;
}
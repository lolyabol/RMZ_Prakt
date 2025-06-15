export default class ReportController {
  constructor(reportParserService) {
    this.reportParserService = reportParserService;
  }

  listReports = async (req, res) => {
    try {
      const reports = this.reportParserService.getParsedReports();
      const { users, computers, printers } = this.reportParserService.getAllUniqueValues();
      
      const documents = [...new Set(
        reports.flatMap(r => r.data.map(e => e.DocumentName)).filter(Boolean)
      )];
  
      res.render('index', {
        title: 'Список отчётов',
        reports,
        users,
        computers,
        printers,
        documents, // ✅ добавлено
        selected: {}
      });
    } catch (error) {
      console.error('❌ Ошибка в listReports:', error.message);
      res.status(500).send('Ошибка при загрузке отчётов');
    }
  };
  

  listAllEntries = async (req, res) => {
    try {
      const allEntries = this.reportParserService.getAllEntries();
      res.render('entries', {
        title: 'Все записи',
        entries: allEntries
      });
    } catch (error) {
      console.error('❌ Ошибка в listAllEntries:', error.message);
      res.status(500).send('Ошибка при получении всех записей');
    }
  }

  filteredEntries = async (req, res) => {
    try {
      const { user, computer, printer, DocumentName, dateFrom, dateTo, page = 1, sort = '' } = req.query;
      const allEntries = this.reportParserService.getAllEntries();

      const users = [...new Set(allEntries.map(e => e.user).filter(Boolean))];
      const computers = [...new Set(allEntries.map(e => e.client).filter(Boolean))];
      const printers = [...new Set(allEntries.map(e => e.printer).filter(Boolean))];
      const documents = [...new Set(allEntries.map(e => e.DocumentName).filter(Boolean))];
  
      // Фильтрация
      let filtered = allEntries.filter(entry => {
        if (user && entry.User !== user) return false;
        if (computer && entry.Client !== computer) return false;
        if (printer && entry.Printer !== printer) return false;
        if (DocumentName && entry.DocumentName !== DocumentName) return false;
        if (dateFrom && new Date(entry.Time) < new Date(dateFrom)) return false;
        if (dateTo && new Date(entry.Time) > new Date(dateTo)) return false;
        return true;
      });
      
  
      // Сортировка
      switch (sort) {
        case 'date_asc':
          filtered.sort((a, b) => new Date(a.Time) - new Date(b.Time));
          break;
        case 'date_desc':
          filtered.sort((a, b) => new Date(b.Time) - new Date(a.Time));
          break;
        case 'pages_asc':
          filtered.sort((a, b) => (parseInt(a.Pages) || 0) - (parseInt(b.Pages) || 0));
          break;
        case 'pages_desc':
          filtered.sort((a, b) => (parseInt(b.Pages) || 0) - (parseInt(a.Pages) || 0));
          break;
      }
  
      // Пагинация
      const currentPage = parseInt(page) || 1;
      const pageSize = 20;
      const totalPages = Math.ceil(filtered.length / pageSize);
      const paginatedEntries = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
      res.render('filteredEntries', {
        entries: paginatedEntries,
        allEntries: filtered,
        pagination: {
          currentPage,
          totalPages,
          query: req.query
        },
        users,
        computers,
        printers,
        documents,
        selectedSort: sort,
        selected: req.query
      });
  
    } catch (error) {
      console.error('❌ Ошибка в filteredEntries:', error.message);
      res.status(500).send('Ошибка при фильтрации записей');
    }
  }
  debugInfo = async (req, res) => {
    try {
      const debugInfo = this.reportParserService.getDebugInfo();
      res.render('debug', {
        title: 'Отладочная информация',
        debugInfo,
        reports: this.reportParserService.getParsedReports()
      });
    } catch (error) {
      console.error('❌ Ошибка в debugInfo:', error.message);
      res.status(500).send('Ошибка при получении отладочной информации');
    }
  }
  searchSuggestions = async (req, res) => {
    try {
      const { field, query } = req.query;
      const allEntries = this.reportParserService.getAllEntries();
      
      if (!field || !query) {
        return res.json([]);
      }
      
      let suggestions = [];
      const searchFields = {
        'user': 'User',
        'computer': 'Client',
        'printer': 'Printer',
        'document': 'DocumentName'
      };
      
      if (searchFields[field]) {
        const fieldName = searchFields[field];
        suggestions = [...new Set(
          allEntries
            .map(e => e[fieldName])
            .filter(val => val && val.toLowerCase().includes(query.toLowerCase()))
        )].slice(0, 10);
      }
      
      res.json(suggestions);
    } catch (error) {
      console.error('❌ Ошибка в searchSuggestions:', error);
      res.status(500).json([]);
    }
  }
}
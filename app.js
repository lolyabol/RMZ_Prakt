import express from 'express';
import path from 'path';
import reportRoutes from './routes/reportRoutes.js';
import ReportParserService from './services/reportParserService.js';
import StatsService from './services/statsService.js';
import hbs from 'hbs';
import { connectToMongo } from './db/mongoose.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hbsHelpers } from './helpers/hbsHelpers.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // импортируйте ваш auth маршрутизатор
import cookieParser from 'cookie-parser';
import { authGuard } from './middlewares/authGuard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(authGuard);

// Настройка view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.localsAsTemplateData(app);
app.locals.layout = '/layouts/main';
hbsHelpers(hbs);

// Статические файлы
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Обработка CSS файлов
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

// Инициализация сервисов
const reportsDir = process.env.REPORTS_DIR;
const reportParserService = new ReportParserService(reportsDir);
const statsService = new StatsService();

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
// Подключение маршрутов отчетов по пути /reports
app.use('/reports', reportRoutes(reportParserService));

app.use('/auth', authRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).render('error', { error: err.message || 'Internal Server Error' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectToMongo();

    const parsed = reportParserService.parseReports();
    reportParserService.parsedReports = parsed;

    app.listen(PORT, () => {
      console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Ошибка запуска сервера:', err);
  }
}

start();
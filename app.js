import express from 'express';
import path from 'path';
import reportRoutes from './routes/reportRoutes.js';
import ReportParserService from './services/reportParserService.js';
import hbs from 'hbs';
import { connectToMongo } from './db/mongoose.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { hbsHelpers } from './helpers/hbsHelpers.js';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; 
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

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.localsAsTemplateData(app);
app.locals.layout = '/layouts/main';
hbsHelpers(hbs);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

const reportsDir = process.env.REPORTS_DIR;
const reportParserService = new ReportParserService(reportsDir);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
app.use('/reports', reportRoutes(reportParserService));

app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).render('error', { error: err.message || 'Internal Server Error' });
});

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
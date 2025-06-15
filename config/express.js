import express from 'express';
import hbs from 'hbs';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import { hbsHelpers } from '../helpers/hbsHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, '../views'));
  hbs.registerPartials(path.join(__dirname, '../views/partials'));
  
  hbsHelpers(hbs);

  app.use(express.static(path.join(__dirname, '../public')));
  app.use(fileUpload());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
  });
};
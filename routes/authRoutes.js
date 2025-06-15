import express from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

router.get('/', (req, res) => {
  res.redirect('/auth/login');
});

router.get('/login', (req, res) => authController.showLogin(req, res));

router.post('/login', async (req, res) => {
  await authController.login(req, res);
});

router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
// src/controllers/AuthController.js
import { users } from '../models/users.js';
import bcrypt from 'bcrypt';

export class AuthController {
  
  showLogin(req, res) {
    res.render('login');
  }

  async login(req, res) {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        res.cookie('userId', user.id, { httpOnly: true });
        return res.redirect('/reports');
      }
    }
    res.render('login', { error: 'Неверное имя пользователя или пароль' });
  }

  logout(req, res) {
    res.clearCookie('userId');
    res.redirect('/login');
  }

  async ensureAuthenticated(req, res, next) {
    const userId = req.cookies.userId;
    if (userId && users.some(u => u.id == userId)) {
      return next();
    } else {
      return res.redirect('/login');
    }
  }
}
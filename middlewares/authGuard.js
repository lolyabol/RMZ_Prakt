import { users } from '../models/users.js';

export function authGuard(req, res, next) {
  const publicPaths = ['/auth/login', '/auth/logout'];
  const isStatic = req.url.startsWith('/public') || req.url.startsWith('/reports');

  if (publicPaths.includes(req.path) || isStatic) {
    return next();
  }

  const userId = req.cookies.userId;
  if (userId && users.some(u => u.id == userId)) {
    return next(); 
  }

  return res.redirect('/auth/login'); 
}

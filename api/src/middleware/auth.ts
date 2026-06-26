import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Unauthorised. Invalid or expired token.' });
    return;
  }

  req.user = data.user;
  next();
};
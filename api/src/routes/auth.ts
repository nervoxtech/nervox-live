import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// ─────────────────────────────────────────
// CHECK USERNAME AVAILABILITY
// GET /api/v1/auth/username/check/:username
// ─────────────────────────────────────────
router.get('/username/check/:username', async (req: Request, res: Response): Promise<void> => {
  let username = req.params.username.trim().toLowerCase();

  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }

  if (!username || username.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters.' });
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', `${username}@nervox.live`)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Error checking username.' });
    return;
  }

  if (data) {
    res.status(200).json({ available: false, message: 'Username already taken. Try another.' });
    return;
  }

  res.status(200).json({ available: true, message: 'Username is available.' });
});

// ─────────────────────────────────────────
// SIGNUP
// POST /api/v1/auth/signup
// ─────────────────────────────────────────
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  let { name, username, user_type, email, mobile, password } = req.body;

  if (!name || !username || !user_type || !email || !mobile || !password) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  if (!['individual', 'organisation'].includes(user_type)) {
    res.status(400).json({ error: 'user_type must be individual or organisation.' });
    return;
  }

  // normalise username
  username = username.trim().toLowerCase();
  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }
  const fullUsername = `${username}@nervox.live`;

  // check username availability
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', fullUsername)
    .maybeSingle();

  if (existingUser) {
    res.status(409).json({ error: 'Username already taken. Try another.' });
    return;
  }

  // create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    res.status(400).json({ error: authError?.message || 'Error creating account.' });
    return;
  }

  // insert into public.users
  const { error: insertError } = await supabase.from('users').insert({
    id: authData.user.id,
    name,
    username: fullUsername,
    user_type,
    email,
    mobile,
  });

  if (insertError) {
    // rollback auth user if insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    res.status(500).json({ error: 'Error creating user profile.' });
    return;
  }

  // sign in to get JWT
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.session) {
    res.status(500).json({ error: 'Account created but login failed. Please login manually.' });
    return;
  }

  res.status(201).json({
    message: 'Account created successfully.',
    token: signInData.session.access_token,
    user: {
      id: authData.user.id,
      name,
      username: fullUsername,
      user_type,
      email,
      mobile,
    },
  });
});

// ─────────────────────────────────────────
// LOGIN
// POST /api/v1/auth/login
// ─────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  let { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  // normalise username
  username = username.trim().toLowerCase();
  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }
  const fullUsername = `${username}@nervox.live`;

  // resolve username to email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('username', fullUsername)
    .maybeSingle();

  if (userError || !userData) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  // sign in with email and password
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.email,
    password,
  });

  if (signInError || !signInData.session) {
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  res.status(200).json({
    message: 'Login successful.',
    token: signInData.session.access_token,
    user: {
      id: signInData.user.id,
      username: fullUsername,
    },
  });
});

export default router;
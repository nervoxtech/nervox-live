import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─────────────────────────────────────────
// GET USER PROFILE
// GET /api/v1/users/:username
// ─────────────────────────────────────────
router.get('/:username', requireAuth, async (req: Request, res: Response): Promise<void> => {
  let username = req.params.username.trim().toLowerCase();

  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }
  const fullUsername = `${username}@nervox.live`;

  const { data, error } = await supabase
    .from('users')
    .select('id, name, username, user_type, email, mobile, created_at')
    .eq('username', fullUsername)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Error retrieving user profile.' });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.status(200).json({ user: data });
});

// ─────────────────────────────────────────
// EDIT USER PROFILE
// PATCH /api/v1/users/:username
// ─────────────────────────────────────────
router.patch('/:username', requireAuth, async (req: Request, res: Response): Promise<void> => {
  let username = req.params.username.trim().toLowerCase();

  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }
  const fullUsername = `${username}@nervox.live`;

  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('id, email')
    .eq('username', fullUsername)
    .maybeSingle();

  if (currentUserError || !currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (currentUser.id !== req.user?.id) {
    res.status(403).json({ error: 'You can only edit your own profile.' });
    return;
  }

  const { name, email, mobile } = req.body;
  const updates: Record<string, string> = {};

  if (name) updates.name = name;
  if (mobile) updates.mobile = mobile;

  if (email && email !== currentUser.email) {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      res.status(409).json({ error: 'Email already in use by another account.' });
      return;
    }

    const { error: authEmailError } = await supabase.auth.admin.updateUserById(
      currentUser.id,
      { email }
    );

    if (authEmailError) {
      res.status(500).json({ error: 'Error updating email.' });
      return;
    }

    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No valid fields provided to update.' });
    return;
  }

  const { data: updatedUser, error: updateError } = await (supabase
    .from('users')
    .update(updates)
    .eq('username', fullUsername)
    .select('id, name, username, user_type, email, mobile, created_at')
    .maybeSingle() as any);

  if (updateError) {
    res.status(500).json({ error: 'Error updating profile.' });
    return;
  }

  res.status(200).json({
    message: 'Profile updated successfully.',
    user: updatedUser,
  });
});

// ─────────────────────────────────────────
// CHANGE PASSWORD
// PATCH /api/v1/users/:username/password
// ─────────────────────────────────────────
router.patch('/:username/password', requireAuth, async (req: Request, res: Response): Promise<void> => {
  let username = req.params.username.trim().toLowerCase();

  if (username.endsWith('@nervox.live')) {
    username = username.replace('@nervox.live', '');
  }
  const fullUsername = `${username}@nervox.live`;

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  if (new_password.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }

  // get user email
  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('id, email')
    .eq('username', fullUsername)
    .maybeSingle();

  if (currentUserError || !currentUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (currentUser.id !== req.user?.id) {
    res.status(403).json({ error: 'You can only change your own password.' });
    return;
  }

  // verify current password by signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
    password: current_password,
  });

  if (signInError) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  // update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    currentUser.id,
    { password: new_password }
  );

  if (updateError) {
    res.status(500).json({ error: 'Error updating password.' });
    return;
  }

  res.status(200).json({ message: 'Password updated successfully.' });
});

export default router;
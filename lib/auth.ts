import { createClient } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signInWithMagicLink(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
